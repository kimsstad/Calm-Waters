(() => {
  // Shared booking widget logic. Each property page passes its own
  // feeds, display name, and workbook source through data attributes.
  const bookingRoot = document.querySelector('[data-cw-booking], [data-boardwalk-booking]');
  if (!bookingRoot) return;

  const form = bookingRoot.closest('form');
  const dateTriggers = Array.from(bookingRoot.querySelectorAll('[data-date-trigger]'));
  const monthsEl = bookingRoot.querySelector('[data-booking-months]');
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

  const festiveHighFactor = 1.18;
  const arrowoodWebsitePricingRules = [
    { start: '2026-01-01', end: '2026-01-05', flat: 3850 },
    { start: '2026-01-06', end: '2026-01-15', flat: 2805 },
    { start: '2026-01-16', end: '2026-04-02', flat: 1760 },
    { start: '2026-04-03', end: '2026-04-06', flat: 1848 },
    { start: '2026-04-07', end: '2026-04-30', flat: 1760 },
    { start: '2026-05-01', end: '2026-09-30', flat: 1540 },
    { start: '2026-10-01', end: '2026-11-26', flat: 1760 },
    { start: '2026-11-27', end: '2026-12-04', flat: 4235 },
    { start: '2026-12-05', end: '2026-12-14', flat: 2805 },
    { start: '2026-12-15', end: '2026-12-31', flat: 3850 },
    { start: '2027-01-01', end: '2027-01-05', flat: 3850 },
    { start: '2027-01-06', end: '2027-01-15', flat: 2805 },
    { start: '2027-01-16', end: '2027-03-25', flat: 1936 },
    { start: '2027-03-26', end: '2027-03-29', flat: 2033 },
    { start: '2027-03-30', end: '2027-04-30', flat: 1936 },
    { start: '2027-05-01', end: '2027-09-30', flat: 1694 },
    { start: '2027-10-01', end: '2027-11-26', flat: 1936 },
    { start: '2027-11-27', end: '2027-12-04', flat: 4659 },
    { start: '2027-12-05', end: '2027-12-14', flat: 3086 },
    { start: '2027-12-15', end: '2027-12-31', flat: 4235 }
  ];

  const workbookPropertySources = {
    arrowood: {
      displayName: 'Arrowood Apartment',
      festivePeak: 3500,
      websitePricingRules: arrowoodWebsitePricingRules,
      feeds: {
        airbnb: {
          publicUrl: '',
          proxyUrl: ''
        },
        booking: {
          publicUrl: '',
          proxyUrl: ''
        },
        lekkeslaap: {
          publicUrl: '',
          proxyUrl: ''
        }
      },
      blockedDatesEndpoint: '/api/arrowood-blocks',
      baseAirbnbRules: []
    },
    'boardwalk-corner': {
      displayName: 'Boardwalk Retreat',
      festivePeak: 8500,
      websitePricingRules: [],
      feeds: {
        airbnb: {
          publicUrl: '',
          proxyUrl: ''
        },
        booking: {
          publicUrl: '',
          proxyUrl: ''
        },
        lekkeslaap: {
          publicUrl: '',
          proxyUrl: ''
        }
      },
      blockedDatesEndpoint: '/api/boardwalk-corner-blocks',
      baseAirbnbRules: scaleRuleSet(centralThreeBedAirbnbRules, 1.08)
    }
  };

  const sourceKey = bookingRoot.dataset.bookingSource || '';
  const workbookSource = workbookPropertySources[sourceKey] || {
    displayName: bookingRoot.dataset.bookingName || 'Property',
    festivePeak: null,
    websitePricingRules: [],
    feeds: {
      airbnb: { publicUrl: '', proxyUrl: '' },
      booking: { publicUrl: '', proxyUrl: '' },
      lekkeslaap: { publicUrl: '', proxyUrl: '' }
    },
    blockedDatesEndpoint: '',
    baseAirbnbRules: []
  };
  const propertyConfig = {
    sourceKey,
    propertyName: bookingRoot.dataset.bookingName || workbookSource.displayName,
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
    airbnbPricingRules: applyWorkbookFestiveCurve(workbookSource.baseAirbnbRules, workbookSource.festivePeak)
  };

  const maxDateKey = '2027-12-31';
  const state = {
    todayKey: getTodayKey(),
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
    const maxViewKey = getMonthStartKey(maxDateKey);
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
      if (state.checkIn && !state.checkOut) {
        event.preventDefault();
        openCalendar('checkout');
        setStatus('Please select a checkout date before sending your enquiry.', 'warning');
      }
    });
  }

  window.addEventListener('resize', debounce(renderCalendar, 120));

  loadAvailability();
  updateSummary();
  renderCalendar();

  async function loadAvailability() {
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
          blockedDates: parseIcalBlockedDates(calendarText)
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
    const maxViewKey = getMonthStartKey(maxDateKey);
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
    const isDisabledRangeStep = state.activeField === 'checkout' && state.checkIn && dateKey > state.checkIn && !isSelectableCheckout(dateKey);
    const isBeyondMax = dateKey > maxDateKey;

    if (isPast) button.classList.add('is-past');
    if (isBlocked) button.classList.add('is-blocked');
    if (isBeyondMax) button.classList.add('is-disabled');
    if (isStart) button.classList.add('is-start');
    if (isEnd) button.classList.add('is-end');
    if (isInRange) button.classList.add('is-in-range');
    if (isDisabledRangeStep) button.classList.add('is-range-disabled');

    const isDisabled = isPast || isBlocked || isBeyondMax;
    if (isDisabled) {
      button.disabled = true;
    } else {
      button.addEventListener('pointerup', (event) => {
        event.stopPropagation();
        event.preventDefault();
        handleDateClick(dateKey);
      });
    }

    button.setAttribute('aria-label', buildDayLabel(dateKey, isPast, isBlocked));
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
    return isRangeAllowed(state.checkIn, dateKey);
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

  function getStayDetails() {
    const stayDates = getStayDates(state.checkIn, state.checkOut);
    const nightlyRates = stayDates
      .map((dateKey) => getWebsiteNightlyPrice(dateKey))
      .filter((value) => value !== null);

    const hasVerifiedPricing = propertyConfig.websitePricingRules.length > 0 || propertyConfig.airbnbPricingRules.length > 0;
    const hasCompletePricing = hasVerifiedPricing && nightlyRates.length === stayDates.length && stayDates.length > 0;

    return {
      nights: stayDates.length,
      total: hasCompletePricing ? nightlyRates.reduce((sum, value) => sum + value, 0) : null,
      nightlyLabel: buildNightlyRateLabel(nightlyRates, hasVerifiedPricing, stayDates.length)
    };
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
    totalInput.value = stay.total !== null ? String(stay.total) : '';
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
    const directWebsiteNightly = getRuleBasedPrice(dateKey, propertyConfig.websitePricingRules);
    if (directWebsiteNightly !== null) {
      return directWebsiteNightly;
    }

    const airbnbNightly = getAirbnbNightlyPrice(dateKey);
    return airbnbNightly === null ? null : Math.round(airbnbNightly * 1.1);
  }

  function getRuleBasedPrice(dateKey, rules) {
    for (const rule of rules) {
      if (!inRange(dateKey, rule.start, rule.end)) continue;
      if (typeof rule.flat === 'number') return rule.flat;

      const day = toUtcDate(dateKey).getUTCDay();
      if (day === 0 && typeof rule.sun === 'number') return rule.sun;
      if ((day === 5 || day === 6) && typeof rule.friSat === 'number') return rule.friSat;
      if (typeof rule.monThu === 'number') return rule.monThu;
    }

    return null;
  }

  function buildDayLabel(dateKey, isPast, isBlocked) {
    const formattedDate = formatLongDate(dateKey);
    if (isPast) return formattedDate + ', past date';
    if (isBlocked) return formattedDate + ', blocked';
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

  function toUtcDate(dateKey) {
    return new Date(dateKey + 'T00:00:00Z');
  }

  function addDays(date, days) {
    const nextDate = new Date(date.getTime());
    nextDate.setUTCDate(nextDate.getUTCDate() + days);
    return nextDate;
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

  function currency(amount) {
    return 'R' + amount.toLocaleString('en-ZA');
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
