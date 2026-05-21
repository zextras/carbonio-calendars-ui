/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act, waitFor } from '@testing-library/react';
import { addBoard } from '@zextras/carbonio-shell-ui';
import { useHistoryNavigation } from '@zextras/carbonio-ui-commons';
import moment from 'moment';
import type { Mock } from 'vitest';

import { useCalendarComponentUtils } from './use-calendar-component-utils';
import { onSave } from '../commons/editor-save-send-fns';
import { CALENDAR_ROUTE, PREFS_DEFAULTS } from '../constants';
import { EVENT_ACTIONS } from '../constants/event-actions';
import { reducers } from '../store/redux';
import { useAppStatusStore } from '../store/zustand/store';
import mockedData from '../test/generators';
import { singleGetMsgResponse } from '../test/mocks/network/msw/handle-get-invite';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { populateFoldersStore } from '@test-utils/store/folders';
import { setupHook, screen } from '@test-setup';
import { getSetupServer } from '@jest-setup';

vi.mock('../commons/editor-save-send-fns', () => ({ onSave: vi.fn() }));

vi.mock('@zextras/carbonio-ui-commons', async () => ({
	...(await vi.importActual('@zextras/carbonio-ui-commons')),
	useHistoryNavigation: vi.fn()
}));

const { DEFAULT_CALENDAR_ID } = PREFS_DEFAULTS;

const buildStore = (): ReturnType<typeof configureStore> =>
	configureStore({ reducer: combineReducers(reducers) });

describe('useCalendarComponentUtils', () => {
	beforeEach(() => {
		vi.mocked(useHistoryNavigation).mockReturnValue({
			replaceHistory: vi.fn(),
			pushHistory: vi.fn()
		});
		vi.mocked(onSave).mockResolvedValue({ response: true });
		useAppStatusStore.setState({ summaryViewId: undefined, date: new Date('2024-01-15') });
		populateFoldersStore();
	});

	describe('onNavigate', () => {
		it('updates the store date and local state to the given date', () => {
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });
			const newDate = new Date('2024-03-01');

			act(() => {
				result.current.onNavigate(newDate);
			});

			expect(result.current.date).toEqual(newDate);
			expect(useAppStatusStore.getState().date).toEqual(newDate);
		});
	});

	describe('onRangeChange', () => {
		let mockSetRange: Mock;

		beforeEach(() => {
			mockSetRange = vi.fn();
			useAppStatusStore.setState({ setRange: mockSetRange });
		});

		it('calls setRange with startOf(day)/endOf(day) when given a {start, end} object', () => {
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });
			const start = new Date('2024-01-01');
			const end = new Date('2024-01-07');

			act(() => {
				result.current.onRangeChange({ start, end });
			});

			expect(mockSetRange).toHaveBeenCalledWith({
				start: moment(start).startOf('day').valueOf(),
				end: moment(end).endOf('day').valueOf()
			});
		});

		it('calls setRange with min startOf(day) and max endOf(day) when given an array of dates', () => {
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });
			const dates = [
				new Date('2024-01-03'),
				new Date('2024-01-01'),
				new Date('2024-01-07'),
				new Date('2024-01-05')
			];

			act(() => {
				result.current.onRangeChange(dates);
			});

			expect(mockSetRange).toHaveBeenCalledWith({
				start: moment(new Date('2024-01-01')).startOf('day').valueOf(),
				end: moment(new Date('2024-01-07')).endOf('day').valueOf()
			});
		});

		it('does not call setRange when given an empty array', () => {
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => {
				result.current.onRangeChange([]);
			});

			expect(mockSetRange).not.toHaveBeenCalled();
		});
	});

	describe('useEffect — action redirect', () => {
		it('replaces history when action param is not "expand"', () => {
			const replaceHistory = vi.fn();
			vi.mocked(useHistoryNavigation).mockReturnValue({ replaceHistory, pushHistory: vi.fn() });

			setupHook(useCalendarComponentUtils, {
				store: buildStore(),
				initialEntries: ['/calendars/edit'],
				path: '/calendars/:action'
			});

			expect(replaceHistory).toHaveBeenCalledWith(`/${CALENDAR_ROUTE}`);
		});

		it('does not replace history when action is "expand"', () => {
			const replaceHistory = vi.fn();
			vi.mocked(useHistoryNavigation).mockReturnValue({ replaceHistory, pushHistory: vi.fn() });

			setupHook(useCalendarComponentUtils, {
				store: buildStore(),
				initialEntries: [`/calendars/${EVENT_ACTIONS.EXPAND}`],
				path: '/calendars/:action'
			});

			expect(replaceHistory).not.toHaveBeenCalled();
		});

		it('does not replace history when there is no action param', () => {
			const replaceHistory = vi.fn();
			vi.mocked(useHistoryNavigation).mockReturnValue({ replaceHistory, pushHistory: vi.fn() });

			setupHook(useCalendarComponentUtils, {
				store: buildStore(),
				initialEntries: ['/calendars'],
				path: '/calendars'
			});

			expect(replaceHistory).not.toHaveBeenCalled();
		});
	});

	describe('handleSelect', () => {
		it('opens a board when summary view is closed and no action is active', () => {
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => {
				result.current.handleSelect({
					start: new Date('2024-01-15T10:00:00'),
					end: new Date('2024-01-15T11:00:00')
				});
			});

			expect(addBoard).toHaveBeenCalledWith(
				expect.objectContaining({ boardViewId: 'calendar-board' })
			);
		});

		it('does not open a board when the summary view is open', () => {
			useAppStatusStore.setState({ summaryViewId: 'some-view' });
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => {
				result.current.handleSelect({
					start: new Date('2024-01-15T10:00:00'),
					end: new Date('2024-01-15T11:00:00')
				});
			});

			expect(addBoard).not.toHaveBeenCalled();
		});

		it('does not open a board when an action param is active', () => {
			const { result } = setupHook(useCalendarComponentUtils, {
				store: buildStore(),
				initialEntries: [`/calendars/${EVENT_ACTIONS.EXPAND}`],
				path: '/calendars/:action'
			});

			act(() => {
				result.current.handleSelect({
					start: new Date('2024-01-15T10:00:00'),
					end: new Date('2024-01-15T11:00:00')
				});
			});

			expect(addBoard).not.toHaveBeenCalled();
		});

		it('does not open a board when the resource does not belong to the default calendar', () => {
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => {
				result.current.handleSelect({
					start: new Date('2024-01-15T10:00:00'),
					end: new Date('2024-01-15T11:00:00'),
					resourceId: 'other-calendar'
				});
			});

			expect(addBoard).not.toHaveBeenCalled();
		});

		it('opens a board when the resourceId matches the default calendar', () => {
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => {
				result.current.handleSelect({
					start: new Date('2024-01-15T10:00:00'),
					end: new Date('2024-01-15T11:00:00'),
					resourceId: DEFAULT_CALENDAR_ID
				});
			});

			expect(addBoard).toHaveBeenCalledWith(
				expect.objectContaining({ boardViewId: 'calendar-board' })
			);
		});
	});

	describe('onEventDropOrResize', () => {
		it('does nothing when the resource belongs to a non-default calendar', () => {
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });
			const event = mockedData.getEvent({ resource: { isRecurrent: false } });

			act(() => {
				result.current.onEventDropOrResize({
					start: new Date('2024-01-16T10:00:00'),
					end: new Date('2024-01-16T11:00:00'),
					event,
					resourceId: 'other-calendar'
				});
			});

			expect(onSave).not.toHaveBeenCalled();
		});

		it('shows a warning snackbar when dragging an all-day recurring non-exception event', async () => {
			const event = mockedData.getEvent({
				allDay: false,
				resource: { isRecurrent: true, isException: false }
			});
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => {
				result.current.onEventDropOrResize({
					start: new Date('2024-01-16'),
					end: new Date('2024-01-16'),
					event,
					isAllDay: true
				});
			});

			await screen.findByText('You cannot drag a recurrent appointment in a all day slot');
		});

		it('does nothing when the event position has not changed', () => {
			const event = mockedData.getEvent({ resource: { isRecurrent: false } });
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => {
				result.current.onEventDropOrResize({
					start: event.start,
					end: event.end,
					event,
					isAllDay: event.allDay
				});
			});

			expect(onSave).not.toHaveBeenCalled();
		});

		it('shows the recurrent appointment type modal when a recurring event is moved', async () => {
			const event = mockedData.getEvent({
				resource: { isRecurrent: true, isException: false }
			});
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => {
				result.current.onEventDropOrResize({
					start: new Date(event.start.valueOf() + 3600000),
					end: new Date(event.end.valueOf() + 3600000),
					event
				});
			});

			await screen.findByText('message.appointment_type_handle');
		});
	});

	describe('onDropOrResizeFn', () => {
		afterEach(() => {
			getSetupServer().resetHandlers();
		});

		const shiftEvent = (
			result: ReturnType<typeof setupHook<typeof useCalendarComponentUtils>>['result'],
			event: ReturnType<typeof mockedData.getEvent>
		): void => {
			result.current.onEventDropOrResize({
				start: new Date(event.start.valueOf() + 3600000),
				end: new Date(event.end.valueOf() + 3600000),
				event
			});
		};

		it('calls onSave when the invite has no participants', async () => {
			const event = mockedData.getEvent({ resource: { isRecurrent: false } });
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => shiftEvent(result, event));

			await waitFor(() => expect(onSave).toHaveBeenCalled());
			expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ draft: true, isNew: false }));
		});

		it('shows an info snackbar after a successful save', async () => {
			const event = mockedData.getEvent({ resource: { isRecurrent: false } });
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => shiftEvent(result, event));

			await screen.findByText('Edits saved correctly');
		});

		it('does not show a snackbar when the save response is falsy', async () => {
			vi.mocked(onSave).mockResolvedValue({ response: undefined });
			const event = mockedData.getEvent({ resource: { isRecurrent: false } });
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => shiftEvent(result, event));

			await waitFor(() => expect(onSave).toHaveBeenCalled());
			expect(screen.queryByText('Edits saved correctly')).not.toBeInTheDocument();
			expect(screen.queryByText('Something went wrong, please try again')).not.toBeInTheDocument();
		});

		it('opens the modify message modal when the invite has participants and the organizer makes changes', async () => {
			createSoapAPIInterceptor('GetMsg', singleGetMsgResponse);
			const event = mockedData.getEvent({
				resource: {
					isRecurrent: false,
					ridZ: '20240115T100000Z',
					inviteNeverSent: false
				}
			});
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => shiftEvent(result, event));

			await screen.findByText('label.edit');
		});

		it('calls onSave directly when the invite was never sent, skipping the modify modal', async () => {
			createSoapAPIInterceptor('GetMsg', singleGetMsgResponse);
			const event = mockedData.getEvent({
				resource: {
					isRecurrent: false,
					ridZ: '20240115T100000Z',
					inviteNeverSent: true
				}
			});
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => shiftEvent(result, event));

			await waitFor(() => expect(onSave).toHaveBeenCalled());
			expect(screen.queryByText('label.edit')).not.toBeInTheDocument();
		});

		it('dispatches onSave with draft=true after clicking "single instance" in the recurrent modal', async () => {
			const event = mockedData.getEvent({
				resource: { isRecurrent: true, isException: false }
			});
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => shiftEvent(result, event));

			const singleInstanceBtn = await screen.findByRole('button', {
				name: 'label.single_instance'
			});
			singleInstanceBtn.click();

			await waitFor(() => expect(onSave).toHaveBeenCalled());
			expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ draft: true, isNew: false }));
		});

		it('dispatches onSave with draft=true after clicking "entire series" in the recurrent modal', async () => {
			const event = mockedData.getEvent({
				resource: { isRecurrent: true, isException: false }
			});
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => shiftEvent(result, event));

			const entireSeriesBtn = await screen.findByRole('button', {
				name: 'label.entire_serires'
			});
			entireSeriesBtn.click();

			await waitFor(() => expect(onSave).toHaveBeenCalled());
			expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ draft: true, isNew: false }));
		});
	});
});
