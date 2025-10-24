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
});
