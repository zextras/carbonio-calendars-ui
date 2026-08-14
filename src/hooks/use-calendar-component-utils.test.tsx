/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act, waitFor } from '@testing-library/react';
import { addBoard } from '@zextras/carbonio-shell-ui';
import { useHistoryNavigation } from '@zextras/carbonio-ui-commons';
import { endOfDay, startOfDay } from 'date-fns';

import { useCalendarComponentUtils } from './use-calendar-component-utils';
import { onSave } from '../commons/editor-save-send-fns';
import { CALENDAR_ROUTE, PREFS_DEFAULTS } from '../constants';
import { EVENT_ACTIONS } from '../constants/event-actions';
import { reducers } from '../store/redux';
import { useAppStatusStore } from '../store/zustand/store';
import type { Editor } from '../types/editor';
import mockedData from '../test/generators';
import { singleGetMsgResponse } from '../test/mocks/network/msw/handle-get-invite';
import { getSetupServer } from '@jest-setup';
import { setupHook, screen } from '@test-setup';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { populateFoldersStore } from '@test-utils/store/folders';

vi.mock('../commons/editor-save-send-fns', () => ({ onSave: vi.fn() }));

vi.mock('@zextras/carbonio-ui-commons', async () => ({
	...(await vi.importActual('@zextras/carbonio-ui-commons')),
	useHistoryNavigation: vi.fn()
}));

const { DEFAULT_CALENDAR_ID } = PREFS_DEFAULTS;

const RANGE_START = '2024-01-01';
const RANGE_END = '2024-01-07';
const ACTION_PATH = '/calendars/:action';
const SELECT_START = '2024-01-15T10:00:00';
const SELECT_END = '2024-01-15T11:00:00';
const ONE_HOUR_MS = 3_600_000;

const rootReducer = combineReducers(reducers);

const buildStore = (): ReturnType<typeof configureStore<ReturnType<typeof rootReducer>>> =>
	configureStore({ reducer: rootReducer });

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
		it('calls setRange with startOf(day)/endOf(day) when given a {start, end} object', () => {
			const setRange = vi.fn();
			useAppStatusStore.setState({ setRange });
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });
			const start = new Date(RANGE_START);
			const end = new Date(RANGE_END);

			act(() => {
				result.current.onRangeChange({ start, end });
			});

			expect(setRange).toHaveBeenCalledWith({
				start: startOfDay(start).getTime(),
				end: endOfDay(end).getTime()
			});
		});

		it('calls setRange with min startOf(day) and max endOf(day) when given an array of dates', () => {
			const setRange = vi.fn();
			useAppStatusStore.setState({ setRange });
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });
			const dates = [
				new Date('2024-01-03'),
				new Date(RANGE_START),
				new Date(RANGE_END),
				new Date('2024-01-05')
			];

			act(() => {
				result.current.onRangeChange(dates);
			});

			expect(setRange).toHaveBeenCalledWith({
				start: startOfDay(new Date(RANGE_START)).getTime(),
				end: endOfDay(new Date(RANGE_END)).getTime()
			});
		});

		it('does not call setRange when given an empty array', () => {
			const setRange = vi.fn();
			useAppStatusStore.setState({ setRange });
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => {
				result.current.onRangeChange([]);
			});

			expect(setRange).not.toHaveBeenCalled();
		});
	});

	describe('useEffect — action redirect', () => {
		it('replaces history when action param is not "expand"', () => {
			const replaceHistory = vi.fn();
			vi.mocked(useHistoryNavigation).mockReturnValue({ replaceHistory, pushHistory: vi.fn() });

			setupHook(useCalendarComponentUtils, {
				store: buildStore(),
				initialEntries: ['/calendars/edit'],
				path: ACTION_PATH
			});

			expect(replaceHistory).toHaveBeenCalledWith(`/${CALENDAR_ROUTE}`);
		});

		it('does not replace history when action is "expand"', () => {
			const replaceHistory = vi.fn();
			vi.mocked(useHistoryNavigation).mockReturnValue({ replaceHistory, pushHistory: vi.fn() });

			setupHook(useCalendarComponentUtils, {
				store: buildStore(),
				initialEntries: [`/calendars/${EVENT_ACTIONS.EXPAND}`],
				path: ACTION_PATH
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
					start: new Date(SELECT_START),
					end: new Date(SELECT_END)
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
					start: new Date(SELECT_START),
					end: new Date(SELECT_END)
				});
			});

			expect(addBoard).not.toHaveBeenCalled();
		});

		it('does not open a board when an action param is active', () => {
			const { result } = setupHook(useCalendarComponentUtils, {
				store: buildStore(),
				initialEntries: [`/calendars/${EVENT_ACTIONS.EXPAND}`],
				path: ACTION_PATH
			});

			act(() => {
				result.current.handleSelect({
					start: new Date(SELECT_START),
					end: new Date(SELECT_END)
				});
			});

			expect(addBoard).not.toHaveBeenCalled();
		});

		it('does not open a board when the resource does not belong to the default calendar', () => {
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => {
				result.current.handleSelect({
					start: new Date(SELECT_START),
					end: new Date(SELECT_END),
					resourceId: 'other-calendar'
				});
			});

			expect(addBoard).not.toHaveBeenCalled();
		});

		it('opens a board when the resourceId matches the default calendar', () => {
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => {
				result.current.handleSelect({
					start: new Date(SELECT_START),
					end: new Date(SELECT_END),
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

		it('triggers a move when the allDay status changes on a same-day event', async () => {
			const event = mockedData.getEvent({ allDay: false, resource: { isRecurrent: false } });
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => {
				result.current.onEventDropOrResize({
					start: event.start,
					end: event.end,
					event,
					isAllDay: true
				});
			});

			await waitFor(() => expect(onSave).toHaveBeenCalled());
			expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ draft: true, isNew: false }));
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
			result: { current: ReturnType<typeof useCalendarComponentUtils> },
			event: ReturnType<typeof mockedData.getEvent>
		): void => {
			result.current.onEventDropOrResize({
				start: new Date(event.start.valueOf() + ONE_HOUR_MS),
				end: new Date(event.end.valueOf() + ONE_HOUR_MS),
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

		it('does not show a snackbar when the save response is undefined', async () => {
			vi.mocked(onSave).mockResolvedValue({ response: undefined });
			const event = mockedData.getEvent({ resource: { isRecurrent: false } });
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => shiftEvent(result, event));

			await waitFor(() => expect(onSave).toHaveBeenCalled());
			expect(screen.queryByText('Edits saved correctly')).not.toBeInTheDocument();
			expect(screen.queryByText('Something went wrong, please try again')).not.toBeInTheDocument();
		});

		it('shows a warning snackbar when the save response is false', async () => {
			vi.mocked(onSave).mockResolvedValue({ response: false });
			const event = mockedData.getEvent({ resource: { isRecurrent: false } });
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => shiftEvent(result, event));

			expect(await screen.findByText('Something went wrong, please try again')).toBeInTheDocument();
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
			const { result, user } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => shiftEvent(result, event));

			await user.click(await screen.findByRole('button', { name: 'label.single_instance' }));

			await waitFor(() => expect(onSave).toHaveBeenCalled());
			expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ draft: true, isNew: false }));
		});

		it('dispatches onSave with draft=true after clicking "entire series" in the recurrent modal', async () => {
			const event = mockedData.getEvent({
				resource: { isRecurrent: true, isException: false }
			});
			const { result, user } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => shiftEvent(result, event));

			await user.click(await screen.findByRole('button', { name: 'label.entire_serires' }));

			await waitFor(() => expect(onSave).toHaveBeenCalled());
			expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ draft: true, isNew: false }));
		});

		it('keeps the event all-day when the drag callback does not provide isAllDay (Month view drag)', async () => {
			useAppStatusStore.setState({ calendarView: 'month' });
			const event = mockedData.getEvent({ allDay: true, resource: { isRecurrent: false } });
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => {
				result.current.onEventDropOrResize({
					start: new Date(event.start.valueOf() + 24 * ONE_HOUR_MS),
					end: new Date(event.end.valueOf() + 24 * ONE_HOUR_MS),
					event
				});
			});

			await waitFor(() => expect(onSave).toHaveBeenCalled());
			expect(onSave).toHaveBeenCalledWith(
				expect.objectContaining({ editor: expect.objectContaining({ allDay: true }) })
			);
		});

		it('converts an all-day event to non-all-day when dropped in the timed grid outside Month view', async () => {
			useAppStatusStore.setState({ calendarView: 'week' });
			const event = mockedData.getEvent({ allDay: true, resource: { isRecurrent: false } });
			const dropStart = new Date(event.start.valueOf() + 17.5 * ONE_HOUR_MS);
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => {
				result.current.onEventDropOrResize({
					start: dropStart,
					end: new Date(dropStart.valueOf() + 24 * ONE_HOUR_MS - 1000),
					event
				});
			});

			await waitFor(() => expect(onSave).toHaveBeenCalled());
			expect(onSave).toHaveBeenCalledWith(
				expect.objectContaining({
					editor: expect.objectContaining({
						allDay: false,
						start: dropStart.getTime(),
						end: endOfDay(dropStart).getTime()
					})
				})
			);
		});

		it('keeps a timed event non-all-day when the drag callback provides an explicit isAllDay: false', async () => {
			const event = mockedData.getEvent({ allDay: false, resource: { isRecurrent: false } });
			const { result } = setupHook(useCalendarComponentUtils, { store: buildStore() });

			act(() => {
				result.current.onEventDropOrResize({
					start: new Date(event.start.valueOf() + ONE_HOUR_MS),
					end: new Date(event.end.valueOf() + ONE_HOUR_MS),
					event,
					isAllDay: false
				});
			});

			await waitFor(() => expect(onSave).toHaveBeenCalled());
			expect(onSave).toHaveBeenCalledWith(
				expect.objectContaining({ editor: expect.objectContaining({ allDay: false }) })
			);
		});

		it('registers the pre-drop date/time as the original editor, so the invitation-changes banner can detect the move', async () => {
			const event = mockedData.getEvent({ allDay: false, resource: { isRecurrent: false } });
			const store = buildStore();
			const { result } = setupHook(useCalendarComponentUtils, { store });

			act(() => {
				result.current.onEventDropOrResize({
					start: new Date(event.start.valueOf() + ONE_HOUR_MS),
					end: new Date(event.end.valueOf() + ONE_HOUR_MS),
					event
				});
			});

			await waitFor(() => expect(onSave).toHaveBeenCalled());
			const { editor } = vi.mocked(onSave).mock.calls[0][0] as { editor: Editor };
			const originalEditor = store.getState().editor.originalEditors[editor.id];

			expect(originalEditor).toBeDefined();
			expect(originalEditor.start).not.toEqual(editor.start);
			expect(originalEditor.end).not.toEqual(editor.end);
		});
	});
});
