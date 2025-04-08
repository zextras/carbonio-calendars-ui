/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createSoapAPIInterceptor } from '../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import mockedData from '../../../test/generators';
import { InviteOrganizer, InviteParticipant } from '../../../types/store/invite';
import { setupTMock } from '../../../utils/tests';
import { RootState } from '../../redux';
import { moveAppointmentToTrash } from '../move-appointment-to-trash';

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
	organizer = defaultOrganizer
}: {
	organizer?: InviteOrganizer;
}): Partial<RootState> => ({
	invites: {
		invites: {
			'test-invite-id': {
				...mockedData.getInvite(),
				organizer,
				participants: {
					AC: [defaultParticipant]
				}
			}
		},
		status: ''
	}
});

describe('moveAppointmentToTrash', () => {
	it('should call CancelAppointmentRequest with organizer when invite has valid organizer', async () => {
		const mockDispatch = jest.fn();
		const mockState = generateMockState({});
		const mockGetState = jest.fn(() => mockState as RootState);
		const mockRejectWithValue = jest.fn();

		const thunk = moveAppointmentToTrash({
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
		});

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
			organizer: {} as InviteOrganizer
		});
		const mockDispatch = jest.fn();
		const mockGetState = jest.fn(() => mockStateWithNoOrganizer as RootState);

		const inviteId = 'test-invite-id';
		const thunk = moveAppointmentToTrash({
			inviteId,
			t: mockTFunction,
			isOrganizer: true,
			deleteSingleInstance: true,
			inst: { d: '20230102T100000Z', tz: 'America/New_York' },
			s: 123,
			newMessage: '',
			ridZ: '',
			recur: false,
			isRecurrent: true,
			id: inviteId
		});

		const cancelAppointmentAPIInterceptor = createSoapAPIInterceptor('CancelAppointment', {});
		await thunk(mockDispatch, mockGetState, undefined);
		const request = await cancelAppointmentAPIInterceptor;
		expect(request).toEqual(
			expect.objectContaining({
				id: inviteId,
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
});
