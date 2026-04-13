/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { addYears, format, isValid, parse } from 'date-fns';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const configureModule = require('react-widgets/lib/configure');
// Handle both CJS (direct export) and ESM-interop (.default) module shapes
const configure = configureModule?.default ?? configureModule;

function endOfDecade(date: Date): Date {
	return new Date(addYears(date, 10).getTime() - 1);
}

function endOfCentury(date: Date): Date {
	return new Date(addYears(date, 100).getTime() - 1);
}

export function dateFnsLocalizer(): void {
	const localizer = {
		formats: {
			date: 'P',
			time: 'p',
			default: 'PPp',
			header: 'MMMM yyyy',
			footer: 'PP',
			weekday: 'EEE',
			dayOfMonth: 'dd',
			month: 'MMM',
			year: 'yyyy',
			decade: (date: Date, _culture: string, l: { format: (d: Date, f: string) => string }) =>
				`${l.format(date, 'yyyy')} - ${l.format(endOfDecade(date), 'yyyy')}`,
			century: (date: Date, _culture: string, l: { format: (d: Date, f: string) => string }) =>
				`${l.format(date, 'yyyy')} - ${l.format(endOfCentury(date), 'yyyy')}`
		},
		firstOfWeek: (): number => 0,
		parse: (value: string, formatStr: string): Date | null => {
			if (!value) return null;
			// For locale-aware formats (P, p, etc.) fall back to native Date parsing
			if (formatStr === 'P' || formatStr === 'PP' || formatStr === 'PPp') {
				const d = new Date(value);
				return isValid(d) ? d : null;
			}
			const parsed = parse(value, formatStr, new Date());
			return isValid(parsed) ? parsed : null;
		},
		format: (value: Date, formatStr: string): string => format(value, formatStr)
	};

	configure.setDateLocalizer(localizer);
}
