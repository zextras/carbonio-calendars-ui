/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { HttpResponse } from 'msw';

import {
	createAPIInterceptor,
	createSoapAPIInterceptor
} from '@test-utils/network/msw/create-api-interceptor';
import { generateSoapErrorResponseBody } from 'test/generators/utils';
import { ForwardAppointmentRequest } from 'types/soap/soap-actions';
import { useForwardAppointment } from 'view/modals/forward-appointment/use-forward-appointment';

const EMAIL_1 = 'user1@example.com';
const EMAIL_2 = 'user2@example.com';

describe('useForwardAppointment', () => {
	const mockOnSuccess = vi.fn();
	const mockOnError = vi.fn();
	const mockOnComplete = vi.fn();

	const defaultParams = {
		eventId: 'event-123',
		onSuccess: mockOnSuccess,
		onError: mockOnError,
		onComplete: mockOnComplete
	};

	const mockContacts = [{ value: { email: EMAIL_1 } }, { value: { email: EMAIL_2 } }] as never[];

	const mockMessageParts = [
		{ ct: 'text/plain', content: 'Plain text content' },
		{ ct: 'text/html', content: '<p>HTML content</p>' }
	];

	it('should return a function', () => {
		const { result } = renderHook(() => useForwardAppointment(defaultParams));
		expect(typeof result.current).toBe('function');
	});

	it('should call forwardAppointmentRequest with correct parameters', async () => {
		const interceptor = createSoapAPIInterceptor<ForwardAppointmentRequest>('ForwardAppointment');

		const { result } = renderHook(() => useForwardAppointment(defaultParams));

		await act(async () => {
			await result.current(mockContacts, mockMessageParts);
		});

		const request = await interceptor;

		expect(request.id).toBe('event-123');
		expect(request.m.e).toEqual([
			{ a: EMAIL_1, t: 't' },
			{ a: EMAIL_2, t: 't' }
		]);
	});

	it('should call onSuccess and onComplete when request succeeds', async () => {
		createSoapAPIInterceptor<ForwardAppointmentRequest>('ForwardAppointment');

		const { result } = renderHook(() => useForwardAppointment(defaultParams));

		await act(async () => {
			await result.current(mockContacts, mockMessageParts);
		});

		await waitFor(() => {
			expect(mockOnSuccess).toHaveBeenCalledTimes(1);
		});

		expect(mockOnError).not.toHaveBeenCalled();
		expect(mockOnComplete).toHaveBeenCalledTimes(1);
	});

	it('should call onError and onComplete when request returns Fault', async () => {
		createSoapAPIInterceptor('ForwardAppointment', generateSoapErrorResponseBody());

		const { result } = renderHook(() => useForwardAppointment(defaultParams));

		await act(async () => {
			await result.current(mockContacts, mockMessageParts);
		});

		await waitFor(() => {
			expect(mockOnError).toHaveBeenCalledTimes(1);
		});

		expect(mockOnSuccess).not.toHaveBeenCalled();
		expect(mockOnComplete).toHaveBeenCalledTimes(1);
	});

	it('should call onError when request fails', async () => {
		createAPIInterceptor('post', '/service/soap/ForwardAppointmentRequest', HttpResponse.error());

		const { result } = renderHook(() => useForwardAppointment(defaultParams));

		await act(async () => {
			await result.current(mockContacts, mockMessageParts);
		});

		await waitFor(() => {
			expect(mockOnError).toHaveBeenCalledTimes(1);
		});

		expect(mockOnSuccess).not.toHaveBeenCalled();
	});

	it('should handle empty contacts array', async () => {
		const interceptor = createSoapAPIInterceptor<ForwardAppointmentRequest>('ForwardAppointment');

		const { result } = renderHook(() => useForwardAppointment(defaultParams));

		await act(async () => {
			await result.current([], mockMessageParts);
		});

		const request = await interceptor;

		expect(request.m.e).toEqual([]);
		expect(mockOnSuccess).toHaveBeenCalledTimes(1);
	});

	it('should handle empty message parts array', async () => {
		const interceptor = createSoapAPIInterceptor<ForwardAppointmentRequest>('ForwardAppointment');

		const { result } = renderHook(() => useForwardAppointment(defaultParams));

		await act(async () => {
			await result.current(mockContacts, []);
		});

		await interceptor;

		expect(mockOnSuccess).toHaveBeenCalledTimes(1);
	});

	it('should be memoized based on dependencies', () => {
		const { result, rerender } = renderHook((props) => useForwardAppointment(props), {
			initialProps: defaultParams
		});

		const firstHandler = result.current;

		rerender(defaultParams);

		const secondHandler = result.current;

		expect(firstHandler).toBe(secondHandler);
	});

	it('should create new handler when eventId changes', () => {
		const { result, rerender } = renderHook((props) => useForwardAppointment(props), {
			initialProps: defaultParams
		});

		const firstHandler = result.current;

		rerender({ ...defaultParams, eventId: 'event-456' });

		const secondHandler = result.current;

		expect(firstHandler).not.toBe(secondHandler);
	});

	it('should create new handler when callbacks change', () => {
		const { result, rerender } = renderHook((props) => useForwardAppointment(props), {
			initialProps: defaultParams
		});

		const firstHandler = result.current;

		rerender({ ...defaultParams, onSuccess: vi.fn() });

		const secondHandler = result.current;

		expect(firstHandler).not.toBe(secondHandler);
	});

	it('should map multiple contacts correctly', async () => {
		const manyContacts = [
			{ value: { email: EMAIL_1 } },
			{ value: { email: EMAIL_2 } },
			{ value: { email: 'user3@example.com' } },
			{ value: { email: 'user4@example.com' } }
		] as never[];

		const interceptor = createSoapAPIInterceptor<ForwardAppointmentRequest>('ForwardAppointment');

		const { result } = renderHook(() => useForwardAppointment(defaultParams));

		await act(async () => {
			await result.current(manyContacts, mockMessageParts);
		});

		const request = await interceptor;

		expect(request.m.e).toHaveLength(4);
		expect(request.m.e).toEqual([
			{ a: EMAIL_1, t: 't' },
			{ a: EMAIL_2, t: 't' },
			{ a: 'user3@example.com', t: 't' },
			{ a: 'user4@example.com', t: 't' }
		]);
	});
});
