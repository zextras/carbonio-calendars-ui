/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { cancelAppointmentRequest } from '../../../soap/cancel-appointment-request';
import mockedData from '../../../test/generators';
import { InviteOrganizer } from '../../../types/store/invite';
import { setupTMock } from '../../../utils/tests';
import { RootState } from '../../redux';
import { moveAppointmentToTrash } from '../move-appointment-to-trash';

jest.mock('../../../soap/cancel-appointment-request');

const mockTFunction = setupTMock();

const mockCancelAppointmentRequest = cancelAppointmentRequest as jest.MockedFunction<
	typeof cancelAppointmentRequest
>;

describe('moveAppointmentToTrash', () => {
	it('should call CancelAppointmentRequest with organizer when invite has valid organizer', async () => {
		const mockState: Partial<RootState> = {
			invites: {
				invites: {
					'test-invite-id': {
						...mockedData.getInvite(),
						// Valid organizer
						organizer: {
							a: 'organizer@test.com',
							d: 'Test Organizer',
							url: ''
						},
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

		const mockDispatch = jest.fn();
		const mockGetState = jest.fn(() => mockState as RootState);
		const mockRejectWithValue = jest.fn();

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

		await thunk(mockDispatch, mockGetState, { rejectWithValue: mockRejectWithValue });

		expect(mockCancelAppointmentRequest).toHaveBeenCalledWith({
			deleteSingleInstance: true,
			id: inviteId,
			inst: { d: '20230102T100000Z', tz: 'America/New_York' },
			isOrganizer: true,
			m: expect.objectContaining({
				e: expect.arrayContaining([
					// Should include organizer
					expect.objectContaining({
						a: 'organizer@test.com',
						p: 'Test Organizer',
						t: 'f'
					}),
					// Should include regular participant
					expect.objectContaining({
						a: 'participant1@test.com',
						p: 'Participant 1',
						t: 't'
					})
				]),
				su: expect.stringContaining('Cancelled:'),
				mp: expect.objectContaining({
					ct: 'multipart/alternative',
					mp: expect.any(Array)
				})
			}),
			s: 123
		});
	});

	it('should call CancelAppointmentRequest with empty organizer when invite has no organizer', async () => {
		const mockState: Partial<RootState> = {
			invites: {
				invites: {
					'test-invite-id': {
						...mockedData.getInvite(),
						organizer: {} as InviteOrganizer, // No valid organizer
						participants: {}
					}
				},
				status: ''
			}
		};

		const mockDispatch = jest.fn();
		const mockGetState = jest.fn(() => mockState as RootState);

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
			s: 123
		});
	});
});
