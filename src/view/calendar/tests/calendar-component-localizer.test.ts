/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * These tests document the locale behaviour of react-big-calendar's dateFnsLocalizer.
 *
 * The localizer resolves a locale by looking up `locales[culture]`, where `culture`
 * comes from the `culture` prop on <Calendar />.  Without that prop the value is
 * `undefined`, so `locales[undefined]` is `undefined` and date-fns silently falls back
 * to English — regardless of what is stored in the `locales` map.
 *
 * The fix: pass `culture="en-US"` to <BigCalendar> so the lookup hits
 * `locales['en-US']`, which holds the user's actual locale object.
 */

import { getDay, parse, startOfWeek, format as dateFnsFormat } from 'date-fns';
import { it as itLocale } from 'date-fns/locale/it';
import { dateFnsLocalizer } from 'react-big-calendar';

const APRIL_1_2026 = new Date(2026, 3, 1);

describe('react-big-calendar dateFnsLocalizer locale lookup', () => {
	const localizer = dateFnsLocalizer({
		format: dateFnsFormat,
		parse,
		startOfWeek,
		getDay,
		locales: { 'en-US': itLocale }
	});

	it('applies the locale stored under the given culture key', () => {
		// culture='en-US' → locales['en-US'] = itLocale → Italian month name
		const result = localizer.format(APRIL_1_2026, 'MMMM', 'en-US');
		expect(result).toBe('aprile');
	});

	it('falls back to English when culture is undefined (the pre-fix bug)', () => {
		// culture=undefined → locales[undefined] = undefined → date-fns uses its default (en-US)
		const result = localizer.format(APRIL_1_2026, 'MMMM', undefined);
		expect(result).toBe('April');
	});
});
