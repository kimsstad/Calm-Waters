'use strict';

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const defaultFeedsFile = path.join(repoRoot, 'booking-feeds.json');

function parseFeedsJson(rawValue, options = {}) {
  const { throwOnError = false, source = 'CW_BOOKING_FEEDS' } = options;
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (error) {
    if (throwOnError) {
      throw new Error(source + ' is not valid JSON: ' + error.message);
    }

    console.warn(source + ' could not be parsed:', error.message);
    return null;
  }
}

function loadFeedsFile(filePath = defaultFeedsFile, options = {}) {
  const { throwOnError = false } = options;
  if (!fs.existsSync(filePath)) return null;

  try {
    const rawValue = fs.readFileSync(filePath, 'utf8');
    return parseFeedsJson(rawValue, { throwOnError: true, source: filePath });
  } catch (error) {
    if (throwOnError) throw error;
    console.warn('booking-feeds.json could not be loaded:', error.message);
    return null;
  }
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

function hasConfiguredFeeds(config) {
  return Boolean(config && Object.values(config).some(Boolean));
}

function getPropertyFeedConfig(propertyKey, options = {}) {
  const envVars = options.env || process.env;
  const envJsonConfig = options.feedConfigJson !== undefined
    ? options.feedConfigJson
    : parseFeedsJson(envVars.CW_BOOKING_FEEDS);

  if (envJsonConfig && envJsonConfig[propertyKey]) {
    const normalizedJsonConfig = normalizeFeedConfig(envJsonConfig[propertyKey]);
    if (hasConfiguredFeeds(normalizedJsonConfig)) {
      return normalizedJsonConfig;
    }
  }

  const fileConfig = options.fileConfig !== undefined
    ? options.fileConfig
    : loadFeedsFile();

  if (fileConfig && fileConfig[propertyKey]) {
    const normalizedFileConfig = normalizeFeedConfig(fileConfig[propertyKey]);
    if (hasConfiguredFeeds(normalizedFileConfig)) {
      return normalizedFileConfig;
    }
  }

  const envPrefix = propertyKey.replace(/[^a-z0-9]+/gi, '_').toUpperCase();
  const normalizedEnvConfig = normalizeFeedConfig({
    airbnb: envVars[envPrefix + '_AIRBNB_ICAL'] || '',
    booking: envVars[envPrefix + '_BOOKING_ICAL'] || '',
    lekkeslaap: envVars[envPrefix + '_LEKKESLAAP_ICAL'] || ''
  });

  return hasConfiguredFeeds(normalizedEnvConfig) ? normalizedEnvConfig : null;
}

async function fetchFeed(channel, url, options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const timeoutMs = options.timeoutMs || 15000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
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

async function mergeAvailabilityForProperty(propertyKey, options = {}) {
  const feedConfig = getPropertyFeedConfig(propertyKey, options);
  if (!feedConfig) {
    return {
      property: propertyKey,
      blockedDates: [],
      channelsLoaded: [],
      warnings: ['No feeds are configured for this property yet.']
    };
  }

  const configuredFeeds = Object.entries(feedConfig)
    .filter(([, url]) => Boolean(url))
    .map(([channel, url]) => ({ channel, url }));

  if (!configuredFeeds.length) {
    return {
      property: propertyKey,
      blockedDates: [],
      channelsLoaded: [],
      warnings: ['No feeds are configured for this property yet.']
    };
  }

  const results = await Promise.allSettled(
    configuredFeeds.map(({ channel, url }) => fetchFeed(channel, url, options))
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

  return {
    property: propertyKey,
    blockedDates: Array.from(blockedDates).sort(),
    channelsLoaded,
    warnings
  };
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

module.exports = {
  defaultFeedsFile,
  fetchFeed,
  getPropertyFeedConfig,
  hasConfiguredFeeds,
  loadFeedsFile,
  mergeAvailabilityForProperty,
  normalizeFeedConfig,
  parseFeedsJson,
  parseIcalBlockedDates
};
