'use strict';

const fs = require('fs');
const path = require('path');
const {
  mergeAvailabilityForProperty,
  parseFeedsJson
} = require('./availability-core');

const PROPERTY_KEYS = [
  'arrowood',
  'baycrest',
  'captains-quarters',
  'clementine-cottage',
  'boardwalk-retreat',
  'boardwalk-corner',
  'boardwalk-reverie',
  'farallon',
  'goose-valley',
  'lagoon-breeze',
  'hill-and-tides',
  'jays-place',
  'la-lapa',
  'la-med',
  'la-zen',
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
  'serendipity',
  'ocean-echo',
  'sea-esta',
  'sound-of-silence',
  'stillwater-haven',
  'sweet-streams',
  'the-place-to-stay',
  'toplis',
  'tremezzo',
  'watersong'
];

const PROPERTY_PREPARATION_TIME_NIGHTS = {
  'boardwalk-reverie': 1,
  'clementine-cottage': 1,
  'sweet-streams': 2
};

const outputDir = path.join(process.cwd(), 'generated', 'availability');

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  const generatedAt = new Date().toISOString();
  const feedConfigJson = {
    'la-zen': {
      airbnb: 'https://www.airbnb.co.za/calendar/ical/1799939106500405186.ics?t=1de723921b834e7fb0a93fe8ebc277c8',
      booking: 'https://ical.booking.com/v1/export?t=ead20d64-fff4-4f1a-a66e-0ab8d2a3fd2c',
      lekkeslaap: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=cnJuREw5ZjBxNW0yVUF6cnZuNUJJdz09'
    },
    'sweet-streams': {
      airbnb: 'https://www.airbnb.co.za/calendar/ical/1799867871713265118.ics?t=8111dad630c942b59cd7901fd7ed2b1e',
      booking: 'https://ical.booking.com/v1/export?t=dd7390bc-8010-4ab8-8f3f-954b87e37483',
      lekkeslaap: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=YmV6Ui9POWIzaHlSdnVRN1RJY3JpQT09'
    },
    ...parseFeedsJson(process.env.CW_BOOKING_FEEDS)
  };

  for (const propertyKey of PROPERTY_KEYS) {
    const availability = await mergeAvailabilityForProperty(propertyKey, {
      feedConfigJson,
      preparationTimeNights: PROPERTY_PREPARATION_TIME_NIGHTS[propertyKey] || 0
    });
    const payload = {
      property: propertyKey,
      generatedAt,
      preparationTimeNights: PROPERTY_PREPARATION_TIME_NIGHTS[propertyKey] || 0,
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
