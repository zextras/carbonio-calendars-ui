/* eslint-disable sonarjs/no-duplicate-string */
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { normalizeInvite } from './normalize-invite';

describe('normalizeInvite', () => {
	it('should extract HTML description from invite component when available', () => {
		const mockMessage = {
			id: '2687',
			l: '2380',
			f: '',
			d: 1752046088000,
			tn: '',
			parts: [],
			inv: [
				{
					comp: [
						{
							descHtml: '<html><body>HTML from component</body></html>',
							desc: 'Text from component',
							name: 'Test Appointment',
							apptId: '2688',
							ciFolder: '10',
							s: [{ d: '20250710T073000Z', u: 1752132600000 }],
							e: [{ u: 1752134400000, d: '20250710T080000Z' }]
						}
					]
				}
			]
		};

		const result = normalizeInvite(mockMessage);

		expect(result.htmlDescription).toEqual([
			{ _content: '<html><body>HTML from component</body></html>' }
		]);
		expect(result.textDescription).toEqual([{ _content: 'Text from component' }]);
	});

	it('should extract HTML description from message parts when not in invite component', () => {
		const mockMessage = {
			id: '2687',
			l: '2380',
			f: '',
			d: 1752046088000,
			tn: '',
			parts: [
				{
					contentType: 'multipart/mixed',
					parts: [
						{
							contentType: 'text/html',
							content: '<html><body>HTML from parts</body></html>'
						},
						{
							contentType: 'text/calendar',
							content: 'BEGIN:VCALENDAR...'
						}
					]
				}
			],
			inv: [
				{
					comp: [
						{
							name: 'Test Appointment',
							apptId: '2688',
							ciFolder: '10',
							s: [{ d: '20250710T073000Z', u: 1752132600000 }],
							e: [{ u: 1752134400000, d: '20250710T080000Z' }]
						}
					]
				}
			]
		};

		const result = normalizeInvite(mockMessage);

		expect(result.htmlDescription).toEqual([
			{ _content: '<html><body>HTML from parts</body></html>' }
		]);
	});

	it('should extract both HTML and text descriptions from nested message parts', () => {
		const mockMessage = {
			id: '2687',
			l: '2380',
			f: '',
			d: 1752046088000,
			tn: '',
			parts: [
				{
					contentType: 'multipart/mixed',
					parts: [
						{
							contentType: 'text/html',
							content: '<html><body>HTML content</body></html>'
						},
						{
							contentType: 'text/plain',
							content: 'Plain text content'
						}
					]
				}
			],
			inv: [
				{
					comp: [
						{
							name: 'Test Appointment',
							apptId: '2688',
							ciFolder: '10',
							s: [{ d: '20250710T073000Z', u: 1752132600000 }],
							e: [{ u: 1752134400000, d: '20250710T080000Z' }]
						}
					]
				}
			]
		};

		const result = normalizeInvite(mockMessage);

		expect(result.htmlDescription).toEqual([
			{ _content: '<html><body>HTML content</body></html>' }
		]);
		expect(result.textDescription).toEqual([{ _content: 'Plain text content' }]);
	});

	it('should prefer invite component descriptions over message parts', () => {
		const mockMessage = {
			id: '2687',
			l: '2380',
			f: '',
			d: 1752046088000,
			tn: '',
			parts: [
				{
					contentType: 'text/html',
					content: '<html><body>HTML from parts</body></html>'
				}
			],
			inv: [
				{
					comp: [
						{
							descHtml: '<html><body>HTML from component</body></html>',
							name: 'Test Appointment',
							apptId: '2688',
							ciFolder: '10',
							s: [{ d: '20250710T073000Z', u: 1752132600000 }],
							e: [{ u: 1752134400000, d: '20250710T080000Z' }]
						}
					]
				}
			]
		};

		const result = normalizeInvite(mockMessage);

		expect(result.htmlDescription).toEqual([
			{ _content: '<html><body>HTML from component</body></html>' }
		]);
	});

	it('should return empty arrays when no descriptions are available', () => {
		const mockMessage = {
			id: '2687',
			l: '2380',
			f: '',
			d: 1752046088000,
			tn: '',
			parts: [],
			inv: [
				{
					comp: [
						{
							name: 'Test Appointment',
							apptId: '2688',
							ciFolder: '10',
							s: [{ d: '20250710T073000Z', u: 1752132600000 }],
							e: [{ u: 1752134400000, d: '20250710T080000Z' }]
						}
					]
				}
			]
		};

		const result = normalizeInvite(mockMessage);

		expect(result.htmlDescription).toEqual([]);
		expect(result.textDescription).toEqual([]);
	});
});
