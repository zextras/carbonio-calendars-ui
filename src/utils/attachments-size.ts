/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Editor } from '../types/editor';
import { Invite } from '../types/store/invite';

type AttachmentFileLike = { size?: number };

type PartLike = {
	cd?: string;
	disposition?: string;
	s?: number;
	size?: number;
	mp?: Array<PartLike>;
	parts?: Array<PartLike>;
};

const isAttachmentPart = (part: PartLike): boolean =>
	part.cd === 'attachment' || part.disposition === 'attachment';

const sumAttachmentParts = (parts: Array<PartLike> | undefined): number => {
	if (!Array.isArray(parts)) return 0;
	return parts.reduce((acc, part) => {
		const selfSize = isAttachmentPart(part) ? (part.size ?? part.s ?? 0) : 0;
		return acc + selfSize + sumAttachmentParts(part.mp) + sumAttachmentParts(part.parts);
	}, 0);
};

const sumAttachmentFiles = (files: ReadonlyArray<AttachmentFileLike> | undefined): number => {
	if (!Array.isArray(files)) return 0;
	return files.reduce((acc, f) => acc + (f?.size ?? 0), 0);
};

export const getEditorAttachmentsSize = (
	editor: Pick<Editor, 'attachmentFiles'> | undefined
): number => sumAttachmentFiles(editor?.attachmentFiles);

export const getInviteAttachmentsSize = (
	invite: Partial<Pick<Invite, 'attachmentFiles' | 'parts' | 'mp'>> | undefined
): number => {
	if (!invite) return 0;
	const fromFiles = sumAttachmentFiles(invite.attachmentFiles);
	if (fromFiles > 0) return fromFiles;
	return sumAttachmentParts(invite.mp) + sumAttachmentParts(invite.parts as Array<PartLike>);
};
