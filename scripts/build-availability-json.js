'use strict';

const fs = require('fs');
const path = require('path');

const PROPERTY_KEYS = [
  'arrowood',
  'boardwalk-corner',
  'clifftop',
  'hill-penthouse-plett',
  'little-lincoln',
  'lookout-room',
  'plett-escape',
  'rivers-drift',
  'sanctuary-room',
  'sandy-fingers',
  'sandy-toes',
  'sound-of-silence',
  'stillwater-haven',
  'the-place-to-stay',
  'watersong',
  'wildside'
];

const outputDir = path.join(process.cwd(), 'generated', 'availability');

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  const generatedAt = new Date().toISOString();
  const feedConfigJson = parseFeedsJson(process.env.CW_BOOKING_FEEDS);

  for (const propertyKey of PROPERTY_KEYS) {
    const feedConfig = getPropertyFeedConfig(propertyKey, feedConfigJson);
    const configuredFeeds = Object.entries(feedConfig)
      .filter(([, url]) => Boolean(url))
      .map(([channel, url]) => ({ channel, url }));

    const blockedDates = new Set();
    const warnings = [];
    const channelsLoaded = [];

    if (configuredFeeds.length) {
      const results = await Promise.allSettled(
        configuredFeeds.map(({ channel, url }) => fetchFeed(channel, url))
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          result.value.blockedDates.forEach((dateKey) => blockedDates.add(dateKey));
          channelsLoaded.push(result.value.channel);
          continue;
        }

        warnings.push(result.reason?.message || 'A feed could not be loaded.');
      }
    } else {
      warnings.push('No feeds configured for this property.');
    }

    const payload = {
      property: propertyKey,
      generatedAt,
      blockedDates: Array.from(blockedDates).sort(),
      channelsLoaded,
      warnings
    };

    fs.writeFileSync(
      path.join(outputDir, propertyKey + '.json'),
      JSON.stringify(payload, null, 2) + '\n',
      'utf8'
    );
  }

  console.log('Generated availability JSON for', PROPERTY_KEYS.length, 'properties.');
}

function parseFeedsJson(rawValue) {
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (error) {
    throw new Error('CW_BOOKING_FEEDS is not valid JSON: ' + error.message);
  }
}

function getPropertyFeedConfig(propertyKey, feedConfigJson) {
  if (feedConfigJson && feedConfigJson[propertyKey]) {
    return normalizeFeedConfig(feedConfigJson[propertyKey]);
  }

  const envPrefix = propertyKey.replace(/[^a-z0-9]+/gi, '_').toUpperCase();
  return normalizeFeedConfig({
    airbnb: process.env[envPrefix + '_AIRBNB_ICAL'] || '',
    booking: process.env[envPrefix + '_BOOKING_ICAL'] || '',
    lekkeslaap: process.env[envPrefix + '_LEKKESLAAP_ICAL'] || ''
  });
}

function normalizeFeedConfig(config) {
  if (!config || typeof config !== 'object') {
    return { airbnb: '', booking: '', lekkeslaap: '' };
  }

  return {
    airbnb: typeof config.airbnb === 'string' ? config.airbnb.trim() : '',
    booking: typeof config.booking === 'string' ? config.booking.trim() : '',
    lekkeslaap: typeof config.lekkeslaap === 'string' ? config.lekkeslaap.trim() : ''
  };
}

async function fetchFeed(channel, url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/calendar, text/plain;q=0.9, */*;q=0.8'
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(channel + ' feed returned HTTP ' + response.status);
    }

    const calendarText = await response.text();
    return {
      channel,
      blockedDates: parseIcalBlockedDates(calendarText)
    };
  } finally {
    clearTimeout(timeout);
  }
}

function parseIcalBlockedDates(calendarText) {
  const blockedDates = new Set();
  const lines = unfoldIcalLines(calendarText);
  let currentEvent = null;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      currentEvent = {};
      continue;
    }

    if (line === 'END:VEVENT') {
      if (currentEvent && currentEvent.start) {
        const startDate = toUtcDate(currentEvent.start);
        const endDate = currentEvent.end ? toUtcDate(currentEvent.end) : addDays(startDate, 1);
        let cursor = new Date(startDate.getTime());

        while (cursor < endDate) {
          blockedDates.add(dateToKey(cursor));
          cursor = addDays(cursor, 1);
        }
      }

      currentEvent = null;
      continue;
    }

    if (!currentEvent) continue;

    if (line.startsWith('DTSTART')) {
      currentEvent.start = extractIcalDateKey(line);
    }

    if (line.startsWith('DTEND')) {
      currentEvent.end = extractIcalDateKey(line);
    }
  }

  return blockedDates;
}

function unfoldIcalLines(calendarText) {
  return calendarText
    .replace(/\r\n/g, '\n')
    .split('\n')
    .reduce((accumulator, line) => {
      if (/^[ \t]/.test(line) && accumulator.length) {
        accumulator[accumulator.length - 1] += line.trim();
      } else {
        accumulator.push(line.trim());
      }
      return accumulator;
    }, []);
}

function extractIcalDateKey(line) {
  const parts = line.split(':');
  const value = parts[parts.length - 1] || '';
  const datePart = value.slice(0, 8);
  if (!/^\d{8}$/.test(datePart)) return null;
  return datePart.slice(0, 4) + '-' + datePart.slice(4, 6) + '-' + datePart.slice(6, 8);
}

function toUtcDate(dateKey) {
  return new Date(dateKey + 'T00:00:00Z');
}

function addDays(date, days) {
  const nextDate = new Date(date.getTime());
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function dateToKey(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
