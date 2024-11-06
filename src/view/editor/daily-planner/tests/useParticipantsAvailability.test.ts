/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { renderHook, waitFor } from '@testing-library/react';

import { mockFreeBusyResponse } from '../../../../soap/test/mocks';
import {
	ParticipantAvailability,
	useParticipantsAvailability
} from '../useParticipantsAvailability';

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
