/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { renderHook } from '@testing-library/react';
import { useModal } from '@zextras/carbonio-design-system';
import { find, indexOf } from 'lodash';

import { useEventActions } from './use-event-actions';
import { setupTest, screen } from '../carbonio-ui-commons/test/test-setup';
import { EVENT_ACTIONS } from '../constants/event-actions';
import {
	AppointmentActionsItems,
	InstanceActionsItems,
	SeriesActionsItems
} from '../types/actions';
import { EventType } from '../types/event';

jest.mock('@zextras/carbonio-design-system', () => ({
	...jest.requireActual('@zextras/carbonio-design-system'),
	useModal: jest.fn()
}));

jest.mock('../store/redux/hooks', () => ({
	...jest.requireActual('../store/redux/hooks'),
	useAppSelector: jest.fn(),
	useAppDispatch: jest.fn()
}));

function getActionByName(
	actionsResult: Array<AppointmentActionsItems>,
	forwardActionName: string
): AppointmentActionsItems | undefined {
	return find(
		actionsResult as InstanceActionsItems,
		(eventAction: { id: string }) => eventAction.id === forwardActionName
	);
}
const mockCreateModal = jest.fn();
(useModal as jest.Mock).mockReturnValue({
	createModal: mockCreateModal,
	closeModal: jest.fn()
});

describe('useEventActions', () => {
	it('should return undefined if no event is provided', () => {
		const { result } = renderHook(() => useEventActions({}));
		expect(result.current).toBeUndefined();
	});

	describe('recurring event', () => {
		describe('single instance menu', () => {
			const event = { resource: { calendar: { id: '55' }, isRecurrent: true } } as EventType;
			it('should include forward appointment action', () => {
				const { result } = renderHook(() => useEventActions({ event }));

				const actionsResult = (result.current as SeriesActionsItems)[0].items;
				const forwardActionInInstanceMenu = getActionByName(actionsResult, EVENT_ACTIONS.FORWARD);
				expect(forwardActionInInstanceMenu).toBeDefined();
			});

			it('forward appointment action should be listed under copy action', () => {
				const { result } = renderHook(() => useEventActions({ event }));

				const actionsResult = (result.current as SeriesActionsItems)[0].items;
				const actionIds = actionsResult?.map((action) => action.id);
				const createCopyActionPosition = indexOf(actionIds, 'create_copy');
				expect(actionsResult[createCopyActionPosition].id).toBe('create_copy');
				expect(actionsResult[createCopyActionPosition + 1].id).toBe('forward');
			});
		});
		describe('series menu', () => {
			const event = { resource: { calendar: { id: '55' }, isRecurrent: true } } as EventType;
			it('should include forward appointment action', () => {
				const { result } = renderHook(() => useEventActions({ event }));

				const actionsResult = (result.current as SeriesActionsItems)[1].items;
				const forwardActionInInstanceMenu = getActionByName(actionsResult, EVENT_ACTIONS.FORWARD);
				expect(forwardActionInInstanceMenu).toBeDefined();
			});

			it('forward appointment action should be listed under copy action', () => {
				const { result } = renderHook(() => useEventActions({ event }));

				const actionsResult = (result.current as SeriesActionsItems)[1].items;
				const actionIds = actionsResult?.map((action) => action.id);
				const createCopyActionPosition = indexOf(actionIds, 'create_copy');
				expect(actionsResult[createCopyActionPosition].id).toBe('create_copy');
				expect(actionsResult[createCopyActionPosition + 1].id).toBe('forward');
			});
		});
	});

	describe('single instance event', () => {
		const event = { resource: { calendar: { id: '55' }, isRecurrent: false } } as EventType;
		it('should include forward appointment action', () => {
			const { result } = renderHook(() => useEventActions({ event }));

			const actionsResult = result.current as InstanceActionsItems;
			const forwardAction = getActionByName(actionsResult, EVENT_ACTIONS.FORWARD);
			expect(forwardAction).toBeDefined();
		});

		it('forward appointment action should be listed under copy action on a generic event', () => {
			const { result } = renderHook(() => useEventActions({ event }));

			const actionsResult = result.current as InstanceActionsItems;
			const actionIds = actionsResult?.map((action) => action.id);
			const createCopyActionPosition = indexOf(actionIds, 'create_copy');
			expect(actionsResult[createCopyActionPosition].id).toBe('create_copy');
			expect(actionsResult[createCopyActionPosition + 1].id).toBe('forward');
		});

		it('forward appointment action should open forward modal on click', async () => {
			const { result } = renderHook(() => useEventActions({ event }));
			const actionsResult = result.current as InstanceActionsItems;
			const forwardAction = getActionByName(
				actionsResult,
				EVENT_ACTIONS.FORWARD
			) as AppointmentActionsItems;

			forwardAction.onClick?.({} as KeyboardEvent);

			expect(mockCreateModal).toBeCalledTimes(1);
			expect(mockCreateModal).toBeCalledWith(
				expect.objectContaining({ id: EVENT_ACTIONS.FORWARD }),
				true
			);
			const { children: modal } = mockCreateModal.mock.calls[0][0];
			setupTest(modal);
			expect(await screen.findByTestId('forward-appointment-modal')).toBeInTheDocument();
		});
	});
});
