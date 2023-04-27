/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Calendar } from '../../types/store/calendars';
import { addCalendarsToStore, extractCalendars } from '../../utils/store/calendars';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function handleCalendarsRefreshReducer(state: any, { payload }: { payload: any }): void {
	const folders = [
		...Object.values(extractCalendars(payload?.folder?.[0]?.folder)),
		...Object.values(extractCalendars(payload?.folder?.[0]?.link))
	] as Calendar[];
	if (state.calendars) {
		addCalendarsToStore(state, folders);
	}
}
