/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useFolderStore } from '@zextras/carbonio-ui-commons';

import { replaceLinkToAnchor, recursiveToggleCheck } from '../utilities';
import * as calendarActions from '../../store/actions/calendar-actions';
import * as searchAppointmentsActions from '../../store/actions/search-appointments';
import * as getMiniCalActions from '../../store/actions/get-mini-cal';
import mockedData from '../../test/generators';

describe('replaceLinkToAnchor', () => {
	it('should return an empty string when content is empty', () => {
		expect(replaceLinkToAnchor('')).toBe('');
	});

	it('should return an empty string when content is undefined', () => {
		expect(replaceLinkToAnchor(undefined as unknown as string)).toBe('');
	});

	it('should replace a valid HTTP URL with an anchor tag', () => {
		const input = 'Visit http://example.com for more info.';
		const output =
			'Visit <a href="http://example.com" target="_blank">http://example.com</a> for more info.';
		expect(replaceLinkToAnchor(input)).toBe(output);
	});

	it('should replace a valid HTTPS URL with an anchor tag', () => {
		const input = 'Visit https://example.com for more info.';
		const output =
			'Visit <a href="https://example.com" target="_blank">https://example.com</a> for more info.';
		expect(replaceLinkToAnchor(input)).toBe(output);
	});

	it('should replace a URL without a protocol (e.g., www.example.com) with an anchor tag', () => {
		const input = 'Visit www.example.com for more info.';
		const output =
			'Visit <a href="http://www.example.com" target="_blank">www.example.com</a> for more info.';
		expect(replaceLinkToAnchor(input)).toBe(output);
	});

	it('should handle multiple URLs in the content', () => {
		const input = 'Check out http://example.com and https://another.com.';
		const output =
			'Check out <a href="http://example.com" target="_blank">http://example.com</a> and <a href="https://another.com" target="_blank">https://another.com</a>.';
		expect(replaceLinkToAnchor(input)).toBe(output);
	});

	it('should not replace URLs inside quotes', () => {
		const input = 'Visit "http://example.com" for more info.';
		const output = 'Visit "http://example.com" for more info.';
		expect(replaceLinkToAnchor(input)).toBe(output);
	});
});

describe('recursiveToggleCheck', () => {
	const start = 1000;
	const end = 2000;

	const setupFolders = (folders: Record<string, any>): void => {
		useFolderStore.setState({ folders } as any);
	};

	beforeEach(() => {
		vi.spyOn(calendarActions, 'folderAction').mockResolvedValue({});
		vi.spyOn(searchAppointmentsActions, 'searchAppointments').mockReturnValue({
			type: 'calendars/search'
		} as any);
		vi.spyOn(getMiniCalActions, 'getMiniCal').mockReturnValue({
			type: 'calendars/getMiniCalRequest'
		} as any);
	});

	it('calls folderAction with CHECK op when folder has checked:false', async () => {
		const folder = mockedData.calendars.getCalendar({ id: '10', checked: false });
		const dispatch = vi.fn().mockResolvedValue({ payload: {} });

		recursiveToggleCheck({ folder, checked: false, dispatch, start, end, query: '' });

		await vi.waitFor(() => {
			expect(calendarActions.folderAction).toHaveBeenCalledWith([{ id: '10', op: 'check' }]);
		});
	});

	it('calls folderAction with UNCHECK op when folder has checked:true', async () => {
		const folder = mockedData.calendars.getCalendar({ id: '10', checked: true });
		const dispatch = vi.fn().mockResolvedValue({ payload: {} });

		recursiveToggleCheck({ folder, checked: true, dispatch, start, end, query: '' });

		await vi.waitFor(() => {
			expect(calendarActions.folderAction).toHaveBeenCalledWith([{ id: '10', op: '!check' }]);
		});
	});

	it('includes folder with checked:undefined when toggling to check (treats undefined as false)', async () => {
		const folder = mockedData.calendars.getCalendar({ id: '10' });
		// Force checked to undefined to simulate a folder coming from the server without explicit checked attribute
		(folder as any).checked = undefined;
		const dispatch = vi.fn().mockResolvedValue({ payload: {} });

		recursiveToggleCheck({ folder, checked: false, dispatch, start, end, query: '' });

		await vi.waitFor(() => {
			expect(calendarActions.folderAction).toHaveBeenCalledWith([{ id: '10', op: 'check' }]);
		});
	});

	it('dispatches searchAppointments with augmented query including newly checked folder on success', async () => {
		const folder = mockedData.calendars.getCalendar({ id: '10', checked: false });
		const dispatch = vi.fn().mockResolvedValue({ payload: {} });
		const existingQuery = 'inid:"5"';

		recursiveToggleCheck({ folder, checked: false, dispatch, start, end, query: existingQuery });

		await vi.waitFor(() => {
			expect(dispatch).toHaveBeenCalledWith(
				expect.objectContaining({ type: 'calendars/search' })
			);
		});

		const searchCall = (searchAppointmentsActions.searchAppointments as ReturnType<typeof vi.fn>)
			.mock.calls[0][0];
		expect(searchCall.query).toBe('inid:"5" OR inid:"10"');
		expect(searchCall.spanStart).toBe(start);
		expect(searchCall.spanEnd).toBe(end);
	});

	it('dispatches searchAppointments with only new folder ID when existing query is empty', async () => {
		const folder = mockedData.calendars.getCalendar({ id: '10', checked: false });
		const dispatch = vi.fn().mockResolvedValue({ payload: {} });

		recursiveToggleCheck({ folder, checked: false, dispatch, start, end, query: '' });

		await vi.waitFor(() => {
			expect(searchAppointmentsActions.searchAppointments).toHaveBeenCalledWith(
				expect.objectContaining({ query: 'inid:"10"' })
			);
		});
	});

	it('dispatches searchAppointments with remaining checked folders on successful UNCHECK', async () => {
		const folderToUncheck = mockedData.calendars.getCalendar({ id: '10', checked: true });
		const otherCheckedFolder = mockedData.calendars.getCalendar({ id: '20', checked: true });
		const uncheckedFolder = mockedData.calendars.getCalendar({ id: '30', checked: false });

		setupFolders({
			'10': folderToUncheck,
			'20': otherCheckedFolder,
			'30': uncheckedFolder
		});

		const dispatch = vi.fn().mockResolvedValue({ payload: {} });

		recursiveToggleCheck({
			folder: folderToUncheck,
			checked: true,
			dispatch,
			start,
			end,
			query: 'inid:"10" OR inid:"20"'
		});

		await vi.waitFor(() => {
			expect(searchAppointmentsActions.searchAppointments).toHaveBeenCalledWith(
				expect.objectContaining({ query: 'inid:"20"' })
			);
		});
	});

	it('dispatches searchAppointments with empty query when all calendars are unchecked', async () => {
		const folderToUncheck = mockedData.calendars.getCalendar({ id: '10', checked: true });
		setupFolders({ '10': folderToUncheck });

		const dispatch = vi.fn().mockResolvedValue({ payload: {} });

		recursiveToggleCheck({
			folder: folderToUncheck,
			checked: true,
			dispatch,
			start,
			end,
			query: 'inid:"10"'
		});

		await vi.waitFor(() => {
			expect(searchAppointmentsActions.searchAppointments).toHaveBeenCalledWith(
				expect.objectContaining({ query: '' })
			);
		});
	});

	it('does not call folderAction when no folders need toggling (already in target state)', () => {
		const folder = mockedData.calendars.getCalendar({ id: '10', checked: true });
		const dispatch = vi.fn();

		// folder.checked (true) !== checked (false) so it would be skipped
		// Wait, actually checked=false means we want to CHECK, and folder is already checked:true
		// That means checkAllChildren would skip it (true !== false => true => skip)
		recursiveToggleCheck({ folder, checked: false, dispatch, start, end, query: '' });

		expect(calendarActions.folderAction).not.toHaveBeenCalled();
	});

	it('does not dispatch searchAppointments when server returns a Fault', async () => {
		vi.spyOn(calendarActions, 'folderAction').mockResolvedValue({ Fault: { Code: 'service.FAILURE' } });
		const folder = mockedData.calendars.getCalendar({ id: '10', checked: false });
		const dispatch = vi.fn();

		recursiveToggleCheck({ folder, checked: false, dispatch, start, end, query: '' });

		await vi.waitFor(() => {
			expect(calendarActions.folderAction).toHaveBeenCalled();
		});
		expect(dispatch).not.toHaveBeenCalled();
	});
});
