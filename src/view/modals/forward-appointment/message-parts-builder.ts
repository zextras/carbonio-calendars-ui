/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MessageData, RawMimePart } from 'view/modals/forward-appointment/types';

export type MessagePart = {
	ct: string;
	content: string;
};

/**
 * Recursively looks for a MIME part with the given content type inside the raw
 * Zimbra `mp` tree, returning its content, or an empty string if not found.
 */
const findMimeTextContent = (parts: RawMimePart[] | undefined, ct: string): string => {
	if (!parts) return '';
	const directMatch = parts.find((part) => part.ct === ct && part.content);
	if (directMatch?.content) return directMatch.content;
	return parts.reduce((found, part) => found || findMimeTextContent(part.mp, ct), '');
};

export const buildMessageParts = (messageData: MessageData | null): MessagePart[] => {
	if (!messageData) return [];

	const invite = messageData?.inv?.[0]?.comp?.[0];
	const plainText =
		invite?.desc?.[0]?._content ?? findMimeTextContent(messageData.mp, 'text/plain');
	const htmlContent =
		invite?.descHtml?.[0]?._content ?? findMimeTextContent(messageData.mp, 'text/html');

	const parts: MessagePart[] = [];

	if (plainText) {
		parts.push({
			ct: 'text/plain',
			content: plainText
		});
	}

	if (htmlContent) {
		parts.push({
			ct: 'text/html',
			content: htmlContent
		});
	}

	return parts;
};
