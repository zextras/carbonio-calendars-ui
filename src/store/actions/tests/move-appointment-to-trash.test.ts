/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import mockedData from '../../../test/generators';
import { InviteOrganizer, InviteParticipant } from '../../../types/store/invite';
import { setupTMock } from '../../../utils/tests';
import { RootState } from '../../redux';
import { moveAppointmentToTrash } from '../move-appointment-to-trash';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

const mockTFunction = setupTMock();

const defaultOrganizer: InviteOrganizer = {
	a: 'organizer@test.com',
	d: 'Test Organizer',
	url: 'https://test.com'
};

const defaultInviteId = 'test-invite-id';

const defaultParticipant: InviteParticipant = {
	email: 'participant1@test.com',
	name: 'Participant 1',
	isOptional: false,
	response: 'TE'
};

const generateMockState = ({
	organizer = defaultOrganizer,
	compNum = 0
}: {
	organizer?: InviteOrganizer;
	compNum?: number;
}): Partial<RootState> => ({
	invites: {
		invites: {
			'test-invite-id': {
				...mockedData.getInvite(),
				organizer,
				participants: {
					AC: [defaultParticipant]
				},
				compNum
			}
		},
		status: ''
	}
});

describe('moveAppointmentToTrash', () => {
	const moveAppointmentToTrashParam = {
		inviteId: defaultInviteId,
		t: mockTFunction,
		isOrganizer: true,
		deleteSingleInstance: true,
		inst: { d: '20230102T100000Z', tz: 'America/New_York' },
		s: 123,
		newMessage: '',
		ridZ: '',
		recur: false,
		isRecurrent: true,
		id: defaultInviteId
	};
	it('should call CancelAppointmentRequest with organizer when invite has valid organizer', async () => {
		const mockDispatch = vi.fn();
		const mockState = generateMockState({});
		const mockGetState = vi.fn(() => mockState as RootState);
		const mockRejectWithValue = vi.fn();

		const thunk = moveAppointmentToTrash(moveAppointmentToTrashParam);

		const cancelAppointmentAPIInterceptor = createSoapAPIInterceptor('CancelAppointment', {});

		await thunk(mockDispatch, mockGetState, { rejectWithValue: mockRejectWithValue });

		const request = await cancelAppointmentAPIInterceptor;
		expect(request).toEqual(
			expect.objectContaining({
				id: defaultInviteId,
				m: expect.objectContaining({
					e: [
						{
							a: defaultParticipant.email,
							p: defaultParticipant.name,
							t: 't'
						},
						{
							a: 'organizer@test.com',
							p: 'Test Organizer',
							t: 'f'
						}
					]
				})
			})
		);
	});

	it('should call CancelAppointmentRequest with empty organizer when invite has no organizer', async () => {
		const mockStateWithNoOrganizer: Partial<RootState> = generateMockState({
			// TODO: see CO-1885 The type of organizer is not correct in this case the organizer can be undefined
			organizer: {} as InviteOrganizer // No valid organizer
		});
		const mockDispatch = vi.fn();
		const mockGetState = vi.fn(() => mockStateWithNoOrganizer as RootState);

		const thunk = moveAppointmentToTrash(moveAppointmentToTrashParam);

		const cancelAppointmentAPIInterceptor = createSoapAPIInterceptor('CancelAppointment', {});
		await thunk(mockDispatch, mockGetState, undefined);
		const request = await cancelAppointmentAPIInterceptor;
		expect(request).toEqual(
			expect.objectContaining({
				id: defaultInviteId,
				m: expect.objectContaining({
					e: [
						{
							a: defaultParticipant.email,
							p: defaultParticipant.name,
							t: 't'
						}
					]
				})
			})
		);
	});

	it('should call CancelAppointmentRequest with the correct comp number when invite has compNum defined', async () => {
		const mockStateWithCompNum: Partial<RootState> = generateMockState({
			organizer: {
				...defaultOrganizer
			},
			compNum: 42
		});
		const mockDispatch = vi.fn();
		const mockGetState = vi.fn(() => mockStateWithCompNum as RootState);

		const thunk = moveAppointmentToTrash(moveAppointmentToTrashParam);

		const cancelAppointmentAPIInterceptor = createSoapAPIInterceptor('CancelAppointment', {});
		await thunk(mockDispatch, mockGetState, undefined);
		const request = await cancelAppointmentAPIInterceptor;
		expect(request).toEqual(
			expect.objectContaining({
				id: defaultInviteId,
				comp: 42
			})
		);
	});
});
