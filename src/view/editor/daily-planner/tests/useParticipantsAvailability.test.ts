/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { getSetupServer } from '../../../../carbonio-ui-commons/test/jest-setup';
import { GetFreeBusyResponse } from '../../../../soap/get-free-busy-request';
import {
	ParticipantAvailability,
	useParticipantsAvailability
} from '../useParticipantsAvailability';

const mockFreeBusyResponse = (usersFreeBusy: GetFreeBusyResponse['usr']): void => {
	getSetupServer().use(
		http.post('/service/soap/GetFreeBusyRequest', async () =>
			HttpResponse.json({
				Body: {
					GetFreeBusyResponse: {
						usr: usersFreeBusy,
						_jsns: 'urn:zimbraMail'
					}
				}
			})
		)
	);
};

describe('useParticipantsAvailability', () => {
	it('should return an empty object if no availability', () => {
		const participants = [{ email: 'test@test.com' }];
		const { result } = renderHook(() =>
			useParticipantsAvailability({
				participants
			})
		);
		expect(result.current).toMatchObject({});
	});

	it('should return correct free availability for participant', async () => {
		const participants = [{ email: 'test@test.com' }];
		mockFreeBusyResponse([
			{
				id: 'test@test.com',
				f: [{ s: 100, e: 200 }]
			}
		]);
		const { result } = renderHook(() =>
			useParticipantsAvailability({
				participants
			})
		);

		const participantEmail = 'test@test.com';
		const expected: ParticipantAvailability = {
			free: [{ startDateEpochMillis: 100, endDateEpochMillis: 200 }],
			busy: [],
			tentative: []
		};
		await waitFor(() => {
			expect(result.current[participantEmail]).toMatchObject(expected);
		});
	});
});
