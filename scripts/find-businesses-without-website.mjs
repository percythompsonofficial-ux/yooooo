#!/usr/bin/env node
/**
 * Find service businesses that have no website, using the Google Places API (New).
 *
 * Places returns a `websiteUri` field for each business. Businesses that never
 * built a site simply have no such field — that absence is the signal we filter
 * on, which is why this is verifiable data rather than guesswork.
 *
 * Usage:
 *   GOOGLE_MAPS_API_KEY=... node scripts/find-businesses-without-website.mjs \
 *     --state FL \
 *     --cities "Tampa,St. Petersburg,Clearwater,Brandon,Lakeland" \
 *     --target 150 \
 *     --out leads.csv
 *
 * Options:
 *   --state <code|name>   Required. Appended to every query, e.g. "FL".
 *   --cities <list>       Comma-separated cities. Strongly recommended: Text
 *                         Search caps at ~60 results per query, so coverage
 *                         comes from city x category fan-out.
 *   --cities-file <path>  One city per line. Alternative to --cities.
 *   --categories <list>   Comma-separated. Defaults to the service trades below.
 *   --target <n>          Stop once this many leads are found. Default 150.
 *   --out <path>          CSV output path. Default leads.csv
 *   --include-social      Keep businesses whose only web presence is a social
 *                         page (Facebook, Instagram, Linktree). On by default;
 *                         pass --strict to require zero web presence at all.
 *   --strict              Only businesses with no websiteUri whatsoever.
 *   --dry-run             Print the query plan and estimated cost, call nothing.
 */

const SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.nationalPhoneNumber',
  'places.websiteUri',
  'places.rating',
  'places.userRatingCount',
  'places.primaryTypeDisplayName',
  'places.googleMapsUri',
  'places.businessStatus',
  'nextPageToken',
].join(',');

const DEFAULT_CATEGORIES = [
  'roofing contractor',
  'plumber',
  'HVAC contractor',
  'electrician',
  'landscaping service',
  'lawn care service',
  'pressure washing service',
  'painting contractor',
  'flooring contractor',
  'general contractor',
  'handyman',
  'pest control service',
  'tree service',
  'fence contractor',
  'garage door service',
  'pool cleaning service',
  'septic tank service',
  'auto repair shop',
  'towing service',
  'moving company',
  'junk removal service',
  'cleaning service',
  'appliance repair service',
  'window installation service',
  'concrete contractor',
];

// Hosts that indicate a social page rather than a real website. These are the
// best leads in the set: the owner already wants to be found online.
const SOCIAL_HOSTS = [
  'facebook.com', 'fb.com', 'fb.me',
  'instagram.com',
  'linktr.ee', 'linktree.com',
  'yelp.com',
  'nextdoor.com',
  'business.site',        // Google Business Profile auto-sites, now sunset
  'business.google.com',
  'sites.google.com',
  'wixsite.com/blank',
  'twitter.com', 'x.com',
  'tiktok.com',
  'linkedin.com',
];

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function classifyWebPresence(websiteUri) {
  if (!websiteUri) return 'none';
  let host;
  try {
    host = new URL(websiteUri).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return 'none';
  }
  const isSocial = SOCIAL_HOSTS.some(
    (social) => host === social || host.endsWith(`.${social}`) || websiteUri.includes(social),
  );
  return isSocial ? 'social-only' : 'has-website';
}

function csvCell(value) {
  const text = value === undefined || value === null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

async function searchPage(apiKey, textQuery, pageToken) {
  const body = { textQuery, pageSize: 20 };
  if (pageToken) body.pageToken = pageToken;

  const response = await fetch(SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Places API ${response.status} for "${textQuery}": ${detail}`);
  }
  return response.json();
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const state = args.state;
  if (!state) {
    console.error('Missing --state. Example: --state FL');
    process.exit(1);
  }

  const target = Number(args.target ?? 150);
  const outPath = args.out ?? 'leads.csv';
  const strict = Boolean(args.strict);

  const categories = args.categories
    ? String(args.categories).split(',').map((s) => s.trim()).filter(Boolean)
    : DEFAULT_CATEGORIES;

  let cities = [];
  if (args['cities-file']) {
    const { readFileSync } = await import('node:fs');
    cities = readFileSync(args['cities-file'], 'utf8')
      .split('\n').map((s) => s.trim()).filter(Boolean);
  } else if (args.cities) {
    cities = String(args.cities).split(',').map((s) => s.trim()).filter(Boolean);
  }

  // With no cities, query the state as a whole. Coverage will be thin —
  // Text Search returns at most ~60 results per query.
  const areas = cities.length ? cities : [state];

  const queries = [];
  for (const area of areas) {
    for (const category of categories) {
      queries.push(cities.length ? `${category} in ${area}, ${state}` : `${category} in ${state}`);
    }
  }

  if (args['dry-run']) {
    console.log(`Query plan: ${queries.length} queries (${areas.length} areas x ${categories.length} categories)`);
    console.log(`Up to ${queries.length * 3} API requests if every query pages out.`);
    console.log(`Text Search (New) is billed per request; check current Places pricing for the total.`);
    console.log('\nFirst 10 queries:');
    queries.slice(0, 10).forEach((q) => console.log(`  ${q}`));
    return;
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('Missing GOOGLE_MAPS_API_KEY environment variable.');
    console.error('Create a key at https://console.cloud.google.com/ with the Places API (New) enabled.');
    process.exit(1);
  }

  const seen = new Set();
  const leads = [];
  const stats = { requests: 0, examined: 0, hasWebsite: 0, closed: 0 };

  outer: for (const textQuery of queries) {
    let pageToken;
    for (let page = 0; page < 3; page++) {
      let data;
      try {
        data = await searchPage(apiKey, textQuery, pageToken);
        stats.requests++;
      } catch (error) {
        console.error(`  ! ${error.message}`);
        break;
      }

      const places = data.places ?? [];
      for (const place of places) {
        stats.examined++;
        if (seen.has(place.id)) continue;
        seen.add(place.id);

        if (place.businessStatus && place.businessStatus !== 'OPERATIONAL') {
          stats.closed++;
          continue;
        }

        const presence = classifyWebPresence(place.websiteUri);
        if (presence === 'has-website') {
          stats.hasWebsite++;
          continue;
        }
        if (strict && presence !== 'none') continue;

        leads.push({
          name: place.displayName?.text ?? '',
          category: place.primaryTypeDisplayName?.text ?? '',
          phone: place.nationalPhoneNumber ?? '',
          address: place.formattedAddress ?? '',
          web_presence: presence,
          social_url: presence === 'social-only' ? place.websiteUri : '',
          rating: place.rating ?? '',
          reviews: place.userRatingCount ?? '',
          maps_url: place.googleMapsUri ?? '',
          found_via: textQuery,
        });

        if (leads.length >= target) {
          console.log(`Reached target of ${target}.`);
          break outer;
        }
      }

      console.log(`[${leads.length}/${target}] ${textQuery}${page ? ` (page ${page + 1})` : ''} -> +${places.length} examined`);

      pageToken = data.nextPageToken;
      if (!pageToken) break;
      await sleep(250);
    }
  }

  const columns = ['name', 'category', 'phone', 'address', 'web_presence', 'social_url', 'rating', 'reviews', 'maps_url', 'found_via'];
  const csv = [
    columns.join(','),
    ...leads.map((lead) => columns.map((column) => csvCell(lead[column])).join(',')),
  ].join('\n');

  const { writeFileSync } = await import('node:fs');
  writeFileSync(outPath, `${csv}\n`, 'utf8');

  const noneCount = leads.filter((l) => l.web_presence === 'none').length;
  console.log('\n--- Summary ---');
  console.log(`API requests:        ${stats.requests}`);
  console.log(`Businesses examined: ${stats.examined} (${seen.size} unique)`);
  console.log(`Skipped, has site:   ${stats.hasWebsite}`);
  console.log(`Skipped, not open:   ${stats.closed}`);
  console.log(`Leads written:       ${leads.length} -> ${outPath}`);
  console.log(`  no web presence:   ${noneCount}`);
  console.log(`  social page only:  ${leads.length - noneCount}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
