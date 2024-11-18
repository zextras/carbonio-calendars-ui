/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { includes } from 'lodash';

import { getAttachmentsDownloadLink, getAttachmentsPreviewLink } from '../attachment-utils';

jest.mock('lodash', () => ({
	includes: jest.fn()
}));

describe('attachment-utils', () => {
	const locationOrigin = 'http://localhost';

	beforeAll(() => {
		jest.spyOn(global.window, 'location', 'get').mockReturnValue({
			origin: locationOrigin
		} as Location);
	});

	describe('getAttachmentsDownloadLink', () => {
		it('should return zip link when multiple attachments are present', () => {
			const props = {
				messageId: 'msg123',
				messageSubject: 'Test Subject',
				attachments: ['part1', 'part2']
			};

			const result = getAttachmentsDownloadLink(props);

			expect(result).toBe(
				'/service/home/~/?auth=co&id=msg123&filename=Test%20Subject&charset=UTF-8&part=part1,part2&disp=a&fmt=zip'
			);
		});

		it('should return single attachment link when one attachment is present', () => {
			const props = {
				messageId: 'msg123',
				messageSubject: 'Test Subject',
				attachments: ['part1']
			};

			const result = getAttachmentsDownloadLink(props);

			expect(result).toBe('/service/home/~/?auth=co&id=msg123&part=part1&disp=a');
		});

		it('should return empty string when no attachments are provided', () => {
			const props = {
				messageId: 'msg123',
				messageSubject: 'Test Subject',
				attachments: []
			};

			const result = getAttachmentsDownloadLink(props);

			expect(result).toBe('');
		});
	});

	describe('getAttachmentsPreviewLink', () => {
		const messageId = 'msg123';
		const messageSubject = 'Test Subject';

		it('should return empty string when no attachments are provided', () => {
			const props = {
				messageId: 'msg123',
				messageSubject: 'Test Subject',
				attachments: []
			};

			const result = getAttachmentsPreviewLink(props);

			expect(result).toBe('');
		});

		it('should return image preview link for image types', () => {
			(includes as jest.Mock).mockReturnValueOnce(true); // Mocking lodash `includes` return true for image types

			const props = {
				messageId,
				messageSubject,
				attachments: ['image1'],
				attachmentType: 'image/jpeg'
			};

			const result = getAttachmentsPreviewLink(props);

			expect(includes).toHaveBeenCalledWith(
				['image/gif', 'image/png', 'image/jpeg', 'image/jpg', 'image/tiff'],
				'image/jpeg'
			);
			expect(result).toBe(
				`${locationOrigin}/service/preview/image/msg123/image1/0x0/?quality=high`
			);
		});

		it('should return pdf preview link for pdf files', () => {
			(includes as jest.Mock).mockReturnValueOnce(false).mockReturnValueOnce(true);

			const props = {
				messageId,
				messageSubject,
				attachments: ['file1'],
				attachmentType: 'application/pdf'
			};

			const result = getAttachmentsPreviewLink(props);

			expect(includes).toHaveBeenCalledWith(['application/pdf'], 'application/pdf');
			expect(result).toBe(`${locationOrigin}/service/preview/pdf/msg123/file1/?first_page=1`);
		});

		it('should return document preview link for document types', () => {
			(includes as jest.Mock)
				.mockReturnValueOnce(false)
				.mockReturnValueOnce(false)
				.mockReturnValueOnce(true);

			const props = {
				messageId,
				messageSubject,
				attachments: ['doc1'],
				attachmentType: 'application/msword'
			};

			const result = getAttachmentsPreviewLink(props);

			expect(includes).toHaveBeenCalledWith(
				[
					'text/csv',
					'text/plain',
					'application/msword',
					'application/vnd.ms-excel',
					'application/vnd.ms-powerpoint',
					'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
					'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
					'application/vnd.openxmlformats-officedocument.presentationml.presentation',
					'application/vnd.oasis.opendocument.spreadsheet',
					'application/vnd.oasis.opendocument.presentation',
					'application/vnd.oasis.opendocument.text'
				],
				'application/msword'
			);
			expect(result).toBe(`${locationOrigin}/service/preview/document/msg123/doc1`);
		});

		it('should return fallback preview link for unknown attachment types', () => {
			(includes as jest.Mock).mockReturnValue(false);

			const props = {
				messageId,
				messageSubject,
				attachments: ['unknownfile'],
				attachmentType: 'application/octet-stream'
			};

			const result = getAttachmentsPreviewLink(props);

			expect(result).toBe(
				`${locationOrigin}/service/home/~/?auth=co&id=msg123&part=unknownfile&disp=a`
			);
		});
	});
});
