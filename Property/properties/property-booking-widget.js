(() => {
  // Shared booking widget logic. Each property page passes its own
  // feeds, display name, and workbook source through data attributes.
  const bookingRoot = document.querySelector('[data-cw-booking], [data-boardwalk-booking]');
  if (!bookingRoot) return;
  const visibleCalendarSources = new Set([
    'arrowood',
    'robberg-room',
    'lookout-room',
    'sanctuary-room',
    'hill-and-tides',
    'plett-escape',
    'the-place-to-stay',
    'little-lincoln',
    'sound-of-silence',
    'stillwater-haven',
    'rivers-drift',
    'watersong',
    'sandy-fingers',
    'sandy-toes',
    'farallon',
    'toplis',
    'panorama',
    'sea-esta',
    'goose-valley',
    'lagoon-breeze',
    'boardwalk-retreat',
    'boardwalk-corner',
    'magnificent-view',
    'sanctuary-hideaway',
    'la-lapa',
    'la-med',
    'baycrest',
    'captains-quarters',
    'clementine-cottage',
    'iroko',
    'tremezzo'
  ]);
  const previewCalendarSources = visibleCalendarSources;
  const activeSourceKey = bookingRoot.dataset.bookingSource || '';
  if (!previewCalendarSources.has(activeSourceKey)) {
    bookingRoot.closest('.cw-booking-group')?.setAttribute('hidden', 'hidden');
    return;
  }

  const form = bookingRoot.closest('form');
  const dateTriggers = Array.from(bookingRoot.querySelectorAll('[data-date-trigger]'));
  const monthsEl = bookingRoot.querySelector('[data-booking-months]');
  const bookingPanel = bookingRoot.querySelector('.cw-booking-panel');
  const bookingShell = bookingRoot.querySelector('.cw-booking-shell');
  const prevBtn = bookingRoot.querySelector('[data-booking-prev]');
  const nextBtn = bookingRoot.querySelector('[data-booking-next]');
  const guestSelect = bookingRoot.querySelector('[data-guest-select]');
  const statusEl = bookingRoot.querySelector('[data-booking-status]');
  const toggleText = bookingRoot.querySelector('[data-booking-toggle-text]');
  const compactDates = bookingRoot.querySelector('[data-field-dates]');
  const inlineSummary = bookingRoot.querySelector('[data-inline-summary]');
  const inlineNights = bookingRoot.querySelector('[data-inline-nights]');
  const inlineTotal = bookingRoot.querySelector('[data-inline-total]');
  const checkInInput = bookingRoot.querySelector('[data-booking-checkin-input]');
  const checkOutInput = bookingRoot.querySelector('[data-booking-checkout-input]');
  const guestsInput = bookingRoot.querySelector('[data-booking-guests-input]');
  const nightsInput = bookingRoot.querySelector('[data-booking-nights-input]');
  const totalInput = bookingRoot.querySelector('[data-booking-total-input]');
  const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const appTimeZone = 'Africa/Johannesburg';
  const localSyncApiBaseUrl = 'http://127.0.0.1:4179';

  const centralTwoBedAirbnbRules = [
    { start: '2026-04-01', end: '2026-04-06', flat: 2420 },
    { start: '2026-04-07', end: '2026-04-23', monThu: 1890, friSat: 2010, sun: 1930 },
    { start: '2026-04-24', end: '2026-05-03', monThu: 2090, friSat: 2210, sun: 2130 },
    { start: '2026-05-04', end: '2026-06-11', monThu: 1760, friSat: 1880, sun: 1800 },
    { start: '2026-06-12', end: '2026-06-16', flat: 2050 },
    { start: '2026-06-17', end: '2026-06-26', monThu: 1760, friSat: 1880, sun: 1800 },
    { start: '2026-06-27', end: '2026-07-02', monThu: 1890, friSat: 2010, sun: 1930 },
    { start: '2026-07-03', end: '2026-07-12', monThu: 2090, friSat: 2220, sun: 2130 },
    { start: '2026-07-13', end: '2026-07-20', monThu: 1980, friSat: 2100, sun: 2020 },
    { start: '2026-07-21', end: '2026-08-06', monThu: 1840, friSat: 1960, sun: 1880 },
    { start: '2026-08-07', end: '2026-08-10', flat: 2090 },
    { start: '2026-08-11', end: '2026-09-23', monThu: 1880, friSat: 2000, sun: 1910 },
    { start: '2026-09-24', end: '2026-10-05', monThu: 2140, friSat: 2270, sun: 2180 },
    { start: '2026-10-06', end: '2026-11-26', monThu: 1960, friSat: 2080, sun: 2000 },
    { start: '2026-11-27', end: '2026-12-09', monThu: 2140, friSat: 2270, sun: 2180 },
    { start: '2026-12-10', end: '2026-12-14', flat: 2420 },
    { start: '2026-12-15', end: '2026-12-22', monThu: 2760, friSat: 2890, sun: 2790 },
    { start: '2026-12-23', end: '2027-01-05', monThu: 2960, friSat: 3090, sun: 2990 },
    { start: '2027-01-06', end: '2027-01-12', monThu: 2290, friSat: 2410, sun: 2330 },
    { start: '2027-01-13', end: '2027-03-18', monThu: 2010, friSat: 2130, sun: 2050 },
    { start: '2027-03-19', end: '2027-03-25', monThu: 2210, friSat: 2340, sun: 2250 },
    { start: '2027-03-26', end: '2027-03-31', monThu: 2420, friSat: 2550, sun: 2460 }
  ];

  const centralThreeBedAirbnbRules = [
    { start: '2026-04-01', end: '2026-04-06', flat: 3560 },
    { start: '2026-04-07', end: '2026-04-23', monThu: 2740, friSat: 2880, sun: 2780 },
    { start: '2026-04-24', end: '2026-05-03', monThu: 3040, friSat: 3180, sun: 3080 },
    { start: '2026-05-04', end: '2026-06-11', monThu: 2520, friSat: 2660, sun: 2560 },
    { start: '2026-06-12', end: '2026-06-16', flat: 2980 },
    { start: '2026-06-17', end: '2026-06-26', monThu: 2520, friSat: 2660, sun: 2560 },
    { start: '2026-06-27', end: '2026-07-02', monThu: 2780, friSat: 2920, sun: 2820 },
    { start: '2026-07-03', end: '2026-07-12', monThu: 3060, friSat: 3210, sun: 3100 },
    { start: '2026-07-13', end: '2026-07-20', monThu: 2920, friSat: 3060, sun: 2960 },
    { start: '2026-07-21', end: '2026-08-06', monThu: 2620, friSat: 2760, sun: 2660 },
    { start: '2026-08-07', end: '2026-08-10', flat: 3020 },
    { start: '2026-08-11', end: '2026-09-23', monThu: 2680, friSat: 2820, sun: 2720 },
    { start: '2026-09-24', end: '2026-10-05', monThu: 3140, friSat: 3290, sun: 3180 },
    { start: '2026-10-06', end: '2026-11-26', monThu: 2860, friSat: 3000, sun: 2900 },
    { start: '2026-11-27', end: '2026-12-09', monThu: 3140, friSat: 3290, sun: 3180 },
    { start: '2026-12-10', end: '2026-12-14', flat: 3620 },
    { start: '2026-12-15', end: '2026-12-22', monThu: 4240, friSat: 4400, sun: 4280 },
    { start: '2026-12-23', end: '2027-01-05', monThu: 4560, friSat: 4720, sun: 4600 },
    { start: '2027-01-06', end: '2027-01-12', monThu: 3440, friSat: 3580, sun: 3480 },
    { start: '2027-01-13', end: '2027-03-18', monThu: 2980, friSat: 3120, sun: 3020 },
    { start: '2027-03-19', end: '2027-03-25', monThu: 3320, friSat: 3460, sun: 3360 },
    { start: '2027-03-26', end: '2027-03-31', monThu: 3680, friSat: 3820, sun: 3720 }
  ];

  const websiteRates2026 = {
    'robberg-room': { low: 1320, mid: 1430, high: 2420, prePost: 1925, easter: 1502, rage: 2662 },
    'lookout-room': { low: 1320, mid: 1430, high: 2420, prePost: 1925, easter: 1502, rage: 2662 },
    'sanctuary-room': { low: 1320, mid: 1430, high: 2420, prePost: 1925, easter: 1502, rage: 2662 },
    'hill-and-tides': { low: 3300, mid: 4675, high: 8800, prePost: 6738, easter: 4909, rage: 9680 },
    'plett-escape': { low: 1540, mid: 2200, high: 4400, prePost: 3300, easter: 2310, rage: 4840 },
    'the-place-to-stay': { low: 1540, mid: 2200, high: 4400, prePost: 3300, easter: 2310, rage: 4840 },
    arrowood: { low: 1540, mid: 1760, high: 3850, prePost: 2805, easter: 1848, rage: 4235 },
    'little-lincoln': { low: 1540, mid: 1760, high: 3850, prePost: 2805, easter: 1848, rage: 4235 },
    'sound-of-silence': { low: 2200, mid: 2420, high: 4840, prePost: 3630, easter: 2541, rage: 5324 },
    'stillwater-haven': { low: 2200, mid: 2420, high: 4840, prePost: 3630, easter: 2541, rage: 5324 },
    'rivers-drift': { low: 1980, mid: 2200, high: 4620, prePost: 3410, easter: 2310, rage: 5082 },
    watersong: { low: 1980, mid: 2200, high: 4620, prePost: 3410, easter: 2310, rage: 5082 },
    'sandy-fingers': { low: 1760, mid: 2200, high: 0, prePost: 1100, easter: 2310, rage: 0 },
    'sandy-toes': { low: 3520, mid: 4400, high: 13200, prePost: 8800, easter: 4620, rage: 14520 },
    farallon: { low: 4950, mid: 6600, high: 22000, prePost: 14300, easter: 6930, rage: 24200 },
    toplis: { low: 3850, mid: 4950, high: 13200, prePost: 9075, easter: 5198, rage: 14520 },
    panorama: { low: 1980, mid: 2420, high: 5500, prePost: 3960, easter: 2541, rage: 6050 },
    'sea-esta': { low: 4180, mid: 4950, high: 13750, prePost: 9350, easter: 5198, rage: 15125 },
    'goose-valley': { low: 1980, mid: 2420, high: 5500, prePost: 3960, easter: 2541, rage: 6050 },
    'boardwalk-retreat': { low: 3300, mid: 4400, high: 9350, prePost: 6875, easter: 4620, rage: 10285 },
    'boardwalk-corner': { low: 3300, mid: 4400, high: 9350, prePost: 6875, easter: 4620, rage: 10285 },
    'magnificent-view': { low: 2420, mid: 3300, high: 6600, prePost: 4950, easter: 3465, rage: 7260 },
    'sanctuary-hideaway': { low: 5500, mid: 5500, high: 13200, prePost: 9350, easter: 5775, rage: 14520 },
    'la-lapa': { low: 2200, mid: 2750, high: 4070, prePost: 3410, easter: 2888, rage: 4477 },
    'la-med': { low: 3300, mid: 3850, high: 5170, prePost: 4510, easter: 4043, rage: 5687 },
    tremezzo: { low: 7700, mid: 8800, high: 30800, prePost: 19800, easter: 9240, rage: 33880 }
  };

  function getEasterSundayDate(year) {
    const goldenNumber = year % 19;
    const century = Math.floor(year / 100);
    const skippedLeapYears = Math.floor(century / 4);
    const correction = Math.floor((century + 8) / 25);
    const moonCorrection = Math.floor((century - correction + 1) / 3);
    const epact = (19 * goldenNumber + century - skippedLeapYears - moonCorrection + 15) % 30;
    const leapRemainder = Math.floor((year % 100) / 4);
    const weekdayCorrection = (32 + 2 * (century % 4) + 2 * leapRemainder - epact - (year % 100) % 4) % 7;
    const daysToSunday = Math.floor((goldenNumber + 11 * epact + 22 * weekdayCorrection) / 451);
    const month = Math.floor((epact + weekdayCorrection - 7 * daysToSunday + 114) / 31);
    const day = ((epact + weekdayCorrection - 7 * daysToSunday + 114) % 31) + 1;
    return new Date(Date.UTC(year, month - 1, day));
  }

  function buildGeneratedSeasonSchedule(year, baseYear) {
    const easterSunday = getEasterSundayDate(year);
    const easterStart = dateToKey(addDays(easterSunday, -2));
    const easterEnd = dateToKey(addDays(easterSunday, 1));
    const afterEaster = dateToKey(addDays(easterSunday, 2));
    const janRateYear = year > baseYear ? year - 1 : year;

    return [
      { start: year + '-01-01', end: year + '-01-05', key: 'high', rateYear: janRateYear },
      { start: year + '-01-06', end: year + '-01-15', key: 'prePost', rateYear: janRateYear },
      { start: year + '-01-16', end: dateToKey(addDays(toUtcDate(easterStart), -1)), key: 'mid', rateYear: year },
      { start: easterStart, end: easterEnd, key: 'easter', rateYear: year },
      { start: afterEaster, end: year + '-04-30', key: 'mid', rateYear: year },
      { start: year + '-05-01', end: year + '-09-30', key: 'low', rateYear: year },
      { start: year + '-10-01', end: year + '-11-26', key: 'mid', rateYear: year },
      { start: year + '-11-27', end: year + '-12-04', key: 'rage', rateYear: year },
      { start: year + '-12-05', end: year + '-12-14', key: 'prePost', rateYear: year },
      { start: year + '-12-15', end: year + '-12-31', key: 'high', rateYear: year }
    ];
  }

  function getAnnualSeasonRates(baseRates, rateYear, baseYear) {
    if (!baseRates) return null;
    const multiplier = Math.pow(1.1, rateYear - baseYear);

    return Object.entries(baseRates).reduce((annualRates, [key, value]) => {
      annualRates[key] = Math.round(value * multiplier);
      return annualRates;
    }, {});
  }

  function buildSeasonRules(rates2026) {
    const baseRates = rates2026;
    if (!baseRates) return [];
    const baseYear = 2026;
    const yearsToGenerate = 20;
    const rules = [];

    for (let year = baseYear; year < baseYear + yearsToGenerate; year += 1) {
      buildGeneratedSeasonSchedule(year, baseYear).forEach((segment) => {
        const rates = getAnnualSeasonRates(baseRates, segment.rateYear, baseYear);
        const rate = rates ? rates[segment.key] : null;
        if (Number.isFinite(rate)) {
          rules.push({ start: segment.start, end: segment.end, flat: rate });
        }
      });
    }

    return rules;
  }

  function buildLagoonBreezeSeasonRules(baseYear, yearsToGenerate = 20) {
    const baseRates = { low: 2000, mid: 2500, high: 5500 };
    const rules = [
      { start: baseYear + '-01-01', end: baseYear + '-01-15', flat: baseRates.high }
    ];

    for (let year = baseYear; year < baseYear + yearsToGenerate; year += 1) {
      const multiplier = Math.pow(1.1, year - baseYear);
      const low = Math.round(baseRates.low * multiplier);
      const mid = Math.round(baseRates.mid * multiplier);
      const high = Math.round(baseRates.high * multiplier);

      rules.push(
        { start: year + '-01-16', end: year + '-04-30', flat: mid },
        { start: year + '-05-01', end: year + '-09-30', flat: low },
        { start: year + '-10-01', end: year + '-11-30', flat: mid },
        { start: year + '-12-01', end: (year + 1) + '-01-15', flat: high }
      );
    }

    return rules;
  }

  function buildLagoonBreezeDecemberMinStayRules(baseYear, yearsToGenerate = 6) {
    const rules = [];

    for (let year = baseYear; year < baseYear + yearsToGenerate; year += 1) {
      rules.push({
        start: year + '-12-01',
        end: year + '-12-31',
        minStayNights: 7
      });
    }

    return rules;
  }

  function buildCaptainsQuartersSeasonRules(baseYear, yearsToGenerate = 20) {
    const baseRates = { low: 1320, mid: 1980, high: 3520 };
    const rules = [];

    for (let year = baseYear; year < baseYear + yearsToGenerate; year += 1) {
      const multiplier = Math.pow(1.1, year - baseYear);
      const low = Math.round(baseRates.low * multiplier);
      const mid = Math.round(baseRates.mid * multiplier);
      const high = Math.round(baseRates.high * multiplier);

      rules.push(
        { start: year + '-01-01', end: year + '-01-15', flat: high },
        // April was not specified separately, so it follows mid season to keep pricing continuous.
        { start: year + '-01-16', end: year + '-04-30', flat: mid },
        { start: year + '-05-01', end: year + '-09-30', flat: low },
        { start: year + '-10-01', end: year + '-11-30', flat: mid },
        { start: year + '-12-01', end: year + '-12-31', flat: high }
      );
    }

    return rules;
  }

  function buildClementineSeasonRules(baseYear, yearsToGenerate = 20) {
    const baseRates = {
      low: 1749,
      mid: 2475,
      high: 4862
    };
    const rules = [];

    for (let year = baseYear; year < baseYear + yearsToGenerate; year += 1) {
      const multiplier = Math.pow(1.1, year - baseYear);
      const rates = {
        low: Math.round(baseRates.low * multiplier),
        mid: Math.round(baseRates.mid * multiplier),
        high: Math.round(baseRates.high * multiplier)
      };

      rules.push(
        { start: year + '-01-01', end: year + '-01-15', flat: rates.high, label: 'High season' },
        { start: year + '-01-16', end: year + '-04-30', flat: rates.mid, label: 'Mid season' },
        { start: year + '-05-01', end: year + '-09-30', flat: rates.low, label: 'Low season' },
        { start: year + '-10-01', end: year + '-11-26', flat: rates.mid, label: 'Mid season' },
        { start: year + '-11-27', end: (year + 1) + '-01-15', flat: rates.high, label: 'High season' }
      );
    }

    return rules;
  }

  function buildIrokoSeasonRules(baseYear, yearsToGenerate = 20) {
    const baseRates = {
      low: 9000,
      mid: 13500,
      pre: 13500,
      high: 33450
    };
    const rules = [];

    for (let year = baseYear; year < baseYear + yearsToGenerate; year += 1) {
      const multiplier = Math.pow(1.1, year - baseYear);
      const rates = {
        low: Math.round(baseRates.low * multiplier),
        mid: Math.round(baseRates.mid * multiplier),
        pre: Math.round(baseRates.pre * multiplier),
        high: Math.round(baseRates.high * multiplier)
      };

      rules.push(
        { start: year + '-01-16', end: year + '-04-30', flat: rates.mid, label: 'MID ' + year },
        { start: year + '-05-01', end: year + '-09-30', flat: rates.low, label: 'LOW ' + year },
        { start: year + '-10-01', end: year + '-12-14', flat: rates.pre, label: 'PRE ' + year },
        { start: year + '-12-15', end: (year + 1) + '-01-15', flat: rates.high, label: 'HIGH ' + year }
      );
    }

    return rules;
  }

  function buildClementineFestiveMinStayRules(baseYear, yearsToGenerate = 20) {
    const rules = [];

    for (let year = baseYear; year < baseYear + yearsToGenerate; year += 1) {
      rules.push({
        start: year + '-12-13',
        end: (year + 1) + '-01-09',
        minStayNights: 7,
        label: 'Festive season'
      });
    }

    return rules;
  }

  function buildBaycrestFestivePricingRules(baseYear, yearsToGenerate = 20) {
    const baseRate = 22000;
    const rules = [];

    for (let year = baseYear; year < baseYear + yearsToGenerate; year += 1) {
      const multiplier = Math.pow(1.1, year - baseYear);
      const rate = Math.round(baseRate * multiplier);

      rules.push({
        start: year + '-12-05',
        end: (year + 1) + '-01-05',
        flat: rate
      });
    }

    return rules;
  }

  const lagoonBreezeWebsitePricingRules = buildLagoonBreezeSeasonRules(2026);
  const lagoonBreezeSeasonalMinStayRules = buildLagoonBreezeDecemberMinStayRules(2026);
  const lagoonBreezeMaxBookableDateKey = '2027-12-31';
  const baycrestWebsitePricingRules = buildBaycrestFestivePricingRules(2026);
  const baycrestMaxBookableDateKey = dateToKey(addYears(toUtcDate(getTodayKey()), 1));
  const captainsQuartersWebsitePricingRules = buildCaptainsQuartersSeasonRules(2026);
  const captainsQuartersMaxBookableDateKey = dateToKey(addYears(toUtcDate(getTodayKey()), 1));
  const clementineBaseYear = 2026;
  const clementineWebsitePricingRules = buildClementineSeasonRules(clementineBaseYear);
  const clementineSeasonalMinStayRules = buildClementineFestiveMinStayRules(clementineBaseYear);
  const clementineMaxBookableDateKey = dateToKey(addYears(toUtcDate(getTodayKey()), 1));
  const irokoWebsitePricingRules = buildIrokoSeasonRules(2026);
  const irokoMaxBookableDateKey = dateToKey(addYears(toUtcDate(getTodayKey()), 2));

  const emptyFeeds = {
    airbnb: { publicUrl: '', proxyUrl: '' },
    booking: { publicUrl: '', proxyUrl: '' },
    lekkeslaap: { publicUrl: '', proxyUrl: '' }
  };

  const workbookFeeds = {
    'robberg-room': {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1057078726114049454.ics?t=44780bae9ba74a2da0c98a432b8f9920', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export?t=f6f7867c-3bc8-4af9-b69e-ce3de3e7bbb8', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar?t=R1RIQy9YVWE3WEpnVkhwYmVXY0swQT09&rt=387388', proxyUrl: '' }
    },
    'boardwalk-retreat': {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1544030442364219781.ics?t=a02b9d61eb784293898688c7348cd48a', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export/t/24a9ac78-f475-4793-adaa-eb74a4981ecc.ics', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=UTRCNGg5cVdYV0ZySVhlUHlEbDFsdz09', proxyUrl: '' }
    },
    'boardwalk-corner': {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1594163527975673800.ics?t=2f394e9ee4a84f0c9a415378cfaffb65', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export?t=6a96eccf-cb98-464b-8bcb-56a3a580bb92', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=UE00ZVMrN05QSDNPeThrZ1JtVWZYUT09', proxyUrl: '' }
    },
    'hill-and-tides': {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/17194325.ics?t=5e69ea4862214825971565c84b28b114', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export/t/95c65b37-e8c4-46f4-bfd0-541e19665374.ics', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=eEtMK1lObmUrV0diSU5qZnAyMGI2Zz09', proxyUrl: '' }
    },
    'sea-esta': {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1537570888660495827.ics?t=007b18e3de0c4e3f965743c141955955', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export?t=dd4acdd3-d054-424a-b703-40bcd7087e56', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=bWVURk9iMGszWHRwTk1TSDlPOWsvdz09', proxyUrl: '' }
    },
    panorama: {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1273769707855170935.ics?t=370e01c5a30a4b82b055effa514abc11', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export?t=cd425806-498d-44b7-a244-d39363b93343', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=V3h0T3hnRzJNVzRON0ZFaUJKbzVXZz09', proxyUrl: '' }
    },
    'magnificent-view': {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/815780029709459988.ics?t=8fa120e2fd4a4522be17e826e8495274', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export?t=baacc4f2-93a4-4ee6-ae44-5459af18f264', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=RGpPR1IyWjErTTU3MG5Xd1F2Qmd6Zz09', proxyUrl: '' }
    },
    'sanctuary-hideaway': {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1594810862740171954.ics?t=8dd2a5ce0a964925afa1c2e4c98db027', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export?t=df634b96-b1fc-41aa-8739-eb93b542400c', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=L09CalRjaS9JS29ualhBNjQ1aExRUT09', proxyUrl: '' }
    },
    'la-lapa': {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1632477552314385539.ics?t=37c292c4edde4cedbdc09c3d211e2390', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export/t/dac27f8c-9b34-4699-9aee-51cfb1f77409.ics', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=K1lRN3dWWFczRW1XRDhMTzY1eUUwZz09', proxyUrl: '' }
    },
    'la-med': {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1632507681869025301.ics?t=80e40c0b817c4a4c9e74f7a27fa386d4', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export?t=c34a37f7-7e74-445d-b563-5234b37f0070', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=ajlobVQwd3JhdWRrVHE2ODRQSHZwZz09', proxyUrl: '' }
    },
    baycrest: {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1705657368873018958.ics?t=de66d1c052674c079d3fd9ee6459a2de', proxyUrl: '' },
      booking: { publicUrl: '', proxyUrl: '' },
      lekkeslaap: { publicUrl: '', proxyUrl: '' }
    },
    'captains-quarters': {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1708541986364844815.ics?t=758a324eb2cf4a598d32da01e340e561', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export?t=8ee8cc25-159e-4bec-b8e4-3ed64993f314', proxyUrl: '' },
      lekkeslaap: { publicUrl: '', proxyUrl: '' }
    },
    'clementine-cottage': {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1739001401218091718.ics?t=90882ba6158448a2b5a02bfbdf163f3f', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export?t=e4c8764c-0404-431b-ab07-90770c55a25e', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=Mk9VNEs5T2NqMVNHTis4SUIyMm5TZz09', proxyUrl: '' }
    },
    tremezzo: {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1449790786900033073.ics?t=1a7df908d1504694a03ef2e1136ea235', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export?t=7310918d-fba5-4222-bb61-31db389e68ee', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=ditIU0RWN1RWcWxCTDU2ZVdiejlHdz09', proxyUrl: '' }
    },
    farallon: {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1432408628554735932.ics?t=d2c24b2d04fb4e3f8833ee67ef137746', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export?t=47aceb86-0313-4a49-9484-2355dadf1733', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=cjVkaHVybEhJcU8yd3pTTDd6aG1Jdz09', proxyUrl: '' }
    },
    toplis: {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/42305882.ics?t=e06e580a2db3489db20b53fe850afd8d', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export?t=549e5b28-e998-4d4b-adb5-6bd1efe74300', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=Q2xhUGZJa1VwWnBzVDlvVWdHME5Gdz09', proxyUrl: '' }
    },
    'goose-valley': {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1289587900991700333.ics?t=aaddd8ed369c44268b8cb8586c1bbf2a', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export?t=4c781b53-86da-47a4-8d32-aff8d77e70a6', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=aW5RQ1FSVFFzbzhjenAzc1JxaWlnZz09', proxyUrl: '' }
    },
    'lagoon-breeze': {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/567283432932835665.ics?t=8a71b6341d2a421ea1f6060d2820d25c', proxyUrl: '' },
      booking: { publicUrl: '', proxyUrl: '' },
      lekkeslaap: { publicUrl: '', proxyUrl: '' }
    },
    'lookout-room': {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1270916152598267325.ics?t=5918b28c8b824e2fb511d80b316c6e5d', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export?t=7ecde551-10b0-4d40-b77d-dbdc02cfd62b', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=R1RIQy9YVWE3WEpnVkhwYmVXY0swQT09&rt=431368', proxyUrl: '' }
    },
    'sanctuary-room': {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1320220730315653920.ics?t=ff1ad21061054a5890078cf8dcd4025d', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export?t=7d5b2799-cf08-4b91-87d2-ef141168f1dd', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=R1RIQy9YVWE3WEpnVkhwYmVXY0swQT09&rt=431471', proxyUrl: '' }
    },
    'plett-escape': {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1450044015443213703.ics?t=bb16b85d0bb443f58c5871d546a923a8', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export?t=ff2c61c2-6ef0-496b-a950-199536049e91', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=Y1QxdUdkVndzVVd6WjE0VVJ1THZGQT09', proxyUrl: '' }
    },
    'the-place-to-stay': {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1625181361211091031.ics?t=9cd1920ede8d467bb1e8aff0ceeb318d', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export?t=0f6717d6-0738-4d30-a5e8-58a8f502273a', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=dHhwczFKcm92a0NSV29EQW5uL0pIUT09', proxyUrl: '' }
    },
    arrowood: {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/866493429255914128.ics?t=537892a729b24860a00d65301a57f470', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export?t=b71893e2-7826-4f0a-acd5-962d5ab506c9', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=dUNzVGZDR1hORVd6Sis0aXAxZzF4QT09', proxyUrl: '' }
    },
    'little-lincoln': {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1452009096746457071.ics?t=6681645d227e481c82e847ce6f4beb71', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export?t=eb04aa54-fef9-4429-85bc-9fc956aa9100', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=SC9JVXBoTTVJdGRWTDExZFVZUjNkUT09', proxyUrl: '' }
    },
    'sound-of-silence': {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1444707311871428890.ics?t=087246a20bab439197d5687bc17f926c', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export?t=78e2de7d-89f9-4cfb-9a41-a5c4401ddb40', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=a2NqUzhQcG8rMjBkc0ZFbE5XdUxzdz09', proxyUrl: '' }
    },
    'stillwater-haven': {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1593403423819671903.ics?t=00048409b7654ed7a374fcd0452081a9', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export?t=7de05f13-3841-491f-840c-d1a01d041206', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=dXp5OWhwcUU3NzU4SVYxQVpNTjJwdz09', proxyUrl: '' }
    },
    'rivers-drift': {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1599061852478668259.ics?t=4990ee792dae4fd5adc8d2191524df9c', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export?t=cd2c45a8-5e00-47ec-8b4e-37a3d77dcd7e', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=Y0FPTnZ2eVlUeEZFdG5qN1BsN2FjQT09', proxyUrl: '' }
    },
    watersong: {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1599091848916000968.ics?t=02654c8d2cfc4ae6a94ded72545b8c02', proxyUrl: '' },
      booking: { publicUrl: '', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=RzFoTEJ4S2UwZ2VGcnZGNU9XMFFYZz09', proxyUrl: '' }
    },
    'sandy-fingers': {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1344704902522360024.ics?t=e34af01baf3f45ff8878044b2014d44e', proxyUrl: '' },
      booking: { publicUrl: '', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=ZU5kNmJXR0NsZDlGQWtBWWd2TnFxdz09&rt=458660', proxyUrl: '' }
    },
    'sandy-toes': {
      airbnb: { publicUrl: 'https://www.airbnb.co.za/calendar/ical/1315094071847316143.ics?t=bc5bcbea770f421983d4fc0a64313af3', proxyUrl: '' },
      booking: { publicUrl: 'https://ical.booking.com/v1/export?t=04c6a1c3-4c3c-4bf4-b53f-09fb5daab3a4', proxyUrl: '' },
      lekkeslaap: { publicUrl: 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=ZU5kNmJXR0NsZDlGQWtBWWd2TnFxdz09&rt=432312', proxyUrl: '' }
    }
  };

  const cleaningFees = {
    'robberg-room': 275,
    'boardwalk-retreat': 350,
    'boardwalk-corner': 330,
    'hill-and-tides': 330,
    'magnificent-view': 330,
    'sanctuary-hideaway': 330,
    baycrest: 330,
    tremezzo: 330,
    'plett-escape': 330,
    'the-place-to-stay': 330,
    arrowood: 330,
    'little-lincoln': 330,
    'lookout-room': 275,
    'sanctuary-room': 275,
    'lagoon-breeze': 330
  };

  const seasonalMinStayRules = {
    'boardwalk-corner': [
      { start: '2026-12-01', end: '2026-12-04', minStayNights: 7 },
      { start: '2026-12-15', end: '2027-01-05', minStayNights: 7 }
    ],
    'hill-and-tides': [
      { start: '2026-12-01', end: '2026-12-04', minStayNights: 7 },
      { start: '2026-12-15', end: '2027-01-05', minStayNights: 7 }
    ],
    'la-med': [
      { start: '2026-12-01', end: '2026-12-04', minStayNights: 7 },
      { start: '2026-12-15', end: '2027-01-05', minStayNights: 7 }
    ],
    'magnificent-view': [
      { start: '2026-11-27', end: '2027-01-05', minStayNights: 7 }
    ],
    'plett-escape': [
      { start: '2026-11-28', end: '2027-01-15', minStayNights: 2 }
    ],
    'rivers-drift': [
      { start: '2026-11-27', end: '2026-12-04', minStayNights: 7 }
    ],
    'sandy-toes': [
      { start: '2026-12-14', end: '2026-12-19', minStayNights: 6 }
    ],
    'sea-esta': [
      { start: '2026-01-16', end: '2026-07-01', minStayNights: 3 },
      { start: '2026-07-02', end: '2026-07-10', minStayNights: 5 },
      { start: '2026-07-11', end: '2026-09-30', minStayNights: 3 },
      { start: '2026-10-01', end: '2026-11-30', minStayNights: 4 },
      { start: '2026-12-01', end: '2027-01-15', minStayNights: 14 }
    ],
    'sound-of-silence': [
      { start: '2026-12-01', end: '2026-12-04', minStayNights: 7 },
      { start: '2027-01-01', end: '2027-01-05', minStayNights: 7 }
    ],
    'the-place-to-stay': [
      { start: '2026-11-28', end: '2027-01-15', minStayNights: 2 }
    ],
    watersong: [
      { start: '2026-12-01', end: '2026-12-04', minStayNights: 7 },
      { start: '2026-12-15', end: '2027-01-05', minStayNights: 7 }
    ]
  };

  const stayRules = {
    tremezzo: { minStayNights: 3, maxStayNights: 30, advanceNoticeDays: 2 },
    arrowood: { minStayNights: 2, maxStayNights: 365, advanceNoticeDays: 1 },
    'boardwalk-corner': { minStayNights: 2, maxStayNights: 365, advanceNoticeDays: 1 },
    'boardwalk-retreat': { minStayNights: 3, maxStayNights: 365, advanceNoticeDays: 1 },
    'robberg-room': { minStayNights: 1, maxStayNights: 30, advanceNoticeDays: 0 },
    'hill-and-tides': { minStayNights: 3, maxStayNights: 365, advanceNoticeDays: 2 },
    'sea-esta': { minStayNights: 5, maxStayNights: 30, advanceNoticeDays: 2 },
    panorama: { minStayNights: 2, maxStayNights: 30, advanceNoticeDays: 1 },
    'magnificent-view': { minStayNights: 2, maxStayNights: 365, advanceNoticeDays: 2 },
    'sanctuary-hideaway': { minStayNights: 3, maxStayNights: 365, advanceNoticeDays: 2 },
    'la-lapa': { minStayNights: 2, maxStayNights: 365, advanceNoticeDays: 1 },
    'la-med': { minStayNights: 2, maxStayNights: 365, advanceNoticeDays: 1 },
    baycrest: { minStayNights: 14, maxStayNights: 31, advanceNoticeDays: 2 },
    'captains-quarters': { minStayNights: 1, maxStayNights: 365, advanceNoticeDays: 0 },
    'clementine-cottage': { minStayNights: 2, maxStayNights: 31, advanceNoticeDays: 1 },
    iroko: { minStayNights: 3, maxStayNights: 31, advanceNoticeDays: 2 },
    farallon: { minStayNights: 3, maxStayNights: 30, advanceNoticeDays: 2 },
    toplis: { minStayNights: 3, maxStayNights: 30, advanceNoticeDays: 2 },
    'goose-valley': { minStayNights: 2, maxStayNights: 30, advanceNoticeDays: 1 },
    'lagoon-breeze': { minStayNights: 2, maxStayNights: 50, advanceNoticeDays: 1 },
    'lookout-room': { minStayNights: 1, maxStayNights: 30, advanceNoticeDays: 0 },
    'sanctuary-room': { minStayNights: 1, maxStayNights: 30, advanceNoticeDays: 0 },
    'plett-escape': { minStayNights: 1, maxStayNights: 60, advanceNoticeDays: 0 },
    'the-place-to-stay': { minStayNights: 1, maxStayNights: 60, advanceNoticeDays: 0 },
    'little-lincoln': { minStayNights: 1, maxStayNights: 20, advanceNoticeDays: 0 },
    'sound-of-silence': { minStayNights: 2, maxStayNights: 30, advanceNoticeDays: 2 },
    'stillwater-haven': { minStayNights: 2, maxStayNights: 365, advanceNoticeDays: 2 },
    'rivers-drift': { minStayNights: 2, maxStayNights: 365, advanceNoticeDays: 2 },
    watersong: { minStayNights: 2, maxStayNights: 365, advanceNoticeDays: 2 },
    'sandy-toes': { minStayNights: 3, maxStayNights: 30, advanceNoticeDays: 2 },
    'sandy-fingers': { minStayNights: 2, maxStayNights: 30, advanceNoticeDays: 1 }
  };

  function buildPropertySource(key, displayName, options = {}) {
    const defaultStayRule = stayRules[key] || {};

    return {
      displayName,
      availabilityMode: options.availabilityMode || 'hybrid',
      festivePeak: null,
      websitePricingRules: Array.isArray(options.websitePricingRules)
        ? options.websitePricingRules
        : buildSeasonRules(websiteRates2026[key]),
      cleaningFee: Number.isFinite(options.cleaningFee) ? options.cleaningFee : (cleaningFees[key] || 0),
      minStayNights: Number.isFinite(options.minStayNights) ? options.minStayNights : (defaultStayRule.minStayNights || 1),
      maxStayNights: Number.isFinite(options.maxStayNights) ? options.maxStayNights : (defaultStayRule.maxStayNights || 365),
      advanceNoticeDays: Number.isFinite(options.advanceNoticeDays) ? options.advanceNoticeDays : (defaultStayRule.advanceNoticeDays || 0),
      sameDayCutoffMinutes: Number.isFinite(options.sameDayCutoffMinutes) ? options.sameDayCutoffMinutes : null,
      preparationTimeNights: Number.isFinite(options.preparationTimeNights) ? options.preparationTimeNights : 0,
      maxBookableDateKey: options.maxBookableDateKey || '',
      seasonalMinStayRules: Array.isArray(options.seasonalMinStayRules)
        ? options.seasonalMinStayRules
        : (seasonalMinStayRules[key] || []),
      seasonalMinStayMode: options.seasonalMinStayMode || 'checkin',
      staticBlockedDateRanges: Array.isArray(options.staticBlockedDateRanges) ? options.staticBlockedDateRanges : [],
      feeds: options.feeds || workbookFeeds[key] || emptyFeeds,
      blockedDatesEndpoint: options.blockedDatesEndpoint || '',
      baseAirbnbRules: []
    };
  }

  const workbookPropertySources = {
    arrowood: buildPropertySource('arrowood', 'Arrowood Apartment', {
      blockedDatesEndpoint: '/api/arrowood-blocks'
    }),
    'robberg-room': buildPropertySource('robberg-room', 'Robberg Room'),
    'lookout-room': buildPropertySource('lookout-room', 'Lookout Room'),
    'sanctuary-room': buildPropertySource('sanctuary-room', 'Sanctuary Room'),
    'hill-and-tides': buildPropertySource('hill-and-tides', 'Hill & Tides'),
    'plett-escape': buildPropertySource('plett-escape', 'Plett Escape'),
    'the-place-to-stay': buildPropertySource('the-place-to-stay', 'The Place to Stay'),
    'little-lincoln': buildPropertySource('little-lincoln', 'Little Lincoln'),
    'sound-of-silence': buildPropertySource('sound-of-silence', 'Sound of Silence'),
    'stillwater-haven': buildPropertySource('stillwater-haven', 'Stillwater Haven'),
    'rivers-drift': buildPropertySource('rivers-drift', 'River\'s Drift'),
    watersong: buildPropertySource('watersong', 'Watersong'),
    'sandy-fingers': buildPropertySource('sandy-fingers', 'Sandy Fingers'),
    'sandy-toes': buildPropertySource('sandy-toes', 'Sandy Toes'),
    farallon: buildPropertySource('farallon', 'Farallon'),
    toplis: buildPropertySource('toplis', 'Toplis'),
    panorama: buildPropertySource('panorama', 'Panorama'),
    'sea-esta': buildPropertySource('sea-esta', 'Sea Esta'),
    'goose-valley': buildPropertySource('goose-valley', 'Goose Valley'),
    'lagoon-breeze': buildPropertySource('lagoon-breeze', 'Lagoon Breeze Apartment', {
      websitePricingRules: lagoonBreezeWebsitePricingRules,
      maxBookableDateKey: lagoonBreezeMaxBookableDateKey,
      seasonalMinStayRules: lagoonBreezeSeasonalMinStayRules
    }),
    'boardwalk-retreat': buildPropertySource('boardwalk-retreat', 'Boardwalk Retreat'),
    'boardwalk-corner': buildPropertySource('boardwalk-corner', 'Boardwalk Corner', {
      blockedDatesEndpoint: '/api/boardwalk-corner-blocks'
    }),
    'clementine-cottage': buildPropertySource('clementine-cottage', 'Clementine Cottage', {
      availabilityMode: 'static-json-only',
      websitePricingRules: clementineWebsitePricingRules,
      maxBookableDateKey: clementineMaxBookableDateKey,
      preparationTimeNights: 1,
      seasonalMinStayRules: clementineSeasonalMinStayRules,
      seasonalMinStayMode: 'stay-overlap'
    }),
    'magnificent-view': buildPropertySource('magnificent-view', 'Magnificent View'),
    'sanctuary-hideaway': buildPropertySource('sanctuary-hideaway', 'Sanctuary Hideaway'),
    'la-lapa': buildPropertySource('la-lapa', 'La-Lapa'),
    'la-med': buildPropertySource('la-med', 'La-Med'),
    baycrest: buildPropertySource('baycrest', 'Baycrest Villa', {
      availabilityMode: 'static-json-only',
      websitePricingRules: baycrestWebsitePricingRules,
      maxBookableDateKey: baycrestMaxBookableDateKey,
      preparationTimeNights: 2
    }),
    'captains-quarters': buildPropertySource('captains-quarters', 'Captain\'s Quarters', {
      websitePricingRules: captainsQuartersWebsitePricingRules,
      maxBookableDateKey: captainsQuartersMaxBookableDateKey,
      sameDayCutoffMinutes: 12 * 60
    }),
    iroko: buildPropertySource('iroko', 'Iroko Luxury Mansion', {
      availabilityMode: 'query-only',
      websitePricingRules: irokoWebsitePricingRules,
      cleaningFee: 0,
      preparationTimeNights: 2,
      maxBookableDateKey: irokoMaxBookableDateKey,
      staticBlockedDateRanges: [
        { start: '2026-01-01', end: '2026-01-02' },
        { start: '2026-01-06', end: '2026-01-12' },
        { start: '2026-01-31', end: '2026-01-31' },
        { start: '2026-02-01', end: '2026-02-09' },
        { start: '2026-02-11', end: '2026-02-18' },
        { start: '2026-03-19', end: '2026-03-24' },
        { start: '2026-03-29', end: '2026-03-31' },
        { start: '2026-04-01', end: '2026-04-04' },
        { start: '2026-06-28', end: '2026-06-30' },
        { start: '2026-07-01', end: '2026-07-04' },
        { start: '2026-07-23', end: '2026-07-29' },
        { start: '2026-07-31', end: '2026-07-31' },
        { start: '2026-08-01', end: '2026-08-19' },
        { start: '2026-09-20', end: '2026-09-27' },
        { start: '2026-11-13', end: '2026-11-16' },
        { start: '2026-11-28', end: '2026-12-04' },
        { start: '2027-01-13', end: '2027-03-22' }
      ]
    }),
    tremezzo: buildPropertySource('tremezzo', 'Tremezzo')
  };

  // Only show calendars for properties that are configured for live or query-only calendars.
  const enabledCalendarSources = visibleCalendarSources;

  const sourceKey = bookingRoot.dataset.bookingSource || '';
  if (!enabledCalendarSources.has(sourceKey)) {
    bookingRoot.closest('.cw-booking-group')?.setAttribute('hidden', 'hidden');
    return;
  }

  const workbookSource = workbookPropertySources[sourceKey] || {
    displayName: bookingRoot.dataset.bookingName || 'Property',
    availabilityMode: 'hybrid',
    festivePeak: null,
    websitePricingRules: [],
    cleaningFee: 0,
    feeds: {
      airbnb: { publicUrl: '', proxyUrl: '' },
      booking: { publicUrl: '', proxyUrl: '' },
      lekkeslaap: { publicUrl: '', proxyUrl: '' }
    },
    blockedDatesEndpoint: '',
    minStayNights: 1,
    maxStayNights: 365,
    advanceNoticeDays: 0,
    sameDayCutoffMinutes: null,
    preparationTimeNights: 0,
    staticBlockedDateRanges: [],
    seasonalMinStayRules: [],
    seasonalMinStayMode: 'checkin',
    baseAirbnbRules: []
  };
  const propertyConfig = {
    sourceKey,
    propertyName: bookingRoot.dataset.bookingName || workbookSource.displayName,
    availabilityMode: bookingRoot.dataset.availabilityMode || workbookSource.availabilityMode || 'hybrid',
    availabilityApi: bookingRoot.dataset.availabilityApi || '',
    availabilityJson: bookingRoot.dataset.availabilityJson || '',
    feeds: {
      airbnb: {
        publicUrl: bookingRoot.dataset.airbnbIcalUrl || workbookSource.feeds.airbnb.publicUrl,
        proxyUrl: bookingRoot.dataset.airbnbIcalProxy || workbookSource.feeds.airbnb.proxyUrl
      },
      booking: {
        publicUrl: bookingRoot.dataset.bookingIcalUrl || workbookSource.feeds.booking.publicUrl,
        proxyUrl: bookingRoot.dataset.bookingIcalProxy || workbookSource.feeds.booking.proxyUrl
      },
      lekkeslaap: {
        publicUrl: bookingRoot.dataset.lekkeslaapIcalUrl || workbookSource.feeds.lekkeslaap.publicUrl,
        proxyUrl: bookingRoot.dataset.lekkeslaapIcalProxy || workbookSource.feeds.lekkeslaap.proxyUrl
      }
    },
    blockedDatesEndpoint: workbookSource.blockedDatesEndpoint,
    websitePricingRules: workbookSource.websitePricingRules || [],
    cleaningFee: Number.isFinite(workbookSource.cleaningFee) ? workbookSource.cleaningFee : 0,
    minStayNights: Number.isFinite(workbookSource.minStayNights) ? workbookSource.minStayNights : 1,
    maxStayNights: Number.isFinite(workbookSource.maxStayNights) ? workbookSource.maxStayNights : 365,
    advanceNoticeDays: Number.isFinite(workbookSource.advanceNoticeDays) ? workbookSource.advanceNoticeDays : 0,
    sameDayCutoffMinutes: Number.isFinite(workbookSource.sameDayCutoffMinutes) ? workbookSource.sameDayCutoffMinutes : null,
    preparationTimeNights: Number.isFinite(workbookSource.preparationTimeNights) ? workbookSource.preparationTimeNights : 0,
    maxBookableDateKey: workbookSource.maxBookableDateKey || '',
    seasonalMinStayRules: Array.isArray(workbookSource.seasonalMinStayRules) ? workbookSource.seasonalMinStayRules : [],
    seasonalMinStayMode: workbookSource.seasonalMinStayMode || 'checkin',
    staticBlockedDateRanges: Array.isArray(workbookSource.staticBlockedDateRanges) ? workbookSource.staticBlockedDateRanges : [],
    airbnbPricingRules: applyWorkbookFestiveCurve(workbookSource.baseAirbnbRules, workbookSource.festivePeak)
  };

  const todayKey = getTodayKey();
  const maxBookingDateKey = propertyConfig.maxBookableDateKey || dateToKey(addYears(toUtcDate(todayKey), 1));
  const maxCalendarDateKey = maxBookingDateKey;
  const state = {
    todayKey,
    viewMonthKey: '',
    open: false,
    activeField: 'checkin',
    selectionIntent: 'checkin',
    checkIn: '',
    checkOut: '',
    hoverDate: '',
    guests: Number(guestSelect?.value || 1),
    blockedDates: new Set()
  };

  state.viewMonthKey = getMonthStartKey(state.todayKey);

  dateTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const triggerType = trigger.getAttribute('data-date-trigger') || 'dates';
      const target = triggerType === 'dates'
        ? (state.checkIn && !state.checkOut ? 'checkout' : 'checkin')
        : triggerType;
      openCalendar(target);
    });
  });

  bookingRoot.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  prevBtn.addEventListener('click', () => {
    const minViewKey = getMonthStartKey(state.todayKey);
    const candidateKey = dateToKey(addMonths(toUtcDate(state.viewMonthKey), -1));
    if (candidateKey < minViewKey) return;
    state.viewMonthKey = candidateKey;
    renderCalendar();
  });

  nextBtn.addEventListener('click', () => {
    const maxViewKey = getMonthStartKey(maxCalendarDateKey);
    const candidateKey = dateToKey(addMonths(toUtcDate(state.viewMonthKey), 1));
    if (candidateKey > maxViewKey) return;
    state.viewMonthKey = candidateKey;
    renderCalendar();
  });

  if (guestSelect) {
    guestSelect.addEventListener('change', () => {
      state.guests = Number(guestSelect.value || 1);
      updateSummary();
    });
  }

  document.addEventListener('click', (event) => {
    if (!state.open) return;
    if (bookingRoot.contains(event.target)) return;
    closeCalendar();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.open) {
      closeCalendar();
    }
  });

  if (form) {
    form.addEventListener('submit', (event) => {
      const stay = getStayDetails();

      if (state.checkIn && !state.checkOut) {
        event.preventDefault();
        openCalendar('checkout');
        setStatus('Please select a checkout date before sending your enquiry.', 'warning');
        return;
      }

      if (state.checkIn && state.checkOut && !isStayLengthAllowed(state.checkIn, state.checkOut)) {
        event.preventDefault();
        openCalendar('checkout');
        setStatus(buildStayLengthMessage(getStayDates(state.checkIn, state.checkOut).length, state.checkIn, state.checkOut), 'warning');
        return;
      }

      totalInput.value = stay.total !== null ? currency(stay.total) : '';
    });
  }

  window.addEventListener('resize', debounce(renderCalendar, 120));

  renderBookingRules();
  loadAvailability();
  updateSummary();
  renderCalendar();

  async function loadAvailability() {
    if (usesQueryOnlyAvailability()) {
      state.blockedDates = buildBlockedDateRangesSet(
        propertyConfig.staticBlockedDateRanges,
        propertyConfig.preparationTimeNights
      );
      renderCalendar();
      return;
    }

    let lastError = null;

    try {
      try {
        const staticBlockedDates = await loadAvailabilityFromJson();
        if (staticBlockedDates) {
          state.blockedDates = staticBlockedDates;
          renderCalendar();
          return;
        }
      } catch (error) {
        lastError = error;
      }

      if (usesStaticJsonOnlyAvailability()) {
        handleStrictAvailabilityFailure(lastError);
        return;
      }

      try {
        const apiBlockedDates = await loadAvailabilityFromApi();
        if (apiBlockedDates) {
          state.blockedDates = apiBlockedDates;
          renderCalendar();
          return;
        }
      } catch (error) {
        lastError = error;
      }

      const configuredChannels = getConfiguredFeedChannels();
      if (configuredChannels.length) {
        const results = await Promise.allSettled(
          configuredChannels.map((channel) => loadIcalFeed(channel))
        );
        const successfulResults = results
          .filter((result) => result.status === 'fulfilled')
          .map((result) => result.value.blockedDates);

        if (successfulResults.length) {
          state.blockedDates = mergeMultipleSets(successfulResults);
          return;
        }

        const firstRejected = results.find((result) => result.status === 'rejected');
        if (firstRejected) {
          lastError = firstRejected.reason;
        }
      }

      const legacyBlockedDates = await loadAvailabilityFromLegacyEndpoint();
      if (legacyBlockedDates) {
        state.blockedDates = legacyBlockedDates;
        renderCalendar();
        return;
      }
    } catch (error) {
      lastError = error;
    }

    if (lastError) {
      console.warn('Failed to load booking blocks for ' + propertyConfig.propertyName, lastError);
    }

    renderCalendar();
  }

  function usesStaticJsonOnlyAvailability() {
    return propertyConfig.availabilityMode === 'static-json-only';
  }

  function usesQueryOnlyAvailability() {
    return propertyConfig.availabilityMode === 'query-only';
  }

  function handleStrictAvailabilityFailure(error) {
    if (error) {
      console.warn('Failed to load GitHub availability for ' + propertyConfig.propertyName, error);
    }

    state.blockedDates = buildBlockedDateSet(state.todayKey, maxBookingDateKey);
    setStatus('Availability is syncing from GitHub. Please enquire and we will confirm the dates.', 'warning');
    renderCalendar();
  }

  async function loadAvailabilityFromJson() {
    const url = getStaticAvailabilityUrl();
    if (!url) return null;

    const response = await fetch(url, { cache: 'no-store' });
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Static availability HTTP ' + response.status);
    }

    const payload = await response.json();
    return new Set(Array.isArray(payload.blockedDates) ? payload.blockedDates : []);
  }

  async function loadAvailabilityFromApi() {
    const url = getAvailabilityApiUrl();
    if (!url) return null;

    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Availability API HTTP ' + response.status);
    }

    const payload = await response.json();
    if (Array.isArray(payload.warnings) && payload.warnings.length) {
      console.warn('Availability warnings for ' + propertyConfig.propertyName + ':', payload.warnings);
    }

    return new Set(Array.isArray(payload.blockedDates) ? payload.blockedDates : []);
  }

  async function loadAvailabilityFromLegacyEndpoint() {
    const url = getLegacyAvailabilityUrl();
    if (!url) return null;

    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Legacy availability HTTP ' + response.status);
    }

    const payload = await response.json();
    return new Set(Array.isArray(payload.blockedDates) ? payload.blockedDates : []);
  }

  function getConfiguredFeedChannels() {
    return ['airbnb', 'booking', 'lekkeslaap'].filter((channel) => hasConfiguredFeed(channel));
  }

  function hasConfiguredFeed(channel) {
    const feed = propertyConfig.feeds[channel];
    return Boolean(feed && (feed.proxyUrl || feed.publicUrl));
  }

  async function loadIcalFeed(channel) {
    const feed = propertyConfig.feeds[channel];
    const directUrl = feed.publicUrl;
    const explicitProxyUrl = feed.proxyUrl;
    const fallbackProxyUrl = directUrl ? getLocalProxyUrl(directUrl) : '';

    if (!directUrl && !explicitProxyUrl && !fallbackProxyUrl) {
      return { blockedDates: new Set() };
    }

    const candidateUrls = [explicitProxyUrl, fallbackProxyUrl, directUrl].filter(Boolean);
    let lastError = null;

    for (const url of candidateUrls) {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(channel + ' HTTP ' + response.status);
        }

        const calendarText = await response.text();
        return {
          blockedDates: parseIcalBlockedDates(calendarText, {
            preparationTimeNights: propertyConfig.preparationTimeNights
          })
        };
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error(channel + ' feed could not be loaded');
  }

  function openCalendar(field) {
    state.open = true;
    state.activeField = field === 'checkout' ? 'checkout' : 'checkin';
    state.selectionIntent = state.activeField;
    bookingRoot.classList.add('is-open');
    updateFieldFocus();
    renderCalendar();
  }

  function closeCalendar() {
    state.open = false;
    state.hoverDate = '';
    state.selectionIntent = 'auto';
    bookingRoot.classList.remove('is-open');
    updateFieldFocus();
    renderCalendar();
  }

  function updateFieldFocus() {
    dateTriggers.forEach((trigger) => {
      const target = trigger.getAttribute('data-date-trigger');
      const isRangeTrigger = target === 'dates';
      trigger.classList.toggle('is-active', state.open && (isRangeTrigger || target === state.activeField));
      trigger.setAttribute('aria-expanded', String(state.open));
    });
  }

  function renderCalendar() {
    monthsEl.innerHTML = '';

    const visibleMonthCount = getVisibleMonthCount();
    const minViewKey = getMonthStartKey(state.todayKey);
    const maxViewKey = getMonthStartKey(maxCalendarDateKey);
    if (state.viewMonthKey < minViewKey) {
      state.viewMonthKey = minViewKey;
    }
    if (state.viewMonthKey > maxViewKey) {
      state.viewMonthKey = maxViewKey;
    }

    prevBtn.disabled = state.viewMonthKey <= minViewKey;
    nextBtn.disabled = state.viewMonthKey >= maxViewKey;

    for (let monthOffset = 0; monthOffset < visibleMonthCount; monthOffset += 1) {
      const monthDate = addMonths(toUtcDate(state.viewMonthKey), monthOffset);
      const monthKey = dateToKey(monthDate);
      if (monthKey > maxViewKey) break;
      monthsEl.appendChild(createMonthCard(monthDate));
    }
  }

  function createMonthCard(monthDate) {
    const card = document.createElement('article');
    card.className = 'cw-booking-month';

    const monthHeader = document.createElement('div');
    monthHeader.className = 'cw-booking-month-header';

    const title = document.createElement('h4');
    title.textContent = monthDate.toLocaleString('en-ZA', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    });
    monthHeader.appendChild(title);

    card.appendChild(monthHeader);

    const weekdayRow = document.createElement('div');
    weekdayRow.className = 'cw-booking-weekdays';
    weekdayLabels.forEach((label) => {
      const dayLabel = document.createElement('div');
      dayLabel.className = 'cw-booking-weekday';
      dayLabel.textContent = label;
      weekdayRow.appendChild(dayLabel);
    });
    card.appendChild(weekdayRow);

    const grid = document.createElement('div');
    grid.className = 'cw-booking-grid';

    const firstOfMonth = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1));
    const daysInMonth = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0)).getUTCDate();
    const leadingPads = firstOfMonth.getUTCDay();

    for (let padIndex = 0; padIndex < leadingPads; padIndex += 1) {
      const pad = document.createElement('div');
      pad.className = 'cw-booking-pad';
      grid.appendChild(pad);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateKey = dateToKey(new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), day)));
      grid.appendChild(createDayButton(day, dateKey));
    }

    card.appendChild(grid);
    return card;
  }

  function createDayButton(dayNumber, dateKey) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cw-booking-day';
    button.textContent = String(dayNumber);

    const isPast = dateKey < state.todayKey;
    const isBlocked = state.blockedDates.has(dateKey);
    const isStart = state.checkIn === dateKey;
    const isEnd = state.checkOut === dateKey;
    const isInRange = Boolean(state.checkIn && state.checkOut && dateKey > state.checkIn && dateKey < state.checkOut);
    const isCheckoutOnly = state.activeField === 'checkout' && state.checkIn && dateKey > state.checkIn && isBlocked && isSelectableCheckout(dateKey);
    const isCheckInStep =
      state.selectionIntent === 'checkin' ||
      !state.checkIn ||
      Boolean(state.checkOut) ||
      (state.selectionIntent === 'checkout' && state.checkIn && dateKey <= state.checkIn);
    const isAdvanceNoticeBlocked = isCheckInStep && !isCheckInAllowed(dateKey);
    const isDisabledRangeStep = state.activeField === 'checkout' && state.checkIn && dateKey > state.checkIn && !isSelectableCheckout(dateKey);
    const isBeyondMax = dateKey > maxBookingDateKey;

    if (isPast) button.classList.add('is-past');
    if (isBlocked && !isCheckoutOnly) button.classList.add('is-blocked');
    if (isCheckoutOnly) button.classList.add('is-checkout-only');
    if (isBeyondMax) button.classList.add('is-not-yet-open');
    if (isAdvanceNoticeBlocked) button.classList.add('is-disabled');
    if (isStart) button.classList.add('is-start');
    if (isEnd) button.classList.add('is-end');
    if (isInRange) button.classList.add('is-in-range');
    if (isDisabledRangeStep) button.classList.add('is-range-disabled');

    const isHardDisabled = isPast || (isBlocked && !isCheckoutOnly) || isBeyondMax || isDisabledRangeStep;
    if (isHardDisabled) {
      button.disabled = true;
    } else {
      button.addEventListener('pointerup', (event) => {
        event.stopPropagation();
        event.preventDefault();
        if (isAdvanceNoticeBlocked) {
          setStatus(buildAdvanceNoticeMessage(), 'warning');
          return;
        }
        handleDateClick(dateKey);
      });
    }

    button.setAttribute('aria-label', buildDayLabel(dateKey, isPast, isBlocked, isAdvanceNoticeBlocked, isCheckoutOnly));
    return button;
  }

  function handleDateClick(dateKey) {
    const selectingFreshCheckIn =
      state.selectionIntent === 'checkin' ||
      !state.checkIn ||
      Boolean(state.checkOut);

    if (selectingFreshCheckIn) {
      state.checkIn = dateKey;
      state.checkOut = '';
      state.hoverDate = '';
      state.activeField = 'checkout';
      state.selectionIntent = 'checkout';
      updateSummary();
      updateFieldFocus();
      renderCalendar();
      setStatus('Choose a checkout date next.', 'neutral');
      return;
    }

    if (dateKey <= state.checkIn) {
      state.checkIn = dateKey;
      state.checkOut = '';
      state.hoverDate = '';
      state.activeField = 'checkout';
      state.selectionIntent = 'checkout';
      updateSummary();
      updateFieldFocus();
      renderCalendar();
      setStatus('Check-in updated. Choose a checkout date after it.', 'neutral');
      return;
    }

    if (!isSelectableCheckout(dateKey)) {
      const selectedNights = getStayDates(state.checkIn, dateKey).length;
      if (selectedNights > 0 && !isStayLengthAllowed(state.checkIn, dateKey)) {
        setStatus(buildStayLengthMessage(selectedNights, state.checkIn, dateKey), 'warning');
        return;
      }

      setStatus('That stay crosses blocked dates and cannot be booked.', 'warning');
      return;
    }

    state.checkOut = dateKey;
    state.hoverDate = '';
    state.selectionIntent = 'auto';
    updateSummary();
    closeCalendar();
    if (guestSelect) {
      guestSelect.focus();
    }
    setStatus('', 'neutral');
  }

  function isSelectableCheckout(dateKey) {
    if (!state.checkIn || dateKey <= state.checkIn) return false;
    return isStayLengthAllowed(state.checkIn, dateKey) && isRangeAllowed(state.checkIn, dateKey);
  }

  function isRangeAllowed(checkIn, checkOut) {
    const stayDates = getStayDates(checkIn, checkOut);
    return stayDates.length > 0 && stayDates.every((stayDateKey) => {
      return stayDateKey >= state.todayKey && !state.blockedDates.has(stayDateKey);
    });
  }

  function getStayDates(checkIn, checkOut) {
    if (!checkIn || !checkOut || checkOut <= checkIn) return [];

    const nights = [];
    let cursor = toUtcDate(checkIn);
    const stop = toUtcDate(checkOut);

    while (cursor < stop) {
      nights.push(dateToKey(cursor));
      cursor = addDays(cursor, 1);
    }

    return nights;
  }

  function isCheckInAllowed(dateKey) {
    return dateKey >= getEarliestCheckInKey();
  }

  function getEarliestCheckInKey() {
    if (propertyConfig.advanceNoticeDays > 0) {
      return dateToKey(addDays(toUtcDate(state.todayKey), propertyConfig.advanceNoticeDays));
    }

    if (Number.isFinite(propertyConfig.sameDayCutoffMinutes)) {
      const nowMinutes = getCurrentTimeMinutes();
      if (Number.isFinite(nowMinutes) && nowMinutes >= propertyConfig.sameDayCutoffMinutes) {
        return dateToKey(addDays(toUtcDate(state.todayKey), 1));
      }
    }

    return state.todayKey;
  }

  function getMinimumStayNights(checkIn, checkOut = '') {
    let minimumStayNights = propertyConfig.minStayNights;
    const shouldCheckStayOverlap = propertyConfig.seasonalMinStayMode === 'stay-overlap' && checkOut;
    const stayDates = shouldCheckStayOverlap ? getStayDates(checkIn, checkOut) : [];

    propertyConfig.seasonalMinStayRules.forEach((rule) => {
      if (!Number.isFinite(rule.minStayNights)) return;

      const ruleApplies = shouldCheckStayOverlap
        ? stayDates.some((dateKey) => dateKey >= rule.start && dateKey <= rule.end)
        : checkIn >= rule.start && checkIn <= rule.end;

      if (ruleApplies) {
        minimumStayNights = Math.max(minimumStayNights, rule.minStayNights);
      }
    });

    return minimumStayNights;
  }

  function isStayLengthAllowed(checkIn, checkOut) {
    const nights = getStayDates(checkIn, checkOut).length;
    return nights >= getMinimumStayNights(checkIn, checkOut) && nights <= propertyConfig.maxStayNights;
  }

  function buildStayLengthMessage(nights, checkIn = state.checkIn, checkOut = state.checkOut) {
    const minimumStayNights = checkIn ? getMinimumStayNights(checkIn, checkOut) : propertyConfig.minStayNights;

    if (nights < minimumStayNights) {
      return 'Please select at least ' + minimumStayNights + ' night' + (minimumStayNights === 1 ? '' : 's') + '.';
    }

    return 'Please select no more than ' + propertyConfig.maxStayNights + ' night' + (propertyConfig.maxStayNights === 1 ? '' : 's') + '.';
  }

  function buildAdvanceNoticeMessage() {
    if (propertyConfig.advanceNoticeDays <= 0 && Number.isFinite(propertyConfig.sameDayCutoffMinutes)) {
      return 'Same-day check-in closes at ' + formatTimeFromMinutes(propertyConfig.sameDayCutoffMinutes) + '.';
    }

    if (propertyConfig.advanceNoticeDays <= 0) {
      return 'This date is not available for check-in.';
    }

    return 'Bookings require at least ' + propertyConfig.advanceNoticeDays + ' day' + (propertyConfig.advanceNoticeDays === 1 ? '' : 's') + ' advance notice.';
  }

  function getStayDetails() {
    const stayDates = getStayDates(state.checkIn, state.checkOut);
    const rateDetails = stayDates.map((dateKey) => getWebsiteNightlyRateDetail(dateKey));
    const nightlyRates = rateDetails
      .map((detail) => detail.rate)
      .filter((value) => value !== null);

    const hasVerifiedPricing = propertyConfig.websitePricingRules.length > 0 || propertyConfig.airbnbPricingRules.length > 0;
    const hasCompletePricing = hasVerifiedPricing && nightlyRates.length === stayDates.length && stayDates.length > 0;
    const accommodationTotal = hasCompletePricing
      ? nightlyRates.reduce((sum, value) => sum + value, 0)
      : null;

    return {
      nights: stayDates.length,
      accommodationTotal,
      total: accommodationTotal !== null
        ? accommodationTotal + propertyConfig.cleaningFee
        : null,
      nightlyLabel: buildNightlyRateLabel(nightlyRates, hasVerifiedPricing, stayDates.length),
      rateDetails,
      rateGroups: buildRateGroups(rateDetails),
      hasCompletePricing
    };
  }

  function renderBookingRules() {
    if (!bookingPanel || !bookingShell) {
      return;
    }

    const ruleItems = buildBookingRuleItems();
    if (!ruleItems.length) return;

    let rulesPanel = bookingPanel.querySelector('[data-booking-rules]');
    let rulesGrid = rulesPanel?.querySelector('.cw-booking-rules-grid');

    if (!rulesPanel) {
      rulesPanel = document.createElement('div');
      rulesPanel.className = 'cw-booking-rules';
      rulesPanel.setAttribute('data-booking-rules', '');

      const title = document.createElement('p');
      title.className = 'cw-booking-rules-title';
      title.textContent = 'Booking rules';

      rulesGrid = document.createElement('div');
      rulesGrid.className = 'cw-booking-rules-grid';

      rulesPanel.append(title, rulesGrid);
      bookingPanel.insertBefore(rulesPanel, bookingShell);
    }

    if (!rulesGrid) return;
    rulesGrid.replaceChildren();

    ruleItems.forEach((item) => {
      const rule = document.createElement('div');
      rule.className = 'cw-booking-rule';

      const label = document.createElement('span');
      label.className = 'cw-booking-rule-label';
      label.textContent = item.label;

      const value = document.createElement('span');
      value.className = 'cw-booking-rule-value';
      value.textContent = item.value;

      rule.append(label, value);
      rulesGrid.append(rule);
    });
  }

  function buildBookingRuleItems() {
    const items = [];
    const seasonalMinimumStayNights = propertyConfig.seasonalMinStayRules
      .map((rule) => rule.minStayNights)
      .filter((value) => Number.isFinite(value));
    const highestSeasonalMinimum = seasonalMinimumStayNights.length
      ? Math.max(...seasonalMinimumStayNights)
      : 0;
    const minimumStayValue = highestSeasonalMinimum > propertyConfig.minStayNights
      ? propertyConfig.seasonalMinStayMode === 'stay-overlap'
        ? formatNights(propertyConfig.minStayNights) + '; ' + formatNights(highestSeasonalMinimum) + ' festive'
        : 'Varies by date'
      : formatNights(propertyConfig.minStayNights);

    if (minimumStayValue) {
      items.push({ label: 'Min stay', value: minimumStayValue });
    }

    if (Number.isFinite(propertyConfig.maxStayNights) && propertyConfig.maxStayNights > 0) {
      items.push({ label: 'Max stay', value: formatNights(propertyConfig.maxStayNights) });
    }

    if (Number.isFinite(propertyConfig.advanceNoticeDays) && propertyConfig.advanceNoticeDays > 0) {
      items.push({ label: 'Advance notice', value: formatDays(propertyConfig.advanceNoticeDays) });
    }

    if (propertyConfig.advanceNoticeDays <= 0 && Number.isFinite(propertyConfig.sameDayCutoffMinutes)) {
      items.push({ label: 'Same-day cutoff', value: formatTimeFromMinutes(propertyConfig.sameDayCutoffMinutes) });
    }

    if (Number.isFinite(propertyConfig.preparationTimeNights) && propertyConfig.preparationTimeNights > 0) {
      items.push({
        label: 'Prep time',
        value: formatNights(propertyConfig.preparationTimeNights) + ' before and after'
      });
    }

    if (Number.isFinite(propertyConfig.cleaningFee) && propertyConfig.cleaningFee > 0) {
      items.push({ label: 'Cleaning fee', value: currency(propertyConfig.cleaningFee) + ' per booking' });
    }

    return items;
  }

  function updateSummary() {
    const stay = getStayDetails();
    const hasRange = Boolean(state.checkIn && state.checkOut);
    const hasCheckInOnly = Boolean(state.checkIn && !state.checkOut);

    compactDates.textContent = hasRange
      ? formatShortDate(state.checkIn) + ' - ' + formatShortDate(state.checkOut)
      : hasCheckInOnly
        ? formatShortDate(state.checkIn) + ' - Select check-out'
        : 'Select check-in and check-out';
    inlineSummary.hidden = !hasRange;
    inlineNights.textContent = hasRange ? String(stay.nights) : 'Select dates';
    inlineTotal.textContent = stay.total !== null ? currency(stay.total) : getTotalPlaceholder(hasRange);

    toggleText.textContent = hasRange
      ? formatShortDate(state.checkIn) + ' to ' + formatShortDate(state.checkOut) + ' | ' + stay.nights + ' night' + (stay.nights === 1 ? '' : 's')
      : hasCheckInOnly
        ? 'Check-in selected. Choose your checkout date.'
        : 'Select dates to open the calendar.';

    checkInInput.value = state.checkIn || '';
    checkOutInput.value = state.checkOut || '';
    guestsInput.value = String(state.guests);
    nightsInput.value = hasRange ? String(stay.nights) : '';
    totalInput.value = stay.total !== null ? currency(stay.total) : '';
    renderPriceBreakdown(stay, hasRange);
  }

  function renderPriceBreakdown(stay, hasRange) {
    if (!bookingPanel) return;

    let breakdown = bookingPanel.querySelector('[data-price-breakdown]');
    if (!breakdown) {
      breakdown = document.createElement('section');
      breakdown.className = 'cw-booking-breakdown';
      breakdown.setAttribute('data-price-breakdown', '');
      breakdown.hidden = true;

      const title = document.createElement('p');
      title.className = 'cw-booking-breakdown-title';
      title.textContent = 'Stay breakdown';

      const summary = document.createElement('div');
      summary.className = 'cw-booking-summary';
      summary.setAttribute('data-price-summary', '');

      const rates = document.createElement('div');
      rates.className = 'cw-booking-rate-breakdown';
      rates.setAttribute('data-rate-breakdown', '');

      breakdown.append(title, summary, rates);
      bookingPanel.appendChild(breakdown);
    }

    breakdown.hidden = !hasRange;
    if (!hasRange) return;

    const summary = breakdown.querySelector('[data-price-summary]');
    const rates = breakdown.querySelector('[data-rate-breakdown]');
    if (!summary || !rates) return;

    summary.replaceChildren(
      createSummaryCard('Check-in', formatLongDate(state.checkIn)),
      createSummaryCard('Check-out', formatLongDate(state.checkOut)),
      createSummaryCard('Nights', formatNights(stay.nights)),
      createSummaryCard('Nightly rates', stay.nightlyLabel),
      createSummaryCard('Accommodation total', stay.accommodationTotal !== null ? currency(stay.accommodationTotal) : getTotalPlaceholder(true), true)
    );

    rates.replaceChildren();

    if (!stay.hasCompletePricing) {
      const unavailable = document.createElement('p');
      unavailable.className = 'cw-booking-rate-note';
      unavailable.textContent = getTotalPlaceholder(true);
      rates.appendChild(unavailable);
      return;
    }

    const list = document.createElement('div');
    list.className = 'cw-booking-rate-list';

    stay.rateGroups.forEach((group) => {
      list.appendChild(createRateRow(
        group.label || 'Nightly rate',
        formatChargedNightSpan(group.start, group.end) + ' | ' + formatNights(group.count),
        currency(group.rate) + ' x ' + group.count + ' = ' + currency(group.rate * group.count)
      ));
    });

    if (propertyConfig.cleaningFee > 0) {
      list.appendChild(createRateRow(
        'Cleaning fee',
        'Per booking',
        currency(propertyConfig.cleaningFee)
      ));
    }

    if (propertyConfig.cleaningFee > 0) {
      list.appendChild(createRateRow(
        'Total',
        'Accommodation and cleaning',
        currency(stay.total),
        true
      ));
    }

    rates.appendChild(list);

    const note = document.createElement('p');
    note.className = 'cw-booking-rate-note';
    note.textContent = stay.rateGroups.length > 1
      ? 'Seasonal rate changes are reflected above. Checkout is not charged as a night.'
      : 'Checkout is not charged as a night.';
    rates.appendChild(note);
  }

  function createSummaryCard(labelText, valueText, isTotal = false) {
    const card = document.createElement('div');
    card.className = isTotal ? 'cw-booking-summary-total' : 'cw-booking-summary-card';

    const label = document.createElement('span');
    label.className = 'cw-booking-summary-label';
    label.textContent = labelText;

    const value = document.createElement('span');
    value.className = 'cw-booking-summary-value';
    value.textContent = valueText;

    card.append(label, value);
    return card;
  }

  function createRateRow(labelText, detailText, valueText, isTotal = false) {
    const row = document.createElement('div');
    row.className = 'cw-booking-rate-row';
    if (isTotal) row.classList.add('is-total');

    const label = document.createElement('span');
    label.className = 'cw-booking-rate-season';
    label.textContent = labelText;

    const detail = document.createElement('span');
    detail.className = 'cw-booking-rate-detail';
    detail.textContent = detailText;

    const value = document.createElement('span');
    value.className = 'cw-booking-rate-value';
    value.textContent = valueText;

    row.append(label, detail, value);
    return row;
  }

  function buildRateGroups(rateDetails) {
    const groups = [];

    rateDetails.forEach((detail) => {
      if (detail.rate === null) return;
      const previous = groups[groups.length - 1];
      if (previous && previous.rate === detail.rate && previous.label === detail.label) {
        previous.end = detail.dateKey;
        previous.count += 1;
        return;
      }

      groups.push({
        start: detail.dateKey,
        end: detail.dateKey,
        label: detail.label,
        rate: detail.rate,
        count: 1
      });
    });

    return groups;
  }

  function buildNightlyRateLabel(nightlyRates, hasVerifiedPricing, stayLength) {
    if (!stayLength) return 'Select dates to see pricing';
    if (!hasVerifiedPricing) return 'Awaiting verified Airbnb pricing';
    if (!nightlyRates.length) return 'Pricing unavailable';

    const minimum = Math.min(...nightlyRates);
    const maximum = Math.max(...nightlyRates);
    return minimum === maximum ? currency(minimum) : currency(minimum) + ' to ' + currency(maximum);
  }

  function getTotalPlaceholder(hasDateRange) {
    if (!hasDateRange) return 'Select dates to see total';
    if (!propertyConfig.websitePricingRules.length && !propertyConfig.airbnbPricingRules.length) return 'Awaiting verified pricing';
    return 'Pricing unavailable';
  }

  function parseIcalBlockedDates(calendarText, options = {}) {
    const blockedDates = new Set();
    const preparationTimeNights = normalizePreparationTimeNights(options.preparationTimeNights);
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
          const blockStartDate = addDays(startDate, -preparationTimeNights);
          const blockEndDate = addDays(endDate, preparationTimeNights);
          let cursor = new Date(blockStartDate.getTime());

          while (cursor < blockEndDate) {
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

  function getAvailabilityApiUrl() {
    if (!propertyConfig.sourceKey) return '';

    const baseUrl = propertyConfig.availabilityApi || (
      window.location.protocol === 'http:' || window.location.protocol === 'https:'
        ? '/api/availability'
        : ''
    );

    if (!baseUrl) return '';

    const resolvedUrl = new URL(baseUrl, window.location.href);
    resolvedUrl.searchParams.set('property', propertyConfig.sourceKey);
    resolvedUrl.searchParams.set('ts', Date.now());
    return resolvedUrl.toString();
  }

  function getStaticAvailabilityUrl() {
    if (!propertyConfig.sourceKey) return '';

    const explicitUrl = propertyConfig.availabilityJson;
    if (explicitUrl) {
      const resolvedExplicitUrl = new URL(explicitUrl, window.location.href);
      resolvedExplicitUrl.searchParams.set('ts', Date.now());
      return resolvedExplicitUrl.toString();
    }

    if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
      return '';
    }

    const relativeUrl = new URL('../../generated/availability/' + propertyConfig.sourceKey + '.json', window.location.href);
    relativeUrl.searchParams.set('ts', Date.now());
    return relativeUrl.toString();
  }

  function getLegacyAvailabilityUrl() {
    if (!propertyConfig.blockedDatesEndpoint) return '';
    const baseUrl = window.location.protocol === 'http:' || window.location.protocol === 'https:'
      ? window.location.origin
      : localSyncApiBaseUrl;
    return baseUrl + propertyConfig.blockedDatesEndpoint + '?ts=' + Date.now();
  }

  function getLocalProxyUrl(targetUrl) {
    return localSyncApiBaseUrl + '/api/ical-proxy?url=' + encodeURIComponent(targetUrl);
  }

  function buildBlockedDateRangesSet(ranges, preparationTimeNights = 0) {
    const blockedDates = new Set();
    if (!Array.isArray(ranges)) return blockedDates;
    const prepNights = Number.isFinite(preparationTimeNights) ? preparationTimeNights : 0;

    ranges.forEach((range) => {
      const rangeStart = dateToKey(addDays(toUtcDate(range.start), -prepNights));
      const rangeEnd = dateToKey(addDays(toUtcDate(range.end), prepNights));
      const rangeDates = buildBlockedDateSet(rangeStart, rangeEnd);
      rangeDates.forEach((dateKey) => blockedDates.add(dateKey));
    });

    return blockedDates;
  }

  function buildBlockedDateSet(startKey, endKey) {
    if (!startKey || !endKey || endKey < startKey) {
      return new Set();
    }

    const blockedDates = new Set();
    let cursor = toUtcDate(startKey);
    const stop = toUtcDate(endKey);

    while (cursor <= stop) {
      blockedDates.add(dateToKey(cursor));
      cursor = addDays(cursor, 1);
    }

    return blockedDates;
  }

  function normalizePreparationTimeNights(value) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue > 0 ? Math.floor(numericValue) : 0;
  }

  function roundToNearestTen(amount) {
    return Math.round(amount / 10) * 10;
  }

  function scaleRule(rule, factor, extra = 0) {
    return {
      start: rule.start,
      end: rule.end,
      flat: typeof rule.flat === 'number' ? roundToNearestTen(rule.flat * factor + extra) : undefined,
      monThu: typeof rule.monThu === 'number' ? roundToNearestTen(rule.monThu * factor + extra) : undefined,
      friSat: typeof rule.friSat === 'number' ? roundToNearestTen(rule.friSat * factor + extra) : undefined,
      sun: typeof rule.sun === 'number' ? roundToNearestTen(rule.sun * factor + extra) : undefined
    };
  }

  function scaleRuleSet(rules, factor, extra = 0) {
    return rules.map((rule) => scaleRule(rule, factor, extra));
  }

  function getRuleCeiling(rule) {
    const values = [rule.flat, rule.monThu, rule.friSat, rule.sun].filter((value) => typeof value === 'number');
    return values.length ? Math.max(...values) : 0;
  }

  function makeFlatRule(start, end, flat) {
    return { start, end, flat };
  }

  function applyWorkbookFestiveCurve(rules, peak) {
    if (!peak) {
      return rules;
    }

    const festiveStart = '2026-12-01';
    const festiveEnd = '2027-01-15';
    const preLeadRule = rules.find((rule) => inRange('2026-11-30', rule.start, rule.end));
    const preRule = rules.find((rule) => inRange('2026-12-14', rule.start, rule.end));
    const postRule = rules.find((rule) => inRange('2027-01-16', rule.start, rule.end));
    const beforeRules = [];
    const afterRules = [];

    for (const rule of rules) {
      if (rule.end < festiveStart) {
        beforeRules.push(rule);
        continue;
      }

      if (rule.start > festiveEnd) {
        afterRules.push(rule);
        continue;
      }

      if (rule.start < festiveStart && rule.end >= festiveStart) {
        beforeRules.push({ ...rule, end: '2026-11-30' });
      }

      if (rule.start <= festiveEnd && rule.end > festiveEnd) {
        afterRules.push({ ...rule, start: '2027-01-16' });
      }
    }

    const preLeadLevel = preLeadRule ? getRuleCeiling(preLeadRule) : 0;
    const preLevel = preRule ? getRuleCeiling(preRule) : 0;
    const postLevel = postRule ? getRuleCeiling(postRule) : 0;
    const leadInLevel = roundToNearestTen(Math.max(preLeadLevel, peak * 0.55));
    const warmupLevel = roundToNearestTen(Math.max(preLevel, peak * 0.62, leadInLevel + 10));
    const prePeakLevel = roundToNearestTen(Math.max(preLevel, peak * 0.70, warmupLevel + 10));

    return [
      ...beforeRules,
      makeFlatRule('2026-12-01', '2026-12-07', leadInLevel),
      makeFlatRule('2026-12-08', '2026-12-14', warmupLevel),
      makeFlatRule('2026-12-15', '2026-12-22', prePeakLevel),
      makeFlatRule('2026-12-23', '2027-01-05', peak),
      makeFlatRule('2027-01-06', '2027-01-12', roundToNearestTen(peak * 0.88)),
      makeFlatRule('2027-01-13', '2027-01-15', roundToNearestTen(Math.max(postLevel, peak * 0.80))),
      ...afterRules
    ];
  }

  function getAirbnbNightlyPrice(dateKey) {
    return getRuleBasedPrice(dateKey, propertyConfig.airbnbPricingRules);
  }

  function getWebsiteNightlyPrice(dateKey) {
    return getWebsiteNightlyRateDetail(dateKey).rate;
  }

  function getWebsiteNightlyRateDetail(dateKey) {
    const directWebsiteNightly = getRuleBasedPriceDetail(dateKey, propertyConfig.websitePricingRules);
    if (directWebsiteNightly) {
      return {
        dateKey,
        rate: directWebsiteNightly.price,
        label: directWebsiteNightly.label || 'Nightly rate'
      };
    }

    const airbnbNightly = getRuleBasedPriceDetail(dateKey, propertyConfig.airbnbPricingRules);
    if (!airbnbNightly) {
      return {
        dateKey,
        rate: null,
        label: 'Pricing unavailable'
      };
    }

    return {
      dateKey,
      rate: Math.round(airbnbNightly.price * 1.1),
      label: airbnbNightly.label || 'Nightly rate'
    };
  }

  function getRuleBasedPrice(dateKey, rules) {
    const detail = getRuleBasedPriceDetail(dateKey, rules);
    return detail ? detail.price : null;
  }

  function getRuleBasedPriceDetail(dateKey, rules) {
    for (const rule of rules) {
      if (!inRange(dateKey, rule.start, rule.end)) continue;
      if (typeof rule.flat === 'number') {
        return {
          price: rule.flat,
          label: rule.label || ''
        };
      }

      const day = toUtcDate(dateKey).getUTCDay();
      if (day === 0 && typeof rule.sun === 'number') {
        return {
          price: rule.sun,
          label: rule.label || ''
        };
      }
      if ((day === 5 || day === 6) && typeof rule.friSat === 'number') {
        return {
          price: rule.friSat,
          label: rule.label || ''
        };
      }
      if (typeof rule.monThu === 'number') {
        return {
          price: rule.monThu,
          label: rule.label || ''
        };
      }
    }

    return null;
  }

  function buildDayLabel(dateKey, isPast, isBlocked, isAdvanceNoticeBlocked, isCheckoutOnly) {
    const formattedDate = formatLongDate(dateKey);
    if (isPast) return formattedDate + ', past date';
    if (isCheckoutOnly) return formattedDate + ', available for checkout only';
    if (isBlocked) return formattedDate + ', blocked';
    if (isAdvanceNoticeBlocked) return formattedDate + ', unavailable due to advance notice';
    return formattedDate + ', available';
  }

  function setStatus(message, tone) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.dataset.tone = tone || 'neutral';
    statusEl.hidden = !message;
  }

  function getVisibleMonthCount() {
    return window.innerWidth >= 900 ? 2 : 1;
  }

  function getMonthStartKey(dateKey) {
    return dateKey.slice(0, 7) + '-01';
  }

  function getTodayKey() {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: appTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(new Date());

    const year = parts.find((part) => part.type === 'year').value;
    const month = parts.find((part) => part.type === 'month').value;
    const day = parts.find((part) => part.type === 'day').value;
    return year + '-' + month + '-' + day;
  }

  function getCurrentTimeMinutes() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: appTimeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(new Date());

    const hour = Number(parts.find((part) => part.type === 'hour')?.value);
    const minute = Number(parts.find((part) => part.type === 'minute')?.value);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
    return hour * 60 + minute;
  }

  function toUtcDate(dateKey) {
    return new Date(dateKey + 'T00:00:00Z');
  }

  function addDays(date, days) {
    const nextDate = new Date(date.getTime());
    nextDate.setUTCDate(nextDate.getUTCDate() + days);
    return nextDate;
  }

  function addYears(date, years) {
    return new Date(Date.UTC(date.getUTCFullYear() + years, date.getUTCMonth(), date.getUTCDate()));
  }

  function addMonths(date, months) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  }

  function dateToKey(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function formatLongDate(dateKey) {
    return toUtcDate(dateKey).toLocaleDateString('en-ZA', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    });
  }

  function formatShortDate(dateKey) {
    return toUtcDate(dateKey).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC'
    });
  }

  function formatChargedNightSpan(startKey, endKey) {
    return startKey === endKey
      ? formatShortDate(startKey)
      : formatShortDate(startKey) + ' - ' + formatShortDate(endKey);
  }

  function formatTimeFromMinutes(totalMinutes) {
    const hours24 = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const suffix = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;
    return String(hours12) + ':' + String(minutes).padStart(2, '0') + ' ' + suffix;
  }

  function currency(amount) {
    return 'R' + amount.toLocaleString('en-ZA');
  }

  function formatDays(count) {
    if (!Number.isFinite(count) || count <= 0) return '';
    return count + ' day' + (count === 1 ? '' : 's');
  }

  function formatNights(count) {
    if (!Number.isFinite(count) || count <= 0) return '';
    return count + ' night' + (count === 1 ? '' : 's');
  }

  function inRange(dateKey, start, end) {
    return dateKey >= start && dateKey <= end;
  }

  function mergeSets(left, right) {
    return new Set([...left, ...right]);
  }

  function debounce(callback, wait) {
    let timeoutId = null;
    return (...args) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => callback(...args), wait);
    };
  }
})();
