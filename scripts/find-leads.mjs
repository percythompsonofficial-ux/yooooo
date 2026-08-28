#!/usr/bin/env node
//
// find-leads.mjs -- sweep Google Places for businesses that have a phone
// number but NO website, across NC / SC / VA.
//
// Why this works: the Places API returns `websiteUri` only when Google has a
// website on file for a place. A place that comes back with a
// `nationalPhoneNumber` and no `websiteUri` is Google itself telling us the
// business has no site -- that is a data property, not an inference drawn
// from failing to find one.
//
// Usage:
//   export GOOGLE_MAPS_API_KEY=...
//   node scripts/find-leads.mjs --dry-run
//   node scripts/find-leads.mjs --states NC,SC --cities-per-state 10
//
// Run with --help for all flags.

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { CITIES, CATEGORY_SETS, ALL_CATEGORIES } from './lead-targets.mjs';

const ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';

// Every field we ask for here is one Google will bill us for. `websiteUri`
// and `nationalPhoneNumber` are the two that matter and they are also the two
// that push this call into the Enterprise SKU -- there is no cheaper way to
// ask "does this business have a website".
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.nationalPhoneNumber',
  'places.websiteUri',
  'places.formattedAddress',
  'places.rating',
  'places.userRatingCount',
  'places.businessStatus',
  'places.primaryTypeDisplayName',
  'nextPageToken',
].join(',');

// ---------------------------------------------------------------- arguments

function parseArgs(argv) {
  const args = {
    states: ['NC', 'SC', 'VA'],
    categories: CATEGORY_SETS.core,
    citiesPerState: 15,
    maxPages: 2,
    delayMs: 250,
    out: 'leads-output',
    dryRun: false,
    smallMarkets: false,
    minReviews: 0,
    noCache: false,
    yes: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      const value = argv[++i];
      if (value === undefined) throw new Error(`${arg} needs a value`);
      return value;
    };

    switch (arg) {
      case '--states':           args.states = next().split(',').map((s) => s.trim().toUpperCase()); break;
      case '--cities-per-state': args.citiesPerState = Number(next()); break;
      case '--max-pages':        args.maxPages = Number(next()); break;
      case '--delay':            args.delayMs = Number(next()); break;
      case '--min-reviews':      args.minReviews = Number(next()); break;
      case '--out':              args.out = next(); break;
      case '--categories': {
        const value = next();
        if (value === 'core') args.categories = CATEGORY_SETS.core;
        else if (value === 'extended') args.categories = CATEGORY_SETS.extended;
        else if (value === 'all') args.categories = ALL_CATEGORIES;
        else args.categories = value.split(',').map((s) => s.trim()).filter(Boolean);
        break;
      }
      case '--small-markets':    args.smallMarkets = true; break;
      case '--dry-run':          args.dryRun = true; break;
      case '--no-cache':         args.noCache = true; break;
      case '--yes': case '-y':   args.yes = true; break;
      case '--help': case '-h':  printHelp(); process.exit(0);
      default:
        throw new Error(`Unknown flag: ${arg} (try --help)`);
    }
  }

  for (const state of args.states) {
    if (!CITIES[state]) throw new Error(`No city list for state "${state}". Known: ${Object.keys(CITIES).join(', ')}`);
  }
  if (!Number.isFinite(args.citiesPerState) || args.citiesPerState < 1) throw new Error('--cities-per-state must be >= 1');
  if (!Number.isFinite(args.maxPages) || args.maxPages < 1 || args.maxPages > 3) throw new Error('--max-pages must be 1-3 (the API caps out at 3 pages / 60 results)');

  return args;
}

function printHelp() {
  console.log(`
find-leads.mjs -- find businesses with a phone but no website (NC / SC / VA)

  --states NC,SC,VA         States to sweep.                  (default: all three)
  --categories <spec>       "core" (10 trades), "extended" (30 more), "all",
                            or a comma-separated list of your own search terms.
                                                              (default: core)
  --cities-per-state N      How many cities per state.        (default: 15)
  --small-markets           Take cities from the bottom of each list (smaller
                            towns) instead of the top. Higher hit rate.
  --max-pages N             Result pages per query, 1-3, 20 each. (default: 2)
  --min-reviews N           Drop places with fewer than N reviews. Filters out
                            dead or barely-real listings.     (default: 0)
  --delay MS                Pause between requests.            (default: 250)
  --out DIR                 Output directory.          (default: leads-output)
  --no-cache                Ignore the response cache and re-query everything.
  --dry-run                 Show the query plan and request estimate, call nothing.
  -y, --yes                 Skip the confirmation prompt.

Set GOOGLE_MAPS_API_KEY before running (except with --dry-run).
`);
}

// ------------------------------------------------------------------- helpers

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Dedupe key. Google can list the same operator under several place ids
// (multiple service-area entries, an old and a new listing), but the phone
// number is what we actually dial -- so one row per distinct number.
const normalizePhone = (phone) => (phone || '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');

function csvEscape(value) {
  const str = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function toCsv(rows, columns) {
  const lines = [columns.join(',')];
  for (const row of rows) lines.push(columns.map((col) => csvEscape(row[col])).join(','));
  return lines.join('\n') + '\n';
}

function buildPlan({ states, categories, citiesPerState, smallMarkets }) {
  const plan = [];
  for (const state of states) {
    const all = CITIES[state];
    const cities = smallMarkets
      ? all.slice(-citiesPerState).reverse()
      : all.slice(0, citiesPerState);
    for (const city of cities) {
      for (const category of categories) {
        plan.push({ state, city, category, query: `${category} in ${city}, ${state}` });
      }
    }
  }
  return plan;
}

// --------------------------------------------------------------- api calling

async function searchTextPage(query, pageToken, apiKey) {
  const body = { textQuery: query, pageSize: 20, regionCode: 'US' };
  // The API requires every parameter other than pageToken to be identical
  // across a paginated sequence, so the body above must stay untouched here.
  if (pageToken) body.pageToken = pageToken;

  for (let attempt = 0; attempt < 5; attempt++) {
    let response;
    try {
      response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': FIELD_MASK,
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      if (attempt === 4) throw err;
      await sleep(2 ** attempt * 1000);
      continue;
    }

    if (response.ok) return response.json();

    const text = await response.text();

    // 429 and 5xx are worth retrying; a 400 or 403 is a broken request or a
    // bad key and will fail identically forever.
    if (response.status === 429 || response.status >= 500) {
      if (attempt === 4) throw new Error(`${response.status} after 5 attempts: ${text}`);
      await sleep(2 ** attempt * 1000);
      continue;
    }
    throw new Error(`Places API ${response.status}: ${text}`);
  }
  throw new Error('unreachable');
}

async function runQuery(query, maxPages, delayMs, apiKey) {
  const places = [];
  let pageToken;
  let requests = 0;

  for (let page = 0; page < maxPages; page++) {
    const data = await searchTextPage(query, pageToken, apiKey);
    requests++;
    if (Array.isArray(data.places)) places.push(...data.places);
    pageToken = data.nextPageToken;
    if (!pageToken) break;
    await sleep(delayMs);
  }
  return { places, requests };
}

// ---------------------------------------------------------------------- main

async function main() {
  const args = parseArgs(process.argv);
  const plan = buildPlan(args);
  const estimatedRequests = plan.length * args.maxPages;

  console.log('Lead sweep plan');
  console.log(`  states      : ${args.states.join(', ')}`);
  console.log(`  cities      : ${args.citiesPerState} per state${args.smallMarkets ? ' (smallest markets first)' : ''}`);
  console.log(`  categories  : ${args.categories.length}`);
  console.log(`  queries     : ${plan.length}`);
  console.log(`  requests    : up to ${estimatedRequests} (${args.maxPages} page(s) each)`);
  console.log('');
  console.log('  Billing note: websiteUri + nationalPhoneNumber put these calls on the');
  console.log('  Text Search Enterprise SKU. Check current Places API pricing and set a');
  console.log('  daily quota cap in the Google Cloud console before a large run.');
  console.log('');

  if (args.dryRun) {
    console.log('Dry run. First 10 queries:');
    for (const item of plan.slice(0, 10)) console.log(`  ${item.query}`);
    if (plan.length > 10) console.log(`  ... and ${plan.length - 10} more`);
    return;
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_MAPS_API_KEY is not set.');
    console.error('Create a key in Google Cloud with the "Places API (New)" enabled, then:');
    console.error('  export GOOGLE_MAPS_API_KEY=your_key_here');
    process.exit(1);
  }

  if (!args.yes && estimatedRequests > 500) {
    console.error(`Refusing to fire ${estimatedRequests} billed requests without --yes.`);
    console.error('Re-run with --dry-run to review the plan, or add --yes to proceed.');
    process.exit(1);
  }

  mkdirSync(args.out, { recursive: true });
  const cachePath = join(args.out, 'cache.json');

  // The cache is keyed by query+page-depth so an interrupted or repeated run
  // re-reads instead of re-billing. Delete cache.json (or pass --no-cache) to
  // force fresh data.
  let cache = {};
  if (!args.noCache && existsSync(cachePath)) {
    try {
      cache = JSON.parse(readFileSync(cachePath, 'utf8'));
      console.log(`Loaded ${Object.keys(cache).length} cached queries from ${cachePath}\n`);
    } catch {
      console.log('Cache unreadable, starting fresh.\n');
    }
  }

  const byPhone = new Map();
  const seenPlaceIds = new Set();
  let totalRequests = 0;
  let totalSeen = 0;
  let cacheHits = 0;

  for (const [index, item] of plan.entries()) {
    const cacheKey = `${item.query}::${args.maxPages}`;
    let places;

    if (cache[cacheKey]) {
      places = cache[cacheKey];
      cacheHits++;
    } else {
      try {
        const result = await runQuery(item.query, args.maxPages, args.delayMs, apiKey);
        places = result.places;
        totalRequests += result.requests;
        cache[cacheKey] = places;
      } catch (err) {
        console.error(`  ! ${item.query} -- ${err.message}`);
        continue;
      }
      await sleep(args.delayMs);
    }

    let kept = 0;
    for (const place of places) {
      totalSeen++;

      if (place.websiteUri) continue;                          // has a site -- not our prospect
      if (!place.nationalPhoneNumber) continue;                 // nothing to dial
      if (place.businessStatus && place.businessStatus !== 'OPERATIONAL') continue;
      if ((place.userRatingCount ?? 0) < args.minReviews) continue;

      const phoneKey = normalizePhone(place.nationalPhoneNumber);
      if (!phoneKey || phoneKey.length !== 10) continue;        // malformed, don't ship it
      if (seenPlaceIds.has(place.id)) continue;
      seenPlaceIds.add(place.id);

      const existing = byPhone.get(phoneKey);
      if (existing) {
        // Same operator found under another category -- record the overlap
        // rather than dropping it; it tells you what they actually do.
        if (!existing.categories.includes(item.category)) existing.categories.push(item.category);
        continue;
      }

      byPhone.set(phoneKey, {
        name: place.displayName?.text ?? '',
        phone: place.nationalPhoneNumber,
        address: place.formattedAddress ?? '',
        city: item.city,
        state: item.state,
        categories: [item.category],
        google_type: place.primaryTypeDisplayName?.text ?? '',
        rating: place.rating ?? '',
        reviews: place.userRatingCount ?? 0,
        place_id: place.id,
      });
      kept++;
    }

    const progress = `[${index + 1}/${plan.length}]`;
    console.log(`${progress} ${item.query} -- ${places.length} places, ${kept} new no-website leads`);

    if ((index + 1) % 25 === 0) writeFileSync(cachePath, JSON.stringify(cache));
  }

  writeFileSync(cachePath, JSON.stringify(cache));

  const leads = [...byPhone.values()]
    .map((lead) => ({ ...lead, categories: lead.categories.join('; ') }))
    .sort((a, b) => a.state.localeCompare(b.state) || a.city.localeCompare(b.city) || a.name.localeCompare(b.name));

  const columns = ['name', 'phone', 'address', 'city', 'state', 'categories', 'google_type', 'rating', 'reviews', 'place_id'];
  const csvPath = join(args.out, 'leads.csv');
  writeFileSync(csvPath, toCsv(leads, columns));
  writeFileSync(join(args.out, 'leads.json'), JSON.stringify(leads, null, 2));

  const byState = {};
  for (const lead of leads) byState[lead.state] = (byState[lead.state] ?? 0) + 1;

  console.log('\n--------------------------------------------------');
  console.log(`Places examined     : ${totalSeen}`);
  console.log(`Billed requests     : ${totalRequests}${cacheHits ? ` (${cacheHits} queries served from cache)` : ''}`);
  console.log(`Leads (phone, no site): ${leads.length}`);
  for (const [state, count] of Object.entries(byState).sort()) console.log(`  ${state}: ${count}`);
  console.log(`\nWrote ${csvPath}`);
}

main().catch((err) => {
  console.error(`\nError: ${err.message}`);
  process.exit(1);
});
