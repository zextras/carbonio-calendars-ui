/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse } from 'msw';

import { createAPIInterceptor } from '../../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import * as getNonWorkingHoursResponseHandler from '../../../../soap/get-non-working-hours-request';
import { mockWorkingHoursResponse } from '../../../../soap/tests/mocks';
import { useParticipantsNonWorkingHours } from '../use-participants-non-working-hours';

describe('useParticipantsNonWorkingHours', () => {
	it('should return an empty object if no availability', () => {
		const participants = [{ email: 'test@test.com' }];
		mockWorkingHoursResponse([
			{
				id: 'test@test.com',
				f: [],
				u: []
			}
		]);
		const { result } = renderHook(() =>
			useParticipantsNonWorkingHours({
				participants,
				startDateEpochMillis: 0,
				endDateEpochMillis: 0
			})
		);
		expect(result.current).toEqual({});
	});

	it('should return correct working hours for participant', async () => {
		const participants = [{ email: 'test@test.com' }];
		mockWorkingHoursResponse([
			{
				id: 'test@test.com',
				u: [{ s: 100, e: 200 }],
				f: [{ s: 100, e: 200 }]
			}
		]);
		const { result } = renderHook(() =>
			useParticipantsNonWorkingHours({
				participants,
				startDateEpochMillis: 0,
				endDateEpochMillis: 0
			})
		);

		const participantEmail = 'test@test.com';
		const expected = {
			nonWorkingHours: [{ startDateEpochMillis: 100, endDateEpochMillis: 200 }]
		};
		await waitFor(() => {
			expect(result.current[participantEmail]).toEqual(expected);
		});
	});

	it('should call GetNonWorkingHours with correct parameters', async () => {
		const participants = [{ email: 'test@test.com' }];
		const mockRequest = mockWorkingHoursResponse([
			{
				id: 'test@test.com',
				u: [{ s: 100, e: 200 }],
				f: [{ s: 100, e: 200 }]
			}
		]);

		renderHook(() =>
			useParticipantsNonWorkingHours({
				participants,
				startDateEpochMillis: 1000,
				endDateEpochMillis: 2000
			})
		);

		const request = await mockRequest;
		expect(request.s).toBe(1000);
		expect(request.e).toBe(2000);
		expect(request.name).toBe('test@test.com');
	});

	it('should not call GetNonWorkingHours API if no participants', async () => {
		const getWorkingHoursSpy = jest.spyOn(
			getNonWorkingHoursResponseHandler,
			'getNonWorkingHoursRequest'
		);
		renderHook(() =>
			useParticipantsNonWorkingHours({
				participants: [],
				startDateEpochMillis: 0,
				endDateEpochMillis: 0
			})
		);
		expect(getWorkingHoursSpy).not.toHaveBeenCalled();
	});

	it('should call GetFreeBusy API only once if participants do not changes', async () => {
		const interceptor = createAPIInterceptor(
			'post',
			'/service/soap/GetWorkingHoursRequest',
			HttpResponse.json({
				Body: {
					GetWorkingHoursResponse: {}
				}
			})
		);
		const participants = [{ email: '123@test.com' }];

		const { rerender } = renderHook(() =>
			useParticipantsNonWorkingHours({
				participants,
				startDateEpochMillis: 0,
				endDateEpochMillis: 0
			})
		);
		rerender();
		await waitFor(() => {
			expect(interceptor.getCalledTimes()).toBe(1);
		});
	});

	it('should return an empty array if there are no results', async () => {
		const interceptor = createAPIInterceptor(
			'post',
			'/service/soap/GetWorkingHoursRequest',
			HttpResponse.json({
				Body: {
					GetWorkingHoursResponse: { usr: [] }
				}
			})
		);
		const participants = [{ email: '123@test.com' }];

		const { result } = renderHook(() =>
			useParticipantsNonWorkingHours({
				participants,
				startDateEpochMillis: 0,
				endDateEpochMillis: 0
			})
		);
		await waitFor(() => {
			expect(interceptor.getCalledTimes()).toBe(1);
		});
		expect(result.current).toEqual({});
	});
});
