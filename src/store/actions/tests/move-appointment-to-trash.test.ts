/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	cancelAppointmentRequest,
	CancelAppointmentReturnType
} from '../../../soap/cancel-appointment-request';
import mockedData from '../../../test/generators';
import { InviteOrganizer } from '../../../types/store/invite';
import { setupTMock } from '../../../utils/tests';
import { RootState } from '../../redux';
import { moveAppointmentToTrash } from '../move-appointment-to-trash';

jest.mock('../../../soap/cancel-appointment-request');

const mockCancelAppointmentRequest = cancelAppointmentRequest as jest.MockedFunction<
	typeof cancelAppointmentRequest
>;

describe('moveAppointmentToTrash', () => {
	const mockTFunction = setupTMock();

	it('should call CancelAppointmentRequest with empty organizer when invite has no organizer', async () => {
		const mockState: Partial<RootState> = {
			invites: {
				invites: {
					'test-invite-id': {
						...mockedData.getInvite(),
						organizer: {} as InviteOrganizer, // No organizer
						participants: {
							AC: [
								{
									email: 'participant1@test.com',
									name: 'Participant 1',
									isOptional: false,
									response: 'TE'
								}
							]
						}
					}
				},
				status: ''
			}
		};

		const mockResponse: CancelAppointmentReturnType = {
			Fault: undefined,
			error: false,
			m: undefined
		};

		mockCancelAppointmentRequest.mockResolvedValue(mockResponse);

		const mockDispatch = jest.fn();
		const mockGetState = jest.fn(() => mockState as RootState);

		const inviteId = 'test-invite-id';
		const thunk = moveAppointmentToTrash({
			inviteId,
			t: mockTFunction,
			isOrganizer: true,
			deleteSingleInstance: true,
			inst: { d: '20230102T100000Z', tz: 'America/New_York' },
			s: 123456789,
			newMessage: '',
			ridZ: '',
			recur: false,
			isRecurrent: true,
			id: inviteId
		});

		await thunk(mockDispatch, mockGetState, undefined);

		expect(mockCancelAppointmentRequest).toHaveBeenCalledWith({
			deleteSingleInstance: true,
			id: inviteId,
			inst: { d: '20230102T100000Z', tz: 'America/New_York' },
			isOrganizer: true,
			m: expect.objectContaining({
				e: expect.not.arrayContaining([
					expect.objectContaining({
						t: 'f'
					})
				]),
				su: expect.stringContaining('Cancelled:'),
				mp: expect.objectContaining({
					ct: 'multipart/alternative',
					mp: expect.any(Array)
				})
			}),
			s: 123456789
		});
	});
});
