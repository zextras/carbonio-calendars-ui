/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { getSetupServer } from '../../../../carbonio-ui-commons/test/jest-setup';
import { ParticipantAvailability, useParticipantsAvailability } from '../hooks';

const handleFreeBusyRequest = (): void => {
	getSetupServer().use(
		http.post('/service/soap/GetFreeBusyRequest', async () =>
			HttpResponse.json({
				Body: {
					GetFreeBusyResponse: {
						usr: [],
						_jsns: 'urn:zimbraMail'
					}
				}
			})
		)
	);
};

describe('useParticipantsAvailability', () => {
	it('should return an array of same size of input', () => {
		const participants = [{ email: 'test@test.com' }, { email: 'tes2@test.com' }];
		const { result } = renderHook(() =>
			useParticipantsAvailability({
				participants
			})
		);
		expect(result.current).toHaveLength(2);
	});

	it('should return empty availability for participant when no availability', () => {
		const participants = [{ email: 'test@test.com' }];
		const { result } = renderHook(() =>
			useParticipantsAvailability({
				participants
			})
		);
		const expected: ParticipantAvailability = {
			email: 'test@test.com',
			free: [],
			busy: [],
			tentative: []
		};
		expect(result.current[0]).toMatchObject(expected);
	});
});
