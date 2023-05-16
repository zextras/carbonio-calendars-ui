/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RootState } from '../redux';

export function selectStart(state: RootState): number {
	return state?.calendars?.start;
}

export function selectEnd(state: RootState): number {
	return state?.calendars?.end;
}
