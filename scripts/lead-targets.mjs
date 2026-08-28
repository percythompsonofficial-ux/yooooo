// Target definitions for the no-website lead sweep.
//
// Cities are ordered roughly by population within each state. Smaller markets
// sit lower in each list but tend to convert better for this campaign: the
// share of trades businesses running without a website climbs sharply outside
// the metros. Use --cities-per-state to take a prefix, or --small-markets to
// work the list from the bottom up.

export const CITIES = {
  NC: [
    'Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem',
    'Fayetteville', 'Cary', 'Wilmington', 'High Point', 'Concord',
    'Asheville', 'Greenville', 'Gastonia', 'Jacksonville', 'Chapel Hill',
    'Rocky Mount', 'Burlington', 'Wilson', 'Hickory', 'Kannapolis',
    'Goldsboro', 'Salisbury', 'New Bern', 'Sanford', 'Statesville',
    'Monroe', 'Shelby', 'Lumberton', 'Kinston', 'Elizabeth City',
    'Roanoke Rapids', 'Laurinburg', 'Henderson', 'Dunn', 'Lexington',
    'Thomasville', 'Albemarle', 'Morganton', 'Reidsville', 'Eden',
  ],
  SC: [
    'Charleston', 'Columbia', 'North Charleston', 'Mount Pleasant', 'Rock Hill',
    'Greenville', 'Summerville', 'Sumter', 'Goose Creek', 'Hilton Head Island',
    'Florence', 'Spartanburg', 'Myrtle Beach', 'Aiken', 'Anderson',
    'Greer', 'Mauldin', 'Greenwood', 'North Augusta', 'Easley',
    'Simpsonville', 'Hanahan', 'Conway', 'West Columbia', 'Orangeburg',
    'Clemson', 'Beaufort', 'Gaffney', 'Union', 'Newberry',
    'Camden', 'Georgetown', 'Dillon', 'Bennettsville', 'Walterboro',
    'Marion', 'Cheraw', 'Chester', 'Laurens', 'Abbeville',
  ],
  VA: [
    'Virginia Beach', 'Chesapeake', 'Norfolk', 'Arlington', 'Richmond',
    'Newport News', 'Alexandria', 'Hampton', 'Roanoke', 'Portsmouth',
    'Suffolk', 'Lynchburg', 'Harrisonburg', 'Charlottesville', 'Danville',
    'Manassas', 'Petersburg', 'Fredericksburg', 'Winchester', 'Salem',
    'Staunton', 'Waynesboro', 'Hopewell', 'Bristol', 'Colonial Heights',
    'Radford', 'Martinsville', 'Galax', 'Emporia', 'Franklin',
    'Covington', 'Buena Vista', 'Norton', 'Farmville', 'Wytheville',
    'Abingdon', 'South Boston', 'Bedford', 'Pulaski', 'Marion',
  ],
};

// Home services and trades: phone-driven businesses where a missed call is a
// lost job. Ordered by how strongly the category correlates with urgent,
// high-ticket inbound calls -- the best fit for a voice agent pitch.
export const CATEGORY_SETS = {
  core: [
    'HVAC contractor',
    'plumber',
    'electrician',
    'roofing contractor',
    'garage door repair',
    'septic tank service',
    'well drilling contractor',
    'water damage restoration service',
    'tree service',
    'towing service',
  ],
  extended: [
    'air conditioning repair service',
    'heating contractor',
    'landscaping service',
    'lawn care service',
    'pest control service',
    'fence contractor',
    'gutter cleaning service',
    'pressure washing service',
    'handyman',
    'painting contractor',
    'flooring contractor',
    'concrete contractor',
    'chimney sweep',
    'appliance repair service',
    'junk removal service',
    'paving contractor',
    'siding contractor',
    'insulation contractor',
    'excavating contractor',
    'locksmith',
    'carpet cleaning service',
    'welding service',
    'drywall contractor',
    'masonry contractor',
    'deck builder',
    'swimming pool cleaning service',
    'mobile home repair service',
    'small engine repair service',
    'foundation repair service',
    'plumbing drain cleaning service',
  ],
};

export const ALL_CATEGORIES = [...CATEGORY_SETS.core, ...CATEGORY_SETS.extended];
