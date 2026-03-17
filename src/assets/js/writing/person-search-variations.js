/*
 * Interactive examples for person-search variations.
 * This script is intentionally post-scoped so it only powers the demos in
 * building-better-person-search.md.
 */
(function () {
  'use strict';

  const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  const normalizeSpace = (value = '') => value.trim().replace(/\s+/g, ' ');

  const toTitleCase = (value = '') => {
    return normalizeSpace(value)
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  };

  const getInitial = (value = '') => {
    const normalized = normalizeSpace(value);
    return normalized ? normalized.charAt(0).toUpperCase() : '';
  };

  const parseInteger = (value = '') => {
    const normalized = normalizeSpace(value);
    if (!/^\d+$/.test(normalized)) return null;
    return Number.parseInt(normalized, 10);
  };

  const padTwo = (value) => String(value).padStart(2, '0');

  const toOrdinal = (day) => {
    const remainderHundred = day % 100;
    if (remainderHundred >= 11 && remainderHundred <= 13) return `${day}th`;

    switch (day % 10) {
      case 1:
        return `${day}st`;
      case 2:
        return `${day}nd`;
      case 3:
        return `${day}rd`;
      default:
        return `${day}th`;
    }
  };

  const addUnique = (targetSet, value) => {
    if (value) {
      targetSet.add(value);
    }
  };

  const formatName = (parts) => parts.filter(Boolean).join(' ');

  const formatSurnameFirst = (surname, restOfName) => {
    if (!surname) return restOfName;
    if (!restOfName) return surname;
    return `${surname}, ${restOfName}`;
  };

  const isValidDate = (day, month, year) => {
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  };

  const isValidDayMonth = (day, month) => {
    const date = new Date(Date.UTC(2000, month - 1, day));
    return date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  };

  const generateNameVariations = ({ first = '', middle = '', last = '' }) => {
    const firstName = toTitleCase(first);
    const middleName = toTitleCase(middle);
    const surname = toTitleCase(last);

    const primaryGiven = firstName || middleName;
    const secondaryGiven = firstName && middleName ? middleName : '';

    const variations = new Set();

    if (!firstName && !middleName && !surname) {
      return [];
    }

    // If we only have one side of the name, return the safest fallback values.
    if (!surname) {
      addUnique(variations, primaryGiven);
      if (secondaryGiven) addUnique(variations, secondaryGiven);
      return Array.from(variations);
    }

    if (!primaryGiven) {
      addUnique(variations, surname);
      return Array.from(variations);
    }

    const addOrder = (primary, secondary = '') => {
      const primaryFull = formatName([primary, surname]);
      const secondaryFull = formatName([primary, secondary, surname]);
      const primaryInitial = getInitial(primary);
      const secondaryInitial = getInitial(secondary);

      addUnique(variations, primaryFull);
      addUnique(variations, formatSurnameFirst(surname, primary));

      if (secondary) {
        addUnique(variations, secondaryFull);
        addUnique(variations, formatSurnameFirst(surname, formatName([primary, secondary])));
      }

      if (primaryInitial) {
        addUnique(variations, formatName([primaryInitial, surname]));
        addUnique(variations, formatSurnameFirst(surname, primaryInitial));
      }

      if (primaryInitial && secondaryInitial) {
        addUnique(variations, formatName([primaryInitial, secondaryInitial, surname]));
        addUnique(variations, formatSurnameFirst(surname, `${primaryInitial} ${secondaryInitial}`));
      }
    };

    addOrder(primaryGiven, secondaryGiven);

    // When both first and middle names exist, also include swapped name order.
    if (firstName && middleName) {
      addOrder(middleName, firstName);
    }

    return Array.from(variations);
  };

  const generateDateVariations = ({ day = '', month = '', year = '' }) => {
    const parsedDay = parseInteger(day);
    const parsedMonth = parseInteger(month);
    const parsedYear = parseInteger(year);

    const hasDay = parsedDay !== null;
    const hasMonth = parsedMonth !== null;
    const hasYear = parsedYear !== null;

    const variations = new Set();

    if (!hasDay && !hasMonth && !hasYear) {
      return [];
    }

    if (hasMonth && (parsedMonth < 1 || parsedMonth > 12)) {
      return [];
    }

    if (hasDay && (parsedDay < 1 || parsedDay > 31)) {
      return [];
    }

    if (hasYear && parsedYear < 1) {
      return [];
    }

    const monthName = hasMonth ? MONTH_NAMES[parsedMonth - 1] : '';

    if (hasYear && !hasMonth && !hasDay) {
      addUnique(variations, `${parsedYear}`);
      addUnique(variations, `${parsedYear}s`);
      return Array.from(variations);
    }

    if (hasMonth && hasYear && !hasDay) {
      addUnique(variations, `${monthName} ${parsedYear}`);
      addUnique(variations, `${padTwo(parsedMonth)}/${parsedYear}`);
      addUnique(variations, `${parsedYear}-${padTwo(parsedMonth)}`);
      return Array.from(variations);
    }

    if (hasDay && hasMonth && !hasYear) {
      if (!isValidDayMonth(parsedDay, parsedMonth)) {
        return [];
      }

      addUnique(variations, `${padTwo(parsedDay)}/${padTwo(parsedMonth)}`);
      addUnique(variations, `${parsedDay} ${monthName}`);
      addUnique(variations, `${toOrdinal(parsedDay)} ${monthName}`);
      addUnique(variations, `${monthName} ${parsedDay}`);
      return Array.from(variations);
    }

    if (hasDay && hasMonth && hasYear) {
      if (!isValidDate(parsedDay, parsedMonth, parsedYear)) {
        return [];
      }

      addUnique(variations, `${parsedYear}-${padTwo(parsedMonth)}-${padTwo(parsedDay)}`);
      addUnique(variations, `${padTwo(parsedDay)}/${padTwo(parsedMonth)}/${parsedYear}`);
      addUnique(variations, `${padTwo(parsedMonth)}/${padTwo(parsedDay)}/${parsedYear}`);
      addUnique(variations, `${parsedDay} ${monthName} ${parsedYear}`);
      addUnique(variations, `${toOrdinal(parsedDay)} ${monthName} ${parsedYear}`);
      addUnique(variations, `${monthName} ${parsedDay}, ${parsedYear}`);
      return Array.from(variations);
    }

    // Graceful fallback for uncommon partial inputs (for example, month only).
    if (hasMonth) {
      addUnique(variations, monthName);
      addUnique(variations, padTwo(parsedMonth));
    }

    if (hasDay) {
      addUnique(variations, `${parsedDay}`);
    }

    if (hasYear) {
      addUnique(variations, `${parsedYear}`);
    }

    return Array.from(variations);
  };

  const renderVariations = (target, variations, emptyMessage) => {
    if (!target) return;

    const nextText = variations.length ? variations.join('\n') : emptyMessage;
    if (target.textContent !== nextText) {
      target.textContent = nextText;
    }
  };

  const bindNameVariationDemo = (container) => {
    const firstInput = container.querySelector('[data-name-first]');
    const middleInput = container.querySelector('[data-name-middle]');
    const lastInput = container.querySelector('[data-name-last]');
    const output = container.querySelector('[data-name-output]');

    if (!output) return;

    const update = () => {
      const variations = generateNameVariations({
        first: firstInput ? firstInput.value : '',
        middle: middleInput ? middleInput.value : '',
        last: lastInput ? lastInput.value : ''
      });

      renderVariations(
        output,
        variations,
        'Enter at least a first name or last name to generate variations.'
      );
    };

    [firstInput, middleInput, lastInput]
      .filter(Boolean)
      .forEach((input) => {
        input.addEventListener('input', update);
        input.addEventListener('change', update);
      });

    update();
  };

  const bindDateVariationDemo = (container) => {
    const dayInput = container.querySelector('[data-date-day]');
    const monthInput = container.querySelector('[data-date-month]');
    const yearInput = container.querySelector('[data-date-year]');
    const output = container.querySelector('[data-date-output]');

    if (!output || !dayInput || !monthInput || !yearInput) return;

    const update = () => {
      const variations = generateDateVariations({
        day: dayInput.value,
        month: monthInput.value,
        year: yearInput.value
      });

      renderVariations(
        output,
        variations,
        'Enter a valid date (or month/year) to generate search-ready date formats.'
      );
    };

    [dayInput, monthInput, yearInput].forEach((input) => {
      input.addEventListener('input', update);
      input.addEventListener('change', update);
    });

    update();
  };

  const initPersonSearchVariationDemos = () => {
    document
      .querySelectorAll('[data-name-variation-demo]')
      .forEach((container) => bindNameVariationDemo(container));

    document
      .querySelectorAll('[data-date-variation-demo]')
      .forEach((container) => bindDateVariationDemo(container));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPersonSearchVariationDemos);
  } else {
    initPersonSearchVariationDemos();
  }
})();
