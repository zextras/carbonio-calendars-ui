/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse } from 'msw';

import { mockTranslation } from './mocks';
import * as getFreeBusyResponseHandler from '../../../../soap/get-free-busy-request';
import { mockFreeBusyResponse } from '../../../../soap/tests/mocks';
import {
	ParticipantAvailability,
	useParticipantsAvailability
} from '../use-participants-availability';
import {
	createAPIInterceptor,
	createSoapAPIInterceptor
} from '@test-utils/network/msw/create-api-interceptor';
import { buildSoapErrorResponseBody } from '@test-utils/utils/soap';

vi.mock('@zextras/carbonio-design-system', async () => ({
	...(await vi.importActual('@zextras/carbonio-design-system')),
	useSnackbar: vi.fn().mockReturnValue(vi.fn())
}));

vi.mock('react-i18next', async () => ({
	...(await vi.importActual('react-i18next')),
	useTranslation: vi.fn().mockReturnValue([mockTranslation])
}));

describe('useParticipantsAvailability', () => {
	it('should return an empty object if no availability', () => {
		const participants = [{ email: 'test@test.com' }];
		mockFreeBusyResponse([
			{
				id: 'test@test.com'
			}
		]);
		const { result } = renderHook(() =>
			useParticipantsAvailability({
				participants,
				startDateEpochMillis: 0,
				endDateEpochMillis: 0
			})
		);
		vi.advanceTimersByTime(250);
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
				participants,
				startDateEpochMillis: 0,
				endDateEpochMillis: 0
			})
		);

		const participantEmail = 'test@test.com';
		const expected: ParticipantAvailability = {
			free: [{ startDateEpochMillis: 100, endDateEpochMillis: 200 }],
			busy: [],
			tentative: [],
			outOfOffice: [],
			unknown: []
		};
		await waitFor(() => {
			expect(result.current[participantEmail]).toMatchObject(expected);
		});
	});

	it('should call GetFreeBusy with correct parameters', async () => {
		const participants = [{ email: 'test@test.com' }];
		const mockRequest = mockFreeBusyResponse([
			{
				id: 'test@test.com',
				f: [{ s: 100, e: 200 }]
			}
		]);

		renderHook(() =>
			useParticipantsAvailability({
				participants,
				startDateEpochMillis: 1000,
				endDateEpochMillis: 2000,
				excludeAppointmentUid: '123'
			})
		);

		vi.advanceTimersByTime(250);
		const request = await mockRequest;
		expect(request.s).toBe(1000);
		expect(request.e).toBe(2000);
		expect(request.uid).toBe('test@test.com');
		expect(request.excludeUid).toBe('123');
	});

	it('should omit excludeUid from GetFreeBusy when exclude value not provided', async () => {
		const mockRequest = mockFreeBusyResponse([]);

		renderHook(() =>
			useParticipantsAvailability({
				participants: [{ email: 'aaa@test.com' }],
				startDateEpochMillis: 1000,
				endDateEpochMillis: 2000
			})
		);

		vi.advanceTimersByTime(250);
		const request = await mockRequest;
		expect(request.excludeUid).toBeUndefined();
	});

	it('should not call GetFreeBusy API if no participants', async () => {
		const getFreeBusyHandler = vi.spyOn(getFreeBusyResponseHandler, 'getFreeBusyRequest');
		renderHook(() =>
			useParticipantsAvailability({
				participants: [],
				startDateEpochMillis: 0,
				endDateEpochMillis: 0
			})
		);
		vi.advanceTimersByTime(250);
		expect(getFreeBusyHandler).not.toHaveBeenCalled();
	});

	it('should call GetFreeBusy API only once if participants do not changes', async () => {
		const interceptor = createAPIInterceptor(
			'post',
			'/service/soap/GetFreeBusyRequest',
			HttpResponse.json({
				Body: {
					GetFreeBusyResponse: {}
				}
			})
		);
		const participants = [{ email: '123@test.com' }];

		const { rerender } = renderHook(() =>
			useParticipantsAvailability({
				participants,
				startDateEpochMillis: 0,
				endDateEpochMillis: 0
			})
		);
		vi.advanceTimersByTime(250);
		rerender();
		vi.advanceTimersByTime(250);
		await waitFor(() => {
			expect(interceptor.getCalledTimes()).toBe(1);
		});
	});

	it('should return an empty array if there are no results', async () => {
		const interceptor = createAPIInterceptor(
			'post',
			'/service/soap/GetFreeBusyRequest',
			HttpResponse.json({
				Body: {
					GetFreeBusyResponse: { usr: [] }
				}
			})
		);
		const participants = [{ email: '123@test.com' }];

		const { result } = renderHook(() =>
			useParticipantsAvailability({
				participants,
				startDateEpochMillis: 0,
				endDateEpochMillis: 0
			})
		);
		vi.advanceTimersByTime(250);
		await waitFor(() => {
			expect(interceptor.getCalledTimes()).toBe(1);
		});
		expect(result.current).toEqual({});
	});

	it('should update returned results even if API call fails', async () => {
		const email = '123@test.com';
		const startDateEpochMillis = 0;
		const endDateEpochMillis = 0;
		const participants = [{ email }];

		const successFullInterceptor = mockFreeBusyResponse([{ id: email, f: [], u: [] }]);
		const { result, rerender } = renderHook(useParticipantsAvailability, {
			initialProps: {
				participants,
				startDateEpochMillis,
				endDateEpochMillis
			}
		});
		vi.advanceTimersByTime(250);
		await successFullInterceptor;
		await waitFor(() => {
			expect(result.current).toMatchObject({
				[email]: { free: [], outOfOffice: [], busy: [], tentative: [], unknown: [] }
			});
		});

		const failingInterceptor = createSoapAPIInterceptor(
			'GetFreeBusy',
			buildSoapErrorResponseBody()
		);
		const newParticipants = [{ email }, { email: 'newAttendee@test.com' }];
		rerender({ participants: newParticipants, startDateEpochMillis, endDateEpochMillis });
		vi.advanceTimersByTime(250);
		await failingInterceptor;
		await waitFor(() => {
			expect(result.current).toEqual({});
		});
	});
});
