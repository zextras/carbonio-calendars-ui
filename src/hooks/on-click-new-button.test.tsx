/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act } from '@testing-library/react';
import { addBoard } from '@zextras/carbonio-shell-ui';
import {
	addDays,
	endOfDay,
	isSameDay,
	startOfDay,
	startOfMonth,
	startOfWeek,
	subDays
} from 'date-fns';

import { useOnClickNewButton } from './on-click-new-button';
import { PREFS_DEFAULTS } from '../constants';
import { reducers } from '../store/redux';
import { useAppStatusStore } from '../store/zustand/store';
import type { Editor } from '../types/editor';
import * as shell from '@test-mocks/@zextras/carbonio-shell-ui';
import { setupHook } from '@test-setup';
import defaultSettings from '@test-utils/settings/default-settings';
import { populateFoldersStore } from '@test-utils/store/folders';

const rootReducer = combineReducers(reducers);

const buildStore = (): ReturnType<typeof configureStore<ReturnType<typeof rootReducer>>> =>
	configureStore({ reducer: rootReducer });

const getBoardEditor = (): Editor => {
	const [{ editor }] = vi.mocked(addBoard).mock.calls.at(-1) as unknown as [{ editor: Editor }];
	return editor;
};

const setVisibleRange = (start: Date, end: Date): void => {
	useAppStatusStore.setState({
		visibleRange: { start: startOfDay(start).getTime(), end: endOfDay(end).getTime() }
	});
};

describe('useOnClickNewButton', () => {
	beforeEach(() => {
		populateFoldersStore();
		useAppStatusStore.setState({ calendarView: undefined, date: new Date() });
	});

	it('uses today when the currently visible range includes it', () => {
		setVisibleRange(subDays(new Date(), 3), addDays(new Date(), 3));
		const { result } = setupHook(useOnClickNewButton, { store: buildStore() });

		act(() => {
			result.current();
		});

		expect(addBoard).toHaveBeenCalledWith(
			expect.objectContaining({ boardViewId: 'calendar-board' })
		);
		const editor = getBoardEditor();
		expect(isSameDay(new Date(editor.start ?? 0), new Date())).toBe(true);
	});

	it('uses the first day of the visible range when today is not in it', () => {
		const visibleDay = new Date('2020-05-04T00:00:00');
		setVisibleRange(visibleDay, visibleDay);
		const { result } = setupHook(useOnClickNewButton, { store: buildStore() });

		act(() => {
			result.current();
		});

		const editor = getBoardEditor();
		expect(isSameDay(new Date(editor.start ?? 0), visibleDay)).toBe(true);
		expect(isSameDay(new Date(editor.start ?? 0), new Date())).toBe(false);
	});

	it('sets an end date after the start date', () => {
		const visibleDay = new Date('2020-05-04T00:00:00');
		setVisibleRange(visibleDay, visibleDay);
		const { result } = setupHook(useOnClickNewButton, { store: buildStore() });

		act(() => {
			result.current();
		});

		const editor = getBoardEditor();
		expect(editor.end ?? 0).toBeGreaterThan(editor.start ?? 0);
	});

	it('does not override the target calendar, keeping the account default calendar', () => {
		const visibleDay = new Date('2020-05-04T00:00:00');
		setVisibleRange(visibleDay, visibleDay);
		const { result } = setupHook(useOnClickNewButton, { store: buildStore() });

		act(() => {
			result.current();
		});

		const editor = getBoardEditor();
		expect(editor.calendar?.id).toBe(PREFS_DEFAULTS.DEFAULT_CALENDAR_ID);
	});

	it('in month view, uses the 1st of the displayed month rather than the visible grid start', () => {
		// the grid for February 2024 pads with trailing January days; simulate that
		// wrongly being treated as the visible range to prove it's not used here
		const displayedMonth = new Date('2024-02-15T00:00:00');
		setVisibleRange(new Date('2024-01-28T00:00:00'), new Date('2024-03-02T00:00:00'));
		useAppStatusStore.setState({ calendarView: 'month', date: displayedMonth });
		const { result } = setupHook(useOnClickNewButton, { store: buildStore() });

		act(() => {
			result.current();
		});

		const editor = getBoardEditor();
		expect(isSameDay(new Date(editor.start ?? 0), startOfMonth(displayedMonth))).toBe(true);
	});

	it('in week view, uses the user-configured first day of the week rather than the tracked (Sunday-based) range', () => {
		shell.useUserSettings.mockReturnValue({
			...defaultSettings,
			prefs: {
				...defaultSettings.prefs,
				zimbraPrefCalendarFirstDayOfWeek: '5' // Friday
			}
		});
		const displayedDay = new Date('2024-01-17T00:00:00'); // Wednesday
		// react-big-calendar reports a Sunday-based range for week view regardless of
		// the pref (a library limitation) — simulate that wrong range here too
		setVisibleRange(new Date('2024-01-14T00:00:00'), new Date('2024-01-20T00:00:00'));
		useAppStatusStore.setState({ calendarView: 'week', date: displayedDay });
		const { result } = setupHook(useOnClickNewButton, { store: buildStore() });

		act(() => {
			result.current();
		});

		const editor = getBoardEditor();
		const expectedFriday = startOfWeek(displayedDay, { weekStartsOn: 5 });
		expect(isSameDay(new Date(editor.start ?? 0), expectedFriday)).toBe(true);
		expect(expectedFriday.getDay()).toBe(5);
	});
});
