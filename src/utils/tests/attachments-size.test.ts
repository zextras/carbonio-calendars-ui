/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Editor } from '../../types/editor';
import { Invite } from '../../types/store/invite';
import { getEditorAttachmentsSize, getInviteAttachmentsSize } from '../attachments-size';

describe('getEditorAttachmentsSize', () => {
	it('returns 0 for an undefined editor', () => {
		expect(getEditorAttachmentsSize(undefined)).toBe(0);
	});

	it('returns 0 when attachmentFiles is missing', () => {
		expect(getEditorAttachmentsSize({} as Pick<Editor, 'attachmentFiles'>)).toBe(0);
	});

	it('returns 0 when attachmentFiles is an empty array', () => {
		expect(
			getEditorAttachmentsSize({ attachmentFiles: [] } as Pick<Editor, 'attachmentFiles'>)
		).toBe(0);
	});

	it('sums the size of every attachment file', () => {
		const editor = {
			attachmentFiles: [{ size: 1024 }, { size: 2048 }, { size: 512 }]
		} as Pick<Editor, 'attachmentFiles'>;
		expect(getEditorAttachmentsSize(editor)).toBe(1024 + 2048 + 512);
	});

	it('treats missing sizes as 0', () => {
		const editor = {
			attachmentFiles: [{ size: 1024 }, {}, { size: undefined }, { size: 2048 }]
		} as Pick<Editor, 'attachmentFiles'>;
		expect(getEditorAttachmentsSize(editor)).toBe(3072);
	});
});

describe('getInviteAttachmentsSize', () => {
	it('returns 0 for an undefined invite', () => {
		expect(getInviteAttachmentsSize(undefined)).toBe(0);
	});

	it('returns 0 when there are no attachments anywhere', () => {
		expect(getInviteAttachmentsSize({} as Partial<Invite>)).toBe(0);
	});

	it('sums attachmentFiles sizes when provided', () => {
		const invite = {
			attachmentFiles: [{ size: 10 }, { size: 20 }, { size: 30 }]
		} as unknown as Partial<Invite>;
		expect(getInviteAttachmentsSize(invite)).toBe(60);
	});

	it('falls back to walking mp when attachmentFiles is empty', () => {
		const invite = {
			attachmentFiles: [],
			mp: [
				{ cd: 'attachment', s: 100 },
				{ cd: 'inline', s: 999 },
				{
					mp: [{ disposition: 'attachment', s: 200 }]
				}
			]
		} as unknown as Partial<Invite>;
		expect(getInviteAttachmentsSize(invite)).toBe(300);
	});

	it('walks parts when attachmentFiles is absent', () => {
		const invite = {
			parts: [
				{ disposition: 'attachment', s: 50 },
				{ parts: [{ disposition: 'attachment', s: 75 }] }
			]
		} as unknown as Partial<Invite>;
		expect(getInviteAttachmentsSize(invite)).toBe(125);
	});

	it('ignores non-attachment parts', () => {
		const invite = {
			parts: [
				{ cd: 'inline', s: 1000 },
				{ disposition: 'attachment', s: 42 }
			]
		} as unknown as Partial<Invite>;
		expect(getInviteAttachmentsSize(invite)).toBe(42);
	});
});
