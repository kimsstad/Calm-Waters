'use strict';

const fs = require('fs');
const path = require('path');
const {
  mergeAvailabilityForProperty,
  parseFeedsJson
} = require('./availability-core');

const PROPERTY_KEYS = [
  'arrowood',
  'boardwalk-retreat',
  'boardwalk-corner',
  'clifftop',
  'farallon',
  'goose-valley',
  'hill-and-tides',
  'hill-penthouse-plett',
  'la-lapa',
  'la-med',
  'little-lincoln',
  'lookout-room',
  'magnificent-view',
  'panorama',
  'plett-escape',
  'robberg-room',
  'rivers-drift',
  'sanctuary-hideaway',
  'sanctuary-room',
  'sandy-fingers',
  'sandy-toes',
  'sea-esta',
  'seasalt-rest',
  'sound-of-silence',
  'stillwater-haven',
  'the-place-to-stay',
  'toplis',
  'tremezzo',
  'watersong',
  'wildside'
];

const outputDir = path.join(process.cwd(), 'generated', 'availability');

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  const generatedAt = new Date().toISOString();
  const feedConfigJson = parseFeedsJson(process.env.CW_BOOKING_FEEDS);

  for (const propertyKey of PROPERTY_KEYS) {
    const availability = await mergeAvailabilityForProperty(propertyKey, {
      feedConfigJson
    });
    const payload = {
      property: propertyKey,
      generatedAt,
      blockedDates: availability.blockedDates,
      channelsLoaded: availability.channelsLoaded,
      warnings: availability.warnings
    };

    fs.writeFileSync(
      path.join(outputDir, propertyKey + '.json'),
      JSON.stringify(payload, null, 2) + '\n',
      'utf8'
    );
  }

  console.log('Generated availability JSON for', PROPERTY_KEYS.length, 'properties.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
