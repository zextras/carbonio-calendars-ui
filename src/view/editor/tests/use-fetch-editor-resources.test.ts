/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { renderHook, waitFor } from '@testing-library/react';

import * as searchCalendarResources from '../../../soap/search-calendar-resources-request';
import { searchCalendarReturnType } from '../../../soap/search-calendar-resources-request';
import { useFetchEditorResources } from '../use-fetch-editor-resources';

describe('useFetchEditorResources', () => {
	const mockSearchCalendarMultipleResourcesRequest = jest.spyOn(
		searchCalendarResources,
		'searchCalendarMultipleResourcesRequest'
	);

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('returns true for hasEquipment and hasMeetingRoom when both resources are present', async () => {
		mockSearchCalendarMultipleResourcesRequest.mockResolvedValueOnce({
			calresource: [
				{ _attrs: { zimbraCalResType: 'Location' } },
				{ _attrs: { zimbraCalResType: 'Equipment' } }
			]
		} as unknown as searchCalendarReturnType);

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
});
