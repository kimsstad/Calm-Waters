'use strict';

// Netlify Function: merges blocked dates from each property's configured
// Airbnb / Booking.com / LekkeSlaap iCal feeds and returns a single
// website-friendly availability payload.

const DEFAULT_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8'
};

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return buildJsonResponse(204, {});
  }

  if (event.httpMethod !== 'GET') {
    return buildJsonResponse(405, {
      error: 'Method not allowed'
    });
  }

  const property = (event.queryStringParameters?.property || '').trim();
  if (!property) {
    return buildJsonResponse(400, {
      error: 'Missing property query parameter'
    });
  }

  const feedConfig = getPropertyFeedConfig(property);
  if (!feedConfig) {
    return buildJsonResponse(404, {
      error: 'No availability feed configuration found for "' + property + '"'
    });
  }

  const configuredFeeds = Object.entries(feedConfig)
    .filter(([, url]) => Boolean(url))
    .map(([channel, url]) => ({ channel, url }));

  if (!configuredFeeds.length) {
    return buildJsonResponse(200, {
      property,
      blockedDates: [],
      warnings: ['No feeds are configured for this property yet.']
    });
  }

  const results = await Promise.allSettled(
    configuredFeeds.map(({ channel, url }) => fetchFeed(channel, url))
  );

  const blockedDates = new Set();
  const warnings = [];
  const channelsLoaded = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      result.value.blockedDates.forEach((dateKey) => blockedDates.add(dateKey));
      channelsLoaded.push(result.value.channel);
      continue;
    }

    warnings.push(result.reason?.message || 'A feed could not be loaded.');
  }

  return buildJsonResponse(200, {
    property,
    blockedDates: Array.from(blockedDates).sort(),
    channelsLoaded,
    warnings
  });
};

function buildJsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(body)
  };
}

function getPropertyFeedConfig(property) {
  const jsonConfig = parseFeedsJson(process.env.CW_BOOKING_FEEDS);
  if (jsonConfig && jsonConfig[property]) {
    return normalizeFeedConfig(jsonConfig[property]);
  }

  const envPrefix = property.replace(/[^a-z0-9]+/gi, '_').toUpperCase();
  return normalizeFeedConfig({
    airbnb: process.env[envPrefix + '_AIRBNB_ICAL'] || '',
    booking: process.env[envPrefix + '_BOOKING_ICAL'] || '',
    lekkeslaap: process.env[envPrefix + '_LEKKESLAAP_ICAL'] || ''
  });
}

function parseFeedsJson(rawValue) {
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (error) {
    console.warn('CW_BOOKING_FEEDS could not be parsed:', error.message);
    return null;
  }
}

function normalizeFeedConfig(config) {
  if (!config || typeof config !== 'object') return null;

  const normalized = {
    airbnb: typeof config.airbnb === 'string' ? config.airbnb.trim() : '',
    booking: typeof config.booking === 'string' ? config.booking.trim() : '',
    lekkeslaap: typeof config.lekkeslaap === 'string' ? config.lekkeslaap.trim() : ''
  };

  return Object.values(normalized).some(Boolean) ? normalized : null;
}

async function fetchFeed(channel, url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

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
