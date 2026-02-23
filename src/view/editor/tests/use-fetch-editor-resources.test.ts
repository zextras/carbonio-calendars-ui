/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { renderHook, waitFor } from '@testing-library/react';

import { searchCalendarReturnType } from '../../../soap/search-calendar-resources-request';
import { useFetchEditorResources } from '../use-fetch-editor-resources';

// vi.spyOn() cannot bypass MSW because the actual HTTP request is still made. Use of vi.mock() with vi.hoisted()
//  to completely replace the module implementation, which prevents the HTTP
// request from being made at all and bypasses MSW

const { mockSearchCalendarMultipleResourcesRequest } = vi.hoisted(() => ({
	mockSearchCalendarMultipleResourcesRequest: vi.fn()
}));

vi.mock('../../../soap/search-calendar-resources-request', () => ({
	searchCalendarMultipleResourcesRequest: mockSearchCalendarMultipleResourcesRequest
}));

describe('useFetchEditorResources', () => {
	it('returns true for hasEquipment and hasMeetingRoom when both resources are present', async () => {
		mockSearchCalendarMultipleResourcesRequest.mockResolvedValueOnce({
			calresource: [
				{ _attrs: { zimbraCalResType: 'Location' } },
				{ _attrs: { zimbraCalResType: 'Equipment' } }
			]
		} as searchCalendarReturnType);

		const { result } = renderHook(() => useFetchEditorResources());

		await waitFor(async () => {
			expect(result.current.resourcesLoaded).toBe(true);
		});
		expect(result.current.hasEquipment).toBe(true);
		expect(result.current.hasMeetingRoom).toBe(true);
	});

	it('returns false for hasEquipment when only meeting room resources are present', async () => {
		mockSearchCalendarMultipleResourcesRequest.mockResolvedValueOnce({
			calresource: [{ _attrs: { zimbraCalResType: 'Location' } }]
		} as unknown as searchCalendarReturnType);

		const { result } = renderHook(() => useFetchEditorResources());

		await waitFor(async () => {
			expect(result.current.resourcesLoaded).toBe(true);
		});
		expect(result.current.hasEquipment).toBe(false);
		expect(result.current.hasMeetingRoom).toBe(true);
	});

	it('returns false for hasMeetingRoom when only equipment resources are present', async () => {
		mockSearchCalendarMultipleResourcesRequest.mockResolvedValueOnce({
			calresource: [{ _attrs: { zimbraCalResType: 'Equipment' } }]
		} as unknown as searchCalendarReturnType);

		const { result } = renderHook(() => useFetchEditorResources());

		await waitFor(async () => {
			expect(result.current.resourcesLoaded).toBe(true);
		});
		expect(result.current.hasEquipment).toBe(true);
		expect(result.current.hasMeetingRoom).toBe(false);
	});

	it('returns false for both hasEquipment and hasMeetingRoom when no resources are present', async () => {
		mockSearchCalendarMultipleResourcesRequest.mockResolvedValueOnce({
			calresource: []
		} as unknown as searchCalendarReturnType);

		const { result } = renderHook(() => useFetchEditorResources());

		await waitFor(async () => {
			expect(result.current.resourcesLoaded).toBe(true);
		});
		expect(result.current.hasEquipment).toBe(false);
		expect(result.current.hasMeetingRoom).toBe(false);
	});

	it('returns false for resourcesLoaded when the request fails', async () => {
		mockSearchCalendarMultipleResourcesRequest.mockRejectedValueOnce(new Error('Network error'));

		const { result } = renderHook(() => useFetchEditorResources());

		await waitFor(async () => {
			expect(result.current.resourcesLoaded).toBe(false);
		});
		expect(result.current.hasEquipment).toBe(false);
		expect(result.current.hasMeetingRoom).toBe(false);
	});

	it('handles undefined calresource gracefully', async () => {
		mockSearchCalendarMultipleResourcesRequest.mockResolvedValueOnce(
			{} as unknown as searchCalendarReturnType
		);

		const { result } = renderHook(() => useFetchEditorResources());

		await waitFor(async () => {
			expect(result.current.resourcesLoaded).toBe(true);
		});
		expect(result.current.hasEquipment).toBe(false);
		expect(result.current.hasMeetingRoom).toBe(false);
	});

	it('calls onFailure callback when the request fails', async () => {
		const onFailureMock = vi.fn();
		mockSearchCalendarMultipleResourcesRequest.mockRejectedValueOnce(new Error('Network error'));

		const { result } = renderHook(() => useFetchEditorResources({ onFailure: onFailureMock }));

		await waitFor(async () => {
			expect(result.current.resourcesLoaded).toBe(false);
		});
		expect(onFailureMock).toHaveBeenCalled();
	});

	it('does not call onFailure if the request is aborted', async () => {
		const onFailureMock = vi.fn();
		const abortError = new Error('Aborted');
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(abortError as any).name = 'AbortError';
		mockSearchCalendarMultipleResourcesRequest.mockImplementationOnce((_types, signal) => {
			// Simulate aborting before the promise settles
			Object.defineProperty(signal, 'aborted', { value: true });
			return Promise.reject(abortError);
		});

		const { result } = renderHook(() => useFetchEditorResources({ onFailure: onFailureMock }));

		await waitFor(() => {
			expect(result.current.resourcesLoaded).toBe(false);
		});
		expect(onFailureMock).not.toHaveBeenCalled();
	});
});
