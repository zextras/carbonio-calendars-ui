/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getUserSettings } from '@zextras/carbonio-shell-ui';
import { usePrefs } from '@zextras/carbonio-ui-commons';

import { getLocale, localeFromPrefs } from 'hooks/use-locale';

/** Name of the account pref that stores the user's time-format choice (CO-3677). */
export const TIME_FORMAT_PREF_NAME = 'carbonioPrefTimeFormat';

/** Explicit true/false for "24h"/"12h", undefined when the pref isn't set. */
const explicitIs24Hour = (value: unknown): boolean | undefined => {
	if (value === '24h') return true;
	if (value === '12h') return false;
	return undefined;
};

/** Whether the given locale's own convention uses a 24-hour clock. */
const localeIs24Hour = (locale: string): boolean =>
	new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hour12 === false;

/** Non-hook getter, for code that cannot use hooks (e.g. Redux action creators). */
export function getIs24HourFormat(): boolean {
	const explicit = explicitIs24Hour(getUserSettings().prefs[TIME_FORMAT_PREF_NAME]);
	return explicit ?? localeIs24Hour(getLocale());
}

/** Hook, for React components/hooks — reactive via usePrefs(). */
export function useIs24HourFormat(): boolean {
	const prefs = usePrefs();
	const explicit = explicitIs24Hour(prefs[TIME_FORMAT_PREF_NAME]);
	return explicit ?? localeIs24Hour(localeFromPrefs(prefs));
}

/** Generic "time only" date-fns token (event tiles, calendar time gutter). */
export function getTimeOnlyToken(is24h: boolean): string {
	return is24h ? 'HH:mm' : 'p';
}

/** Literal (locale-independent) "time only" token with an explicit AM/PM marker. */
export function getTimeOnlyLiteralToken(is24h: boolean): string {
	return is24h ? 'HH:mm' : 'hh:mm a';
}

/** Combined date+time token for start/end date pickers. */
export function getDateTimeToken(is24h: boolean): string {
	return is24h ? 'P HH:mm' : 'Pp';
}

/** react-big-calendar timeGutterFormat/selectRangeFormat token. */
export function getCalendarGridTimeToken(is24h: boolean): string {
	return is24h ? 'HH:mm' : 'p';
}

/** react-big-calendar eventTimeRangeStartFormat/EndFormat token. */
export function getCalendarEventEdgeToken(is24h: boolean): string {
	return is24h ? 'HH:mm' : 'h:mma';
}

/** DateTimePicker (design-system) `timeFormat` prop token. */
export function getPickerTimeFormatToken(is24h: boolean): string {
	return is24h ? 'HH:mm' : 'hh:mm a';
}

/** Intl.DateTimeFormat `hour12` option. */
export function getHour12Option(is24h: boolean): boolean {
	return !is24h;
}

/**
 * Tri-state Intl.DateTimeFormat `hour12` option, derived from a raw pref
 * value: explicit true/false when the pref is explicitly "12h"/"24h", or
 * undefined when the pref isn't set — letting Intl fall back to the locale's
 * own convention, preserving existing (locale-dependent) behavior until the
 * user makes an explicit choice.
 */
export function toHour12Option(value: unknown): boolean | undefined {
	if (value === '24h') return false;
	if (value === '12h') return true;
	return undefined;
}
