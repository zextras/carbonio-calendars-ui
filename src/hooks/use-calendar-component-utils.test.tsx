/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { act, waitFor } from '@testing-library/react';
import { useModal, useSnackbar } from '@zextras/carbonio-design-system';
import { addBoard } from '@zextras/carbonio-shell-ui';
import { useHistoryNavigation } from '@zextras/carbonio-ui-commons';
import moment from 'moment';
import type { Mock } from 'vitest';

import { useCalendarComponentUtils } from './use-calendar-component-utils';
import { generateEditor } from '../commons/editor-generator';
import { onSave } from '../commons/editor-save-send-fns';
import { CALENDAR_ROUTE, PREFS_DEFAULTS } from '../constants';
import { EVENT_ACTIONS } from '../constants/event-actions';
import { normalizeInvite } from '../normalizations/normalize-invite';
import { getInvite } from '../store/actions/get-invite';
import { useAppDispatch } from '../store/redux/hooks';
import { useAppStatusStore } from '../store/zustand/store';
import mockedData from '../test/generators';
import { setupHook } from '@test-setup';

vi.mock('../store/redux/hooks', async () => ({
	...(await vi.importActual('../store/redux/hooks')),
	useAppDispatch: vi.fn()
}));

vi.mock('../store/actions/get-invite');

vi.mock('../normalizations/normalize-invite');

vi.mock('../commons/editor-generator', () => ({
	generateEditor: vi.fn()
}));

vi.mock('../commons/editor-save-send-fns', () => ({
	onSave: vi.fn()
}));

vi.mock('@zextras/carbonio-design-system', async () => ({
	...(await vi.importActual('@zextras/carbonio-design-system')),
	useModal: vi.fn(),
	useSnackbar: vi.fn()
}));

vi.mock('@zextras/carbonio-ui-commons', async () => ({
	...(await vi.importActual('@zextras/carbonio-ui-commons')),
	useHistoryNavigation: vi.fn()
}));

const { DEFAULT_CALENDAR_ID } = PREFS_DEFAULTS;

const makeSoapPayload = (startMs: number, endMs: number): { m: unknown[] } => ({
	m: [
		{
			inv: [
				{
					comp: [
						{
							s: [{ u: startMs }],
							e: [{ u: endMs }]
						}
					]
				}
			]
		}
	]
});

describe('useCalendarComponentUtils', () => {
	let mockDispatch: Mock;
	let mockCreateModal: Mock;
	let mockCloseModal: Mock;
	let mockCreateSnackbar: Mock;
	let mockReplaceHistory: Mock;

	beforeEach(() => {
		mockDispatch = vi.fn();
		mockCreateModal = vi.fn();
		mockCloseModal = vi.fn();
		mockCreateSnackbar = vi.fn();
		mockReplaceHistory = vi.fn();

		vi.mocked(useAppDispatch).mockReturnValue(mockDispatch);
		vi.mocked(useModal).mockReturnValue({
			createModal: mockCreateModal,
			closeModal: mockCloseModal
		});
		vi.mocked(useSnackbar).mockReturnValue(mockCreateSnackbar);
		vi.mocked(useHistoryNavigation).mockReturnValue({
			replaceHistory: mockReplaceHistory,
			pushHistory: vi.fn()
		});
		vi.mocked(generateEditor).mockReturnValue({ id: 'editor-1', title: 'Test' } as any);
		vi.mocked(onSave).mockResolvedValue({ response: true });
		vi.mocked(getInvite).mockReturnValue(vi.fn() as any);

		useAppStatusStore.setState({
			summaryViewId: undefined,
			date: new Date('2024-01-15')
		});
	});

	describe('onNavigate', () => {
		it('updates the store date', () => {
			const { result } = setupHook(useCalendarComponentUtils);
			const newDate = new Date('2024-03-01');

			act(() => {
				result.current.onNavigate(newDate);
			});

			expect(useAppStatusStore.getState().date).toEqual(newDate);
		});

		it('returns the new date as local state', () => {
			const { result } = setupHook(useCalendarComponentUtils);
			const newDate = new Date('2024-03-01');

			act(() => {
				result.current.onNavigate(newDate);
			});

			expect(result.current.date).toEqual(newDate);
		});
	});

	describe('onRangeChange', () => {
		let mockSetRange: Mock;

		beforeEach(() => {
			mockSetRange = vi.fn();
			useAppStatusStore.setState({ setRange: mockSetRange });
		});

		it('calls setRange with start/end day boundaries when given an object', () => {
			const { result } = setupHook(useCalendarComponentUtils);
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
			const { result } = setupHook(useCalendarComponentUtils);
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

		it('does not call setRange when receiving an empty array', () => {
			const { result } = setupHook(useCalendarComponentUtils);

			act(() => {
				result.current.onRangeChange([]);
			});

			expect(mockSetRange).not.toHaveBeenCalled();
		});
	});

	describe('useEffect — action redirect', () => {
		it('replaces history when action is "edit"', () => {
			setupHook(useCalendarComponentUtils, {
				initialEntries: [`/calendars/edit`],
				path: '/calendars/:action'
			});

			expect(mockReplaceHistory).toHaveBeenCalledWith(`/${CALENDAR_ROUTE}`);
		});

		it('does not replace history when action is "expand"', () => {
			setupHook(useCalendarComponentUtils, {
				initialEntries: [`/calendars/${EVENT_ACTIONS.EXPAND}`],
				path: '/calendars/:action'
			});

			expect(mockReplaceHistory).not.toHaveBeenCalled();
		});

		it('does not replace history when there is no action', () => {
			setupHook(useCalendarComponentUtils, {
				initialEntries: ['/calendars'],
				path: '/calendars'
			});

			expect(mockReplaceHistory).not.toHaveBeenCalled();
		});
	});

	describe('handleSelect', () => {
		it('opens a board when summary view is closed and there is no active action', () => {
			const { result } = setupHook(useCalendarComponentUtils);
			const start = new Date('2024-01-15T10:00:00');
			const end = new Date('2024-01-15T11:00:00');

			act(() => {
				result.current.handleSelect({ start, end });
			});

			expect(addBoard).toHaveBeenCalledWith(
				expect.objectContaining({ boardViewId: 'calendar-board' })
			);
		});

		it('does not open a board when summary view is open', () => {
			useAppStatusStore.setState({ summaryViewId: 'some-view' });
			const { result } = setupHook(useCalendarComponentUtils);

			act(() => {
				result.current.handleSelect({
					start: new Date('2024-01-15T10:00:00'),
					end: new Date('2024-01-15T11:00:00')
				});
			});

			expect(addBoard).not.toHaveBeenCalled();
		});

		it('does not open a board when an action is active', () => {
			const { result } = setupHook(useCalendarComponentUtils, {
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

		it('does not open a board when the resource is not the default calendar', () => {
			const { result } = setupHook(useCalendarComponentUtils);

			act(() => {
				result.current.handleSelect({
					start: new Date('2024-01-15T10:00:00'),
					end: new Date('2024-01-15T11:00:00'),
					resourceId: 'some-other-calendar'
				});
			});

			expect(addBoard).not.toHaveBeenCalled();
		});

		it('opens a board when resourceId matches the default calendar', () => {
			const { result } = setupHook(useCalendarComponentUtils);

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
		it('returns early when the resourceId does not match the default calendar', () => {
			const { result } = setupHook(useCalendarComponentUtils);
			const event = mockedData.getEvent({ resource: { isRecurrent: false } });

			act(() => {
				result.current.onEventDropOrResize({
					start: new Date('2024-01-15T11:00:00'),
					end: new Date('2024-01-15T12:00:00'),
					event,
					resourceId: 'other-calendar'
				});
			});

			expect(mockDispatch).not.toHaveBeenCalled();
			expect(mockCreateSnackbar).not.toHaveBeenCalled();
		});

		it('shows a warning snackbar when dragging an all-day recurring non-exception event', () => {
			const { result } = setupHook(useCalendarComponentUtils);
			const event = mockedData.getEvent({
				allDay: false,
				resource: { isRecurrent: true, isException: false }
			});

			act(() => {
				result.current.onEventDropOrResize({
					start: new Date('2024-01-16'),
					end: new Date('2024-01-16'),
					event,
					isAllDay: true
				});
			});

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({ severity: 'warning' })
			);
			expect(mockDispatch).not.toHaveBeenCalled();
		});

		it('does nothing when start, end and allDay have not changed', () => {
			const event = mockedData.getEvent({ resource: { isRecurrent: false } });
			const { result } = setupHook(useCalendarComponentUtils);

			act(() => {
				result.current.onEventDropOrResize({
					start: event.start,
					end: event.end,
					event,
					isAllDay: event.allDay
				});
			});

			expect(mockDispatch).not.toHaveBeenCalled();
			expect(mockCreateSnackbar).not.toHaveBeenCalled();
		});

		it('dispatches getInvite when a non-recurrent event position changes', async () => {
			const event = mockedData.getEvent({ resource: { isRecurrent: false } });
			const newStart = new Date('2024-01-16T10:00:00');
			const newEnd = new Date('2024-01-16T11:00:00');
			const soapPayload = makeSoapPayload(newStart.valueOf(), newEnd.valueOf());

			mockDispatch.mockResolvedValue({ payload: soapPayload });
			vi.mocked(normalizeInvite).mockReturnValue(
				mockedData.getInvite({ event, context: { participants: {} } })
			);

			const { result } = setupHook(useCalendarComponentUtils);

			act(() => {
				result.current.onEventDropOrResize({
					start: newStart,
					end: newEnd,
					event
				});
			});

			expect(mockDispatch).toHaveBeenCalledTimes(1);
			expect(getInvite).toHaveBeenCalledWith({
				inviteId: event.resource.inviteId,
				ridZ: event.resource.ridZ
			});
		});

		it('opens the recurrent appointment modal when a recurrent event position changes', async () => {
			const event = mockedData.getEvent({
				resource: { isRecurrent: true, isException: false }
			});
			const newStart = new Date('2024-01-16T10:00:00');
			const newEnd = new Date('2024-01-16T11:00:00');

			const { result } = setupHook(useCalendarComponentUtils);

			act(() => {
				result.current.onEventDropOrResize({
					start: newStart,
					end: newEnd,
					event
				});
			});

			expect(mockCreateModal).toHaveBeenCalledWith(
				expect.objectContaining({ id: 'modify-recurrent-appointment' }),
				true
			);
		});
	});

	describe('onDropOrResizeFn', () => {
		const triggerDropResize = (
			result: ReturnType<typeof setupHook<typeof useCalendarComponentUtils>>['result'],
			event: ReturnType<typeof mockedData.getEvent>
		): void => {
			const newStart = new Date(event.start.valueOf() + 3600000);
			const newEnd = new Date(event.end.valueOf() + 3600000);
			result.current.onEventDropOrResize({ start: newStart, end: newEnd, event });
		};

		it('does nothing when the dispatch resolves with no payload', async () => {
			mockDispatch.mockResolvedValue({ payload: null });
			const event = mockedData.getEvent({ resource: { isRecurrent: false } });
			const { result } = setupHook(useCalendarComponentUtils);

			act(() => {
				triggerDropResize(result, event);
			});

			await waitFor(() => expect(mockDispatch).toHaveBeenCalled());
			expect(onSave).not.toHaveBeenCalled();
		});

		it('calls onSave with draft=true when the invite has no participants', async () => {
			const event = mockedData.getEvent({ resource: { isRecurrent: false } });
			const soapPayload = makeSoapPayload(event.start.valueOf(), event.end.valueOf());
			mockDispatch.mockResolvedValue({ payload: soapPayload });
			vi.mocked(normalizeInvite).mockReturnValue(
				mockedData.getInvite({ event, context: { participants: {} } })
			);

			const { result } = setupHook(useCalendarComponentUtils);

			act(() => {
				triggerDropResize(result, event);
			});

			await waitFor(() => expect(onSave).toHaveBeenCalled());
			expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ draft: true, isNew: false }));
		});

		it('calls onSave with draft=true when isOrganizer is false (even with participants)', async () => {
			const event = mockedData.getEvent({ resource: { isRecurrent: false } });
			const soapPayload = makeSoapPayload(event.start.valueOf(), event.end.valueOf());
			mockDispatch.mockResolvedValue({ payload: soapPayload });
			vi.mocked(normalizeInvite).mockReturnValue(
				mockedData.getInvite({
					event,
					context: { participants: { AC: [{ email: 'test@test.com' } as any] }, isOrganizer: false }
				})
			);

			const { result } = setupHook(useCalendarComponentUtils);

			act(() => {
				triggerDropResize(result, event);
			});

			await waitFor(() => expect(onSave).toHaveBeenCalled());
			expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ draft: true, isNew: false }));
		});

		it('calls onSave directly when invite was never sent (inviteNeverSent=true)', async () => {
			const event = mockedData.getEvent({
				resource: { isRecurrent: false, inviteNeverSent: true }
			});
			const soapPayload = makeSoapPayload(event.start.valueOf(), event.end.valueOf());
			mockDispatch.mockResolvedValue({ payload: soapPayload });
			vi.mocked(normalizeInvite).mockReturnValue(
				mockedData.getInvite({
					event,
					context: {
						participants: { AC: [{ email: 'test@test.com' } as any] },
						isOrganizer: true,
						isException: true
					}
				})
			);

			const { result } = setupHook(useCalendarComponentUtils);

			act(() => {
				triggerDropResize(result, event);
			});

			await waitFor(() => expect(onSave).toHaveBeenCalled());
			expect(mockCreateModal).not.toHaveBeenCalledWith(
				expect.objectContaining({ id: 'modify-invite-message' }),
				true
			);
		});

		it('opens the modify message modal when invite has participants, is organizer, and is exception', async () => {
			const event = mockedData.getEvent({
				resource: { isRecurrent: false, ridZ: '20240115T100000Z', inviteNeverSent: false }
			});
			const soapPayload = makeSoapPayload(event.start.valueOf(), event.end.valueOf());
			mockDispatch.mockResolvedValue({ payload: soapPayload });
			vi.mocked(normalizeInvite).mockReturnValue(
				mockedData.getInvite({
					event,
					context: {
						participants: { AC: [{ email: 'attendee@test.com' } as any] },
						isOrganizer: true,
						isException: false
					}
				})
			);

			const { result } = setupHook(useCalendarComponentUtils);

			act(() => {
				triggerDropResize(result, event);
			});

			await waitFor(() => {
				expect(mockCreateModal).toHaveBeenCalledWith(
					expect.objectContaining({ id: 'modify-invite-message' }),
					true
				);
			});
			expect(onSave).not.toHaveBeenCalled();
		});

		it('shows an info snackbar after a successful save', async () => {
			const event = mockedData.getEvent({ resource: { isRecurrent: false } });
			const soapPayload = makeSoapPayload(event.start.valueOf(), event.end.valueOf());
			mockDispatch.mockResolvedValue({ payload: soapPayload });
			vi.mocked(normalizeInvite).mockReturnValue(
				mockedData.getInvite({ event, context: { participants: {} } })
			);
			vi.mocked(onSave).mockResolvedValue({ response: true });

			const { result } = setupHook(useCalendarComponentUtils);

			act(() => {
				triggerDropResize(result, event);
			});

			await waitFor(() => {
				expect(mockCreateSnackbar).toHaveBeenCalledWith(
					expect.objectContaining({ severity: 'info' })
				);
			});
		});

		it('does not show a snackbar when the save response is falsy', async () => {
			const event = mockedData.getEvent({ resource: { isRecurrent: false } });
			const soapPayload = makeSoapPayload(event.start.valueOf(), event.end.valueOf());
			mockDispatch.mockResolvedValue({ payload: soapPayload });
			vi.mocked(normalizeInvite).mockReturnValue(
				mockedData.getInvite({ event, context: { participants: {} } })
			);
			vi.mocked(onSave).mockResolvedValue({ response: undefined });

			const { result } = setupHook(useCalendarComponentUtils);

			act(() => {
				triggerDropResize(result, event);
			});

			await waitFor(() => expect(onSave).toHaveBeenCalled());
			expect(mockCreateSnackbar).not.toHaveBeenCalled();
		});

		it('triggers onDropOrResizeFn with isSeries=true when series option is selected', async () => {
			const event = mockedData.getEvent({
				resource: { isRecurrent: true, isException: false }
			});
			const newStart = new Date(event.start.valueOf() + 3600000);
			const newEnd = new Date(event.end.valueOf() + 3600000);
			const soapPayload = makeSoapPayload(newStart.valueOf(), newEnd.valueOf());

			mockDispatch.mockResolvedValue({ payload: soapPayload });
			vi.mocked(normalizeInvite).mockReturnValue(
				mockedData.getInvite({ event, context: { participants: {} } })
			);

			const { result } = setupHook(useCalendarComponentUtils);

			act(() => {
				result.current.onEventDropOrResize({ start: newStart, end: newEnd, event });
			});

			expect(mockCreateModal).toHaveBeenCalledWith(
				expect.objectContaining({ id: 'modify-recurrent-appointment' }),
				true
			);

			// StoreProvider wraps AppointmentTypeHandlingModal — traverse React element tree (not DOM)
			// eslint-disable-next-line testing-library/no-node-access
			const storeProvider = mockCreateModal.mock.calls[0][0].children as React.ReactElement;
			// eslint-disable-next-line testing-library/no-node-access
			const appointmentModal = storeProvider.props.children as React.ReactElement;
			const onSeriesFn = appointmentModal.props.onSeries as () => void;
			expect(typeof onSeriesFn).toBe('function');

			act(() => {
				onSeriesFn();
			});

			// Calling series triggers onDropOrResizeFn which dispatches getInvite
			expect(mockDispatch).toHaveBeenCalledTimes(1);
		});
	});
});
