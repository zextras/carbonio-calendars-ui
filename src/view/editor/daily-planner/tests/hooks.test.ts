/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { renderHook } from '@testing-library/react';

import { useParticipantsAvailability } from '../hooks';

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
});
