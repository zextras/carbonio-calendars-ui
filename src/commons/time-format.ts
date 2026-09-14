/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getUserSettings } from '@zextras/carbonio-shell-ui';
import { usePrefs } from '@zextras/carbonio-ui-commons';

/**
 * Name of the Zimbra account pref that stores the user's time-format choice
 * (CO-3677). Not yet a real server-side attribute: no matching type in
 * @zextras/carbonio-ui-soap-lib, no entry in the official Zimbra attribute
 * docs. Value is read defensively as a Zimbra-style boolean string
 * ("TRUE"/"FALSE") pending the backend attribute being added. Rename here
 * and in src/carbonio-ui-soap-lib.ts once the real attribute name is confirmed.
 */
export const TIME_FORMAT_24_HOUR_PREF_NAME = 'zimbraPrefCalendarTimeFormat24Hour';

const isTrue = (value: unknown): boolean => value === 'TRUE';

/** Non-hook getter, for code that cannot use hooks (e.g. Redux action creators). */
export function getIs24HourFormat(): boolean {
	return isTrue(getUserSettings().prefs[TIME_FORMAT_24_HOUR_PREF_NAME]);
}

/** Hook, for React components/hooks — reactive via usePrefs(). */
export function useIs24HourFormat(): boolean {
	const prefs = usePrefs();
	return isTrue(prefs[TIME_FORMAT_24_HOUR_PREF_NAME]);
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
 * value: explicit true/false when the pref is explicitly "FALSE"/"TRUE", or
 * undefined when the pref isn't set — letting Intl fall back to the locale's
 * own convention, preserving existing (locale-dependent) behavior until the
 * user makes an explicit choice.
 */
export function toHour12Option(value: unknown): boolean | undefined {
	if (value === 'TRUE') return false;
	if (value === 'FALSE') return true;
	return undefined;
}
