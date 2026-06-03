/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	getFolderIcon,
	isCaldavChild,
	isCaldavRootFolder,
	isDataSourceRootFolder,
	replaceLinkToAnchor
} from '../utilities';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { useFolderStore } from '@zextras/carbonio-ui-commons';

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

describe('datasource folder helpers', () => {
	it('recognizes datasource root folders only when both dsId and dsType are present', () => {
		expect(isDataSourceRootFolder({ dsId: '10', dsType: 'caldav' })).toBe(true);
		expect(isDataSourceRootFolder({ dsId: '10' })).toBe(false);
		expect(isDataSourceRootFolder({ dsType: 'caldav' })).toBe(false);
	});

	it('recognizes CalDAV datasource root folders', () => {
		expect(isCaldavRootFolder({ dsId: '10', dsType: 'caldav' })).toBe(true);
		expect(isCaldavRootFolder({ dsId: '10', dsType: 'cal' })).toBe(false);
	});

	it('returns GroupCalendar icon for checked datasource roots', () => {
		const folder = generateFolder({
			view: 'appointment',
			checked: true
		});
		folder.dsId = '20';
		folder.dsType = 'caldav';

		expect(
			getFolderIcon({
				item: folder,
				checked: true
			})
		).toBe('GroupCalendar');
	});

	it('returns existing calendar icon for unchecked non-CalDAV datasource roots', () => {
		const folder = generateFolder({
			view: 'appointment',
			checked: false
		});
		folder.dsId = '20';
		folder.dsType = 'cal';

		expect(
			getFolderIcon({
				item: folder,
				checked: false
			})
		).toBe('CalendarOutline');
	});

	it('keeps existing calendar icon for datasource children', () => {
		const childFolder = generateFolder({
			view: 'appointment',
			checked: true
		});

		expect(
			getFolderIcon({
				item: childFolder,
				checked: true
			})
		).toBe('Calendar2');
	});

	it('recognizes CalDAV child folders by checking parent is a caldav datasource root', () => {
		const caldavRoot = generateFolder({
			id: 'caldav-ds-1',
			view: 'appointment'
		});
		caldavRoot.dsId = 'caldav-ds-1';
		caldavRoot.dsType = 'caldav';

		const caldavChild = generateFolder({
			id: 'caldav-cal-1',
			parent: 'caldav-ds-1',
			l: 'caldav-ds-1',
			view: 'appointment'
		});

		useFolderStore.setState(() => ({
			folders: {
				'caldav-ds-1': caldavRoot,
				'caldav-cal-1': caldavChild
			}
		}));

		expect(isCaldavChild(caldavChild)).toBe(true);
		expect(isCaldavChild(caldavRoot)).toBe(false);
	});
});
