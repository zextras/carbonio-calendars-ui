/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { enUS } from 'date-fns/locale/en-US';
import { it as itLocale } from 'date-fns/locale/it';

import { WorkView } from '../work-view';
import { getDateFnsLocale } from 'commons/date-fns-react-widgets-localizer';

vi.mock('commons/date-fns-react-widgets-localizer', () => ({
	getDateFnsLocale: vi.fn()
}));

describe('WorkView.title locale', () => {
	it('formats month names using the current locale', () => {
		vi.mocked(getDateFnsLocale).mockReturnValue(itLocale);
		// April 15 2026 — full week stays in April
		const title = WorkView.title(new Date(2026, 3, 15));
		expect(title).toContain('aprile');
		expect(title).not.toContain('April');
	});

	it('formats in English when locale is enUS', () => {
		vi.mocked(getDateFnsLocale).mockReturnValue(enUS);
		const title = WorkView.title(new Date(2026, 3, 15));
		expect(title).toContain('April');
	});

	it('localises both month names when the week spans a month boundary', () => {
		vi.mocked(getDateFnsLocale).mockReturnValue(itLocale);
		// April 30 2026 is a Thursday; week Sun Apr 26 – Sat May 2
		const title = WorkView.title(new Date(2026, 3, 30));
		expect(title).toContain('aprile');
		expect(title).toContain('maggio');
	});
});
