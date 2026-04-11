'use strict';

// Netlify Function: merges blocked dates from each property's configured
// Airbnb / Booking.com / LekkeSlaap iCal feeds and returns a single
// website-friendly availability payload.

const {
  getPropertyFeedConfig,
  mergeAvailabilityForProperty
} = require('../../scripts/availability-core');

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

  const payload = await mergeAvailabilityForProperty(property);
  return buildJsonResponse(200, payload);
};

function buildJsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(body)
  };
}
