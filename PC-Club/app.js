(function () {
  'use strict';

  const STORAGE_KEY = 'pcclub-plan-v1';
  const durations = Object.freeze([1, 3, 5, 10]);
  const zones = Object.freeze({
    standard: Object.freeze({ name: 'Standard', prices: Object.freeze({ 1: 10, 3: 27, 5: 40, 10: 65 }) }),
    pro: Object.freeze({ name: 'Pro', prices: Object.freeze({ 1: 14, 3: 38, 5: 60, 10: 95 }) })
  });
  const money = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 });
  const formatMoney = (amount) => money.format(amount) + ' zł';
  const validZone = (value) => typeof value === 'string' && Object.prototype.hasOwnProperty.call(zones, value);
  const integer = (value) => {
    if (typeof value !== 'string' && typeof value !== 'number') return null;
    const text = String(value).trim();
    if (!/^\d+$/.test(text)) return null;
    const number = Number(text);
    return Number.isSafeInteger(number) ? number : null;
  };
  const validHours = (value) => durations.includes(integer(value));
  const validQuantity = (value) => integer(value) !== null && integer(value) >= 1 && integer(value) <= 6;
  const localDate = (date) => {
    const pad = (number) => String(number).padStart(2, '0');
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  };
  const isDate = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parts = value.split('-').map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return !Number.isNaN(date.getTime()) && localDate(date) === value;
  };
  const isTime = (value) => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  const calculate = (zone, hours, quantity) => {
    if (!validZone(zone) || !validHours(hours) || !validQuantity(quantity)) return null;
    const length = integer(hours);
    const count = integer(quantity);
    const perSeat = zones[zone].prices[length];
    const total = perSeat * count;
    return Object.freeze({
      perSeat: perSeat,
      total: total,
      savings: Math.max(0, (zones[zone].prices[1] * length - perSeat) * count)
    });
  };

  window.PCClub = Object.freeze({ zones: zones, durations: durations, calculate: calculate, formatMoney: formatMoney });

  function start() {
    document.querySelectorAll('[data-js-enabled]').forEach((element) => { element.disabled = false; });
    document.querySelectorAll('[data-year]').forEach((element) => { element.textContent = new Date().getFullYear(); });
    const byId = (id) => document.getElementById(id);
    const setText = (id, value) => {
      const element = byId(id);
      if (element) element.textContent = value;
    };

    const menuToggle = byId('menu-toggle');
    const mobileMenu = byId('mobile-menu');
    if (menuToggle && mobileMenu) {
      const setMenu = (open, returnFocus) => {
        mobileMenu.hidden = !open;
        menuToggle.setAttribute('aria-controls', 'mobile-menu');
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
        document.body.classList.toggle('menu-open', open);
        if (returnFocus) menuToggle.focus();
      };
      setMenu(false, false);
      menuToggle.addEventListener('click', () => setMenu(mobileMenu.hidden, false));
      mobileMenu.addEventListener('click', (event) => {
        if (event.target instanceof Element && event.target.closest('a')) setMenu(false, false);
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !mobileMenu.hidden) {
          event.preventDefault();
          setMenu(false, true);
        }
      });
      document.addEventListener('click', (event) => {
        if (!mobileMenu.hidden && !mobileMenu.contains(event.target) && !menuToggle.contains(event.target)) {
          setMenu(false, false);
        }
      });
    }

    const today = localDate(new Date());
    const initial = { zone: 'standard', hours: 3, qty: 1, date: today, time: '' };
    let saved = null;
    try {
      const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) saved = parsed;
    } catch (error) {
      // Private browsing and file URLs may make storage unavailable.
    }
    const applySettings = (source) => {
      if (!source) return;
      if (validZone(source.zone)) initial.zone = source.zone;
      if (validHours(source.hours)) initial.hours = integer(source.hours);
      if (validQuantity(source.qty)) initial.qty = integer(source.qty);
      if (isDate(source.date) && source.date >= today) initial.date = source.date;
      if (isTime(source.time)) initial.time = source.time;
    };
    applySettings(saved);
    const query = new URLSearchParams(window.location.search);
    applySettings({
      zone: query.get('zone'),
      hours: query.get('hours'),
      qty: query.get('qty'),
      date: query.get('date'),
      time: query.get('time')
    });

    const calculator = byId('price-calculator');
    if (calculator) {
      const state = { zone: initial.zone, hours: initial.hours, qty: initial.qty };
      const renderCalculator = () => {
        const price = calculate(state.zone, state.hours, state.qty);
        calculator.querySelectorAll('button[data-zone], button[data-hours], button[data-qty]').forEach((button) => {
          let active = false;
          if (button.hasAttribute('data-zone')) active = button.dataset.zone === state.zone;
          if (button.hasAttribute('data-hours')) active = integer(button.dataset.hours) === state.hours;
          if (button.hasAttribute('data-qty')) active = integer(button.dataset.qty) === state.qty;
          button.classList.toggle('active', active);
          button.setAttribute('aria-pressed', String(active));
        });
        setText('calc-total', formatMoney(price.total));
        setText('calc-per-seat', formatMoney(price.perSeat));
        setText('calc-duration', state.hours + ' godz.');
        setText('calc-quantity', state.qty + ' PC');
        setText('calc-savings', formatMoney(price.savings));
        document.querySelectorAll('[data-package-price]').forEach((element) => {
          const hours = integer(element.dataset.packagePrice);
          if (validHours(hours)) element.textContent = formatMoney(zones[state.zone].prices[hours]);
        });
        document.querySelectorAll('[data-package-total]').forEach((element) => {
          const hours = integer(element.dataset.packageTotal);
          if (validHours(hours)) element.textContent = formatMoney(zones[state.zone].prices[hours] * state.qty);
        });
        const bookingLink = byId('calculator-booking');
        if (bookingLink) {
          const parameters = new URLSearchParams({ zone: state.zone, hours: String(state.hours), qty: String(state.qty) });
          bookingLink.setAttribute('href', 'wypozyczalnia.html?' + parameters.toString());
        }
      };
      calculator.addEventListener('click', (event) => {
        if (!(event.target instanceof Element)) return;
        const button = event.target.closest('button[data-zone], button[data-hours], button[data-qty]');
        if (!button || !calculator.contains(button)) return;
        if (button.hasAttribute('data-zone') && validZone(button.dataset.zone)) state.zone = button.dataset.zone;
        if (button.hasAttribute('data-hours') && validHours(button.dataset.hours)) state.hours = integer(button.dataset.hours);
        if (button.hasAttribute('data-qty') && validQuantity(button.dataset.qty)) state.qty = integer(button.dataset.qty);
        renderCalculator();
      });
      renderCalculator();
    }

    function downloadText(filename, text) {
      const blob = new Blob(['\uFEFF', text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.hidden = true;
      document.body.appendChild(anchor);
      try {
        anchor.click();
      } finally {
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    }

    const bookingForm = byId('booking-form');
    if (bookingForm) {
      const zoneInput = byId('zone');
      const durationInput = byId('duration');
      const quantityInput = byId('quantity');
      const dateInput = byId('date');
      const timeInput = byId('time');
      const success = byId('booking-success');
      const acknowledge = byId('acknowledge');
      const nameInput = byId('name');
      const emailInput = byId('email');
      const phoneInput = byId('phone');
      const messageInput = byId('message');
      const fieldsPresent = zoneInput && durationInput && quantityInput && dateInput && timeInput;

      if (fieldsPresent) {
        zoneInput.value = initial.zone;
        durationInput.value = String(initial.hours);
        quantityInput.min = '1';
        quantityInput.max = '6';
        quantityInput.step = '1';
        quantityInput.value = String(initial.qty);
        dateInput.required = true;
        dateInput.min = today;
        dateInput.value = initial.date;
        if (Array.from(timeInput.options).some((option) => option.value === initial.time)) timeInput.value = initial.time;
        timeInput.required = true;
        if (nameInput) nameInput.required = true;
        if (emailInput) {
          emailInput.required = true;
          emailInput.type = 'email';
        }
        if (acknowledge) acknowledge.required = true;

        const getConfiguration = () => ({
          zone: zoneInput.value,
          hours: integer(durationInput.value),
          qty: integer(quantityInput.value),
          date: dateInput.value,
          time: timeInput.value
        });
        const formatDate = (value) => {
          if (!isDate(value)) return 'Wybierz datę';
          const parts = value.split('-').map(Number);
          return new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(parts[0], parts[1] - 1, parts[2]));
        };
        const validateConfiguration = () => {
          const state = getConfiguration();
          dateInput.min = localDate(new Date());
          zoneInput.setCustomValidity(validZone(state.zone) ? '' : 'Wybierz strefę Standard lub Pro.');
          durationInput.setCustomValidity(validHours(state.hours) ? '' : 'Wybierz pakiet 1, 3, 5 lub 10 godzin.');
          quantityInput.setCustomValidity(validQuantity(state.qty) ? '' : 'Wybierz od 1 do 6 stanowisk. Użyj liczby całkowitej.');
          dateInput.setCustomValidity(state.date && !isDate(state.date) ? 'Wybierz poprawną datę.' : '');
          timeInput.setCustomValidity(state.time && !isTime(state.time) ? 'Wybierz poprawną godzinę.' : '');
          if (isDate(state.date) && isTime(state.time)) {
            const parts = state.date.split('-').map(Number);
            const clock = state.time.split(':').map(Number);
            const beginning = new Date(parts[0], parts[1] - 1, parts[2], clock[0], clock[1]);
            if (beginning.getTime() < Date.now()) timeInput.setCustomValidity('Ten termin już minął. Wybierz późniejszą godzinę lub inną datę.');
          }
          return state;
        };
        const renderSummary = () => {
          if (success) success.hidden = true;
          const state = validateConfiguration();
          const price = calculate(state.zone, state.hours, state.qty);
          setText('summary-zone', validZone(state.zone) ? zones[state.zone].name : 'Wybierz strefę');
          setText('summary-duration', validHours(state.hours) ? state.hours + ' godz.' : '—');
          setText('summary-quantity', validQuantity(state.qty) ? String(state.qty) : '—');
          setText('summary-date', formatDate(state.date));
          setText('summary-time', isTime(state.time) ? state.time : 'Wybierz godzinę');
          setText('summary-total', price ? formatMoney(price.total) : '—');
          setText('summary-savings', price ? formatMoney(price.savings) : '—');
        };
        [zoneInput, durationInput, quantityInput, dateInput, timeInput].forEach((element) => {
          element.addEventListener('input', renderSummary);
          element.addEventListener('change', renderSummary);
        });
        const changeQuantity = (amount) => {
          const current = integer(quantityInput.value);
          quantityInput.value = String(Math.max(1, Math.min(6, (current === null ? 1 : current) + amount)));
          renderSummary();
        };
        const minus = byId('quantity-minus');
        const plus = byId('quantity-plus');
        if (minus) minus.addEventListener('click', (event) => { event.preventDefault(); changeQuantity(-1); });
        if (plus) plus.addEventListener('click', (event) => { event.preventDefault(); changeQuantity(1); });

        if (nameInput) nameInput.addEventListener('input', () => nameInput.setCustomValidity(''));
        bookingForm.addEventListener('input', () => { if (success) success.hidden = true; });

        bookingForm.addEventListener('submit', (event) => {
          event.preventDefault();
          const state = validateConfiguration();
          if (nameInput) nameInput.setCustomValidity(nameInput.value.trim() ? '' : 'Wpisz swoje imię.');
          if (!bookingForm.reportValidity()) return;
          let stored = false;
          try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            stored = true;
          } catch (error) {
            // The plan can still be downloaded when browser storage is blocked.
          }
          setText('success-text', stored
            ? 'To plan zapisany na tym urządzeniu, nie potwierdzona rezerwacja. Dane nie zostały wysłane do klubu.'
            : 'Twój plan jest przygotowany, ale przeglądarka nie pozwala zapisać go na tym urządzeniu. To nie jest potwierdzona rezerwacja. Dane nie zostały wysłane do klubu. Możesz pobrać plan jako plik.');
          if (success) {
            success.hidden = false;
            success.setAttribute('tabindex', '-1');
            success.focus();
          }
        });

        const downloadButton = byId('download-plan');
        if (downloadButton) downloadButton.addEventListener('click', (event) => {
          event.preventDefault();
          const state = validateConfiguration();
          if (!bookingForm.reportValidity()) return;
          const price = calculate(state.zone, state.hours, state.qty);
          const value = (field) => field ? field.value.trim() : '';
          const text = [
            'PC Club — plan wizyty',
            '',
            'To lokalny plan, nie potwierdzona rezerwacja.',
            'Dane nie zostały wysłane do klubu.',
            '',
            'Strefa: ' + zones[state.zone].name,
            'Pakiet: ' + state.hours + ' godz.',
            'Liczba stanowisk: ' + state.qty,
            'Data: ' + state.date,
            'Godzina: ' + state.time,
            'Cena pakietu na stanowisko: ' + formatMoney(price.perSeat),
            'Razem: ' + formatMoney(price.total),
            'Oszczędność względem stawki godzinowej: ' + formatMoney(price.savings),
            '',
            'Imię: ' + value(nameInput),
            'E-mail: ' + value(emailInput),
            'Telefon: ' + (value(phoneInput) || 'Nie podano'),
            'Wiadomość: ' + (value(messageInput) || 'Brak'),
            '',
            'Przykładowe ceny z wersji demonstracyjnej. Termin wymaga potwierdzenia przez klub.'
          ].join('\r\n');
          try {
            downloadText('pc-club-plan-' + state.date + '.txt', text);
          } catch (error) {
            setText('success-text', 'Nie udało się pobrać pliku. Plan pozostaje widoczny w formularzu. Dane nie zostały wysłane do klubu.');
            if (success) success.hidden = false;
          }
        });
        const editButton = byId('edit-plan');
        if (editButton) editButton.addEventListener('click', (event) => {
          event.preventDefault();
          if (success) success.hidden = true;
          zoneInput.focus();
        });
        renderSummary();
      }
    }

    const contactForm = byId('contact-form');
    if (contactForm) {
      const contactName = byId('contact-name');
      const contactEmail = byId('contact-email');
      const contactMessage = byId('contact-message');
      const status = byId('contact-status');
      if (status) {
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
      }
      if (contactName) contactName.required = true;
      if (contactEmail) {
        contactEmail.required = true;
        contactEmail.type = 'email';
      }
      if (contactMessage) contactMessage.required = true;
      [contactName, contactMessage].filter(Boolean).forEach((field) => field.addEventListener('input', () => field.setCustomValidity('')));
      contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!contactName || !contactEmail || !contactMessage) return;
        contactName.setCustomValidity(contactName.value.trim() ? '' : 'Wpisz swoje imię.');
        contactMessage.setCustomValidity(contactMessage.value.trim() ? '' : 'Napisz treść wiadomości.');
        if (!contactForm.reportValidity()) return;
        if (status) status.hidden = false;
        const text = [
          'PC Club — szkic wiadomości',
          '',
          'Dane nie zostały wysłane do klubu.',
          'To plik przygotowany lokalnie do samodzielnego wykorzystania.',
          '',
          'Imię: ' + contactName.value.trim(),
          'E-mail: ' + contactEmail.value.trim(),
          '',
          'Wiadomość:',
          contactMessage.value.trim()
        ].join('\r\n');
        try {
          downloadText('pc-club-szkic-wiadomosci.txt', text);
          if (status) status.textContent = 'Szkic wiadomości jest gotowy do pobrania. Dane nie zostały wysłane do klubu. Możesz samodzielnie przekazać plik wybranym kanałem kontaktu.';
        } catch (error) {
          if (status) status.textContent = 'Nie udało się pobrać szkicu. Skopiuj treść formularza. Dane nie zostały wysłane do klubu.';
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
