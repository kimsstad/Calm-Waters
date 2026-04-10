# GitHub Actions Booking Sync Setup

This setup keeps the site on GitHub Pages and refreshes blocked dates with GitHub Actions instead of Netlify.

## How it works

- GitHub Actions runs on every push to `main`
- GitHub Actions also runs every 5 minutes
- The workflow fetches each property's iCal feeds server-side
- It writes merged blocked dates into `generated/availability/*.json`
- GitHub Pages deploys the site with those fresh JSON files included
- The booking widget reads those JSON files directly from the site

## Files added for this approach

- `.github/workflows/pages-sync-availability.yml`
- `scripts/build-availability-json.js`
- `github-actions-booking-feeds.example.json`

## One-time GitHub setup

1. Push this code to GitHub.
2. In your GitHub repository, open `Settings` -> `Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.
4. In your GitHub repository, open `Settings` -> `Secrets and variables` -> `Actions`.
5. Open the `Variables` tab.
6. Add one repository variable named `CW_BOOKING_FEEDS`.
7. Copy `github-actions-booking-feeds.example.json`, replace the empty strings with your real iCal URLs, and paste the full JSON into that variable.

## Starting small

You do not need to fill every property immediately.

For example, to start with Arrowood only, you can use:

```json
{
  "arrowood": {
    "airbnb": "",
    "booking": "",
    "lekkeslaap": ""
  }
}
```

Then replace the empty strings with Arrowood's real feed URLs.

## After setup

- Keep committing and pushing exactly the way you already do with Git Bash.
- Every push to `main` will rebuild and publish the site.
- Between your own pushes, GitHub Actions will refresh availability on its 5-minute schedule.

## Notes

- Scheduled workflows run on the default branch and GitHub may delay them slightly under load.
- If a property has no Booking.com feed yet, leave `"booking": ""`.
- The Arrowood calendar is currently hidden in the page markup. Unhide it when you are ready to show it again.
