# Netlify Booking Availability Setup

This project now supports a Netlify-hosted availability proxy for the property booking calendars.

## What Netlify is doing

- The frontend asks `/api/availability?property=<property-key>`
- Netlify runs `netlify/functions/availability.js`
- That function fetches the real iCal feeds server-side
- The function merges blocked dates and returns JSON to the calendar

This avoids the browser CORS problem that was preventing the blocked dates from syncing reliably.

## Files added

- `netlify/functions/availability.js`
- `netlify.toml`
- `netlify-booking-feeds.example.json`

## Netlify dashboard steps

1. Connect this repo to Netlify.
2. Open the site's `Environment variables` settings.
3. Add one environment variable named `CW_BOOKING_FEEDS`.
4. Copy `netlify-booking-feeds.example.json`, paste it into the value field, and replace the empty strings with the real iCal URLs for each property.
5. Deploy the site.

## Property keys used by the frontend

- `arrowood`
- `boardwalk-corner`
- `clifftop`
- `hill-penthouse-plett`
- `little-lincoln`
- `lookout-room`
- `plett-escape`
- `rivers-drift`
- `sanctuary-room`
- `sandy-fingers`
- `sandy-toes`
- `sound-of-silence`
- `stillwater-haven`
- `the-place-to-stay`
- `watersong`
- `wildside`

## Notes

- `boardwalk-corner` is still only a temporary test source for the Boardwalk page.
- If a property does not have a Booking.com feed yet, leave `"booking": ""`.
- If you prefer separate environment variables instead of one JSON blob, the function also supports:
  - `<PROPERTY_KEY>_AIRBNB_ICAL`
  - `<PROPERTY_KEY>_BOOKING_ICAL`
  - `<PROPERTY_KEY>_LEKKESLAAP_ICAL`

Example:

- `ARROWOOD_AIRBNB_ICAL`
- `ARROWOOD_BOOKING_ICAL`
- `ARROWOOD_LEKKESLAAP_ICAL`

## After deployment

Once Netlify is live, the property pages will call the same-origin `/api/availability` route automatically. No page-by-page JavaScript edits are needed for the availability sync itself.
