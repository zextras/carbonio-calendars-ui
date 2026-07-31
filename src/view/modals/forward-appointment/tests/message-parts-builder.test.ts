/* eslint-disable sonarjs/no-duplicate-string */
/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { buildMessageParts } from 'view/modals/forward-appointment/message-parts-builder';

describe('buildMessageParts', () => {
	it('should return empty array when messageData is null', () => {
		const result = buildMessageParts(null);
		expect(result).toEqual([]);
	});

	it('should return empty array when messageData is undefined', () => {
		const result = buildMessageParts(undefined as never);
		expect(result).toEqual([]);
	});

	it('should build plain text message part only', () => {
		const messageData = {
			inv: [
				{
					comp: [
						{
							desc: [{ _content: 'This is a plain text description' }]
						}
					]
				}
			]
		};

		const result = buildMessageParts(messageData);

		expect(result).toEqual([
			{
				ct: 'text/plain',
				content: 'This is a plain text description'
			}
		]);
	});

	it('should build HTML message part only', () => {
		const messageData = {
			inv: [
				{
					comp: [
						{
							descHtml: [{ _content: '<p>This is an HTML description</p>' }]
						}
					]
				}
			]
		};

		const result = buildMessageParts(messageData);

		expect(result).toEqual([
			{
				ct: 'text/html',
				content: '<p>This is an HTML description</p>'
			}
		]);
	});

	it('should build both plain text and HTML message parts', () => {
		const messageData = {
			inv: [
				{
					comp: [
						{
							desc: [{ _content: 'Plain text description' }],
							descHtml: [{ _content: '<p>HTML description</p>' }]
						}
					]
				}
			]
		};

		const result = buildMessageParts(messageData);

		expect(result).toEqual([
			{
				ct: 'text/plain',
				content: 'Plain text description'
			},
			{
				ct: 'text/html',
				content: '<p>HTML description</p>'
			}
		]);
	});

	it('should handle empty description fields', () => {
		const messageData = {
			inv: [
				{
					comp: [
						{
							desc: [{ _content: '' }],
							descHtml: [{ _content: '' }]
						}
					]
				}
			]
		};

		const result = buildMessageParts(messageData);

		expect(result).toEqual([]);
	});

	it('should handle missing desc array', () => {
		const messageData = {
			inv: [
				{
					comp: [
						{
							descHtml: [{ _content: '<p>HTML only</p>' }]
						}
					]
				}
			]
		};

		const result = buildMessageParts(messageData);

		expect(result).toEqual([
			{
				ct: 'text/html',
				content: '<p>HTML only</p>'
			}
		]);
	});

	it('should handle missing descHtml array', () => {
		const messageData = {
			inv: [
				{
					comp: [
						{
							desc: [{ _content: 'Plain text only' }]
						}
					]
				}
			]
		};

		const result = buildMessageParts(messageData);

		expect(result).toEqual([
			{
				ct: 'text/plain',
				content: 'Plain text only'
			}
		]);
	});

	it('should handle missing inv array', () => {
		const messageData = {};

		const result = buildMessageParts(messageData);

		expect(result).toEqual([]);
	});

	it('should handle missing comp array', () => {
		const messageData = {
			inv: [{}]
		};

		const result = buildMessageParts(messageData);

		expect(result).toEqual([]);
	});

	it('should handle empty inv array', () => {
		const messageData = {
			inv: []
		};

		const result = buildMessageParts(messageData);

		expect(result).toEqual([]);
	});

	it('should handle empty comp array', () => {
		const messageData = {
			inv: [
				{
					comp: []
				}
			]
		};

		const result = buildMessageParts(messageData);

		expect(result).toEqual([]);
	});

	it('should handle missing _content in desc', () => {
		const messageData = {
			inv: [
				{
					comp: [
						{
							desc: [{}],
							descHtml: [{ _content: '<p>HTML content</p>' }]
						}
					]
				}
			]
		};

		const result = buildMessageParts(messageData);

		expect(result).toEqual([
			{
				ct: 'text/html',
				content: '<p>HTML content</p>'
			}
		]);
	});

	it('should handle missing _content in descHtml', () => {
		const messageData = {
			inv: [
				{
					comp: [
						{
							desc: [{ _content: 'Plain text content' }],
							descHtml: [{}]
						}
					]
				}
			]
		};

		const result = buildMessageParts(messageData);

		expect(result).toEqual([
			{
				ct: 'text/plain',
				content: 'Plain text content'
			}
		]);
	});

	it('should fall back to raw mp plain text part when comp has no desc', () => {
		const messageData = {
			inv: [{ comp: [{}] }],
			mp: [{ ct: 'text/plain', content: 'Plain text from mp' }]
		};

		const result = buildMessageParts(messageData);

		expect(result).toEqual([
			{
				ct: 'text/plain',
				content: 'Plain text from mp'
			}
		]);
	});

	it('should fall back to raw mp html part when comp has no descHtml', () => {
		const messageData = {
			inv: [{ comp: [{}] }],
			mp: [{ ct: 'text/html', content: '<p>HTML from mp</p>' }]
		};

		const result = buildMessageParts(messageData);

		expect(result).toEqual([
			{
				ct: 'text/html',
				content: '<p>HTML from mp</p>'
			}
		]);
	});

	it('should find both text and html parts nested inside a multipart/alternative mp tree', () => {
		const messageData = {
			inv: [{ comp: [{}] }],
			mp: [
				{
					ct: 'multipart/alternative',
					mp: [
						{ ct: 'text/plain', content: 'Nested plain text' },
						{ ct: 'text/html', content: '<p>Nested HTML</p>' }
					]
				}
			]
		};

		const result = buildMessageParts(messageData);

		expect(result).toEqual([
			{ ct: 'text/plain', content: 'Nested plain text' },
			{ ct: 'text/html', content: '<p>Nested HTML</p>' }
		]);
	});

	it('should prefer comp desc/descHtml over the raw mp fallback', () => {
		const messageData = {
			inv: [
				{
					comp: [
						{
							desc: [{ _content: 'Component text' }],
							descHtml: [{ _content: '<p>Component html</p>' }]
						}
					]
				}
			],
			mp: [
				{ ct: 'text/plain', content: 'Should not be used' },
				{ ct: 'text/html', content: '<p>Should not be used</p>' }
			]
		};

		const result = buildMessageParts(messageData);

		expect(result).toEqual([
			{ ct: 'text/plain', content: 'Component text' },
			{ ct: 'text/html', content: '<p>Component html</p>' }
		]);
	});

	it('should return empty array when neither comp nor mp have description content', () => {
		const messageData = {
			inv: [{ comp: [{}] }],
			mp: [{ ct: 'application/pdf', content: '', filename: 'document.pdf' }]
		};

		const result = buildMessageParts(messageData);

		expect(result).toEqual([]);
	});
});
