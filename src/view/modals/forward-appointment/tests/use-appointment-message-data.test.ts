/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { renderHook, waitFor } from '@testing-library/react';

import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { useAppointmentMessageData } from 'view/modals/forward-appointment/use-appointment-message-data';

const INVITE_ID = 'invite-123';

describe('useAppointmentMessageData', () => {
	it('should return null initially', () => {
		const { result } = renderHook(() =>
			useAppointmentMessageData({
				inviteId: undefined,
				ridZ: undefined
			})
		);
		expect(result.current).toBeNull();
	});

	it('should not fetch data when inviteId is not provided', () => {
		const { result } = renderHook(() =>
			useAppointmentMessageData({
				inviteId: undefined,
				ridZ: '123'
			})
		);
		expect(result.current).toBeNull();
	});

	it('should fetch and return message data when inviteId is provided', async () => {
		const mockMessageData = {
			id: 'msg-123',
			inv: [
				{
					comp: [
						{
							name: 'Test Appointment',
							desc: [{ _content: 'Test description' }],
							descHtml: [{ _content: '<p>Test description</p>' }]
						}
					]
				}
			]
		};

		const interceptor = createSoapAPIInterceptor('GetMsg', {
			m: [mockMessageData]
		});

		const { result } = renderHook(() =>
			useAppointmentMessageData({
				inviteId: INVITE_ID,
				ridZ: 'rid-456'
			})
		);

		await interceptor;

		await waitFor(() => {
			expect(result.current).toEqual(mockMessageData);
		});
	});

	it('should handle error response gracefully', async () => {
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

		const interceptor = createSoapAPIInterceptor('GetMsg', {
			error: 'Some error'
		});

		const { result } = renderHook(() =>
			useAppointmentMessageData({
				inviteId: INVITE_ID,
				ridZ: 'rid-456'
			})
		);

		await interceptor;

		await waitFor(() => {
			expect(result.current).toBeNull();
		});

		consoleErrorSpy.mockRestore();
	});

	it('should handle missing m property in response', async () => {
		const interceptor = createSoapAPIInterceptor('GetMsg', {});

		const { result } = renderHook(() =>
			useAppointmentMessageData({
				inviteId: INVITE_ID,
				ridZ: 'rid-456'
			})
		);

		await interceptor;

		await waitFor(() => {
			expect(result.current).toBeNull();
		});
	});
});
