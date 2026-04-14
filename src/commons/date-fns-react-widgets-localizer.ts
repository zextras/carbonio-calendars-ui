/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getUserSettings } from '@zextras/carbonio-shell-ui';
import type { Locale } from 'date-fns';
import { addYears, format, isValid, parse } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import configure from 'react-widgets/lib/configure';

// Mirrors DATE_FNS_LOCALE from carbonio-shell-ui src/constants/locales.ts,
// which is not exported from the installed package.
const LOCALE_IMPORT_MAP: Record<string, (() => Promise<Locale>) | undefined> = {
	zh_CN: () => import('date-fns/locale/zh-CN').then(({ zhCN }) => zhCN),
	nl: () => import('date-fns/locale/nl').then(({ nl }) => nl),
	en: () => import('date-fns/locale/en-US').then(({ enUS: locale }) => locale),
	de: () => import('date-fns/locale/de').then(({ de }) => de),
	hi: () => import('date-fns/locale/hi').then(({ hi }) => hi),
	hu: () => import('date-fns/locale/hu').then(({ hu }) => hu),
	it: () => import('date-fns/locale/it').then(({ it }) => it),
	ja: () => import('date-fns/locale/ja').then(({ ja }) => ja),
	pt: () => import('date-fns/locale/pt').then(({ pt }) => pt),
	pl: () => import('date-fns/locale/pl').then(({ pl }) => pl),
	ro: () => import('date-fns/locale/ro').then(({ ro }) => ro),
	ru: () => import('date-fns/locale/ru').then(({ ru }) => ru),
	es: () => import('date-fns/locale/es').then(({ es }) => es),
	th: () => import('date-fns/locale/th').then(({ th }) => th),
	tr: () => import('date-fns/locale/tr').then(({ tr }) => tr),
	fr: () => import('date-fns/locale/fr').then(({ fr }) => fr),
	vi: () => import('date-fns/locale/vi').then(({ vi }) => vi),
	bs: () => import('date-fns/locale/bs').then(({ bs }) => bs),
	sl: () => import('date-fns/locale/sl').then(({ sl }) => sl)
};

let cachedLocale: Locale = enUS;
let initialized = false;

export function getDateFnsLocale(): Locale {
	return cachedLocale;
}

function endOfDecade(date: Date): Date {
	return new Date(addYears(date, 10).getTime() - 1);
}

function endOfCentury(date: Date): Date {
	return new Date(addYears(date, 100).getTime() - 1);
}

export function dateFnsLocalizer(): void {
	if (initialized) return;
	initialized = true;

	const rawLocale = getUserSettings().prefs.zimbraPrefLocale ?? navigator.language;
	// Normalise BCP 47 tags (e.g. 'it-IT' → 'it', 'zh-CN' → 'zh_CN') to match map keys.
	// Zimbra uses underscore separators (zh_CN); navigator.language uses hyphens (zh-CN).
	const normalized = rawLocale.replace('-', '_');
	const importer = LOCALE_IMPORT_MAP[normalized] ?? LOCALE_IMPORT_MAP[normalized.split('_')[0]];
	if (importer) {
		importer().then((locale) => {
			cachedLocale = locale;
		});
	}

	configure.setDateLocalizer({
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
		firstOfWeek: (): number => Number(getUserSettings().prefs.zimbraPrefCalendarFirstDayOfWeek ?? 0),
		parse: (value: string, formatStr: string): Date | null => {
			if (!value) return null;
			const parsed = parse(value, formatStr, new Date(), { locale: cachedLocale });
			return isValid(parsed) ? parsed : null;
		},
		format: (value: Date, formatStr: string): string =>
			format(value, formatStr, { locale: cachedLocale })
	});
}
