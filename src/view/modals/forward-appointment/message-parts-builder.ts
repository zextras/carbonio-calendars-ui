/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type MessagePart = {
	ct: string;
	content: string;
};

// Define types based on the structure accessed in buildMessageParts
interface MessageDesc {
    _content?: string;
}

interface MessageComp {
    desc?: MessageDesc[];
    descHtml?: MessageDesc[];
}

interface MessageInv {
    comp?: MessageComp[];
}

export interface MessageData {
    inv?: MessageInv[];
}
export const buildMessageParts = (messageData: MessageData | null): MessagePart[] => {
	if (!messageData) return [];

	const invite = messageData?.inv?.[0]?.comp?.[0];
	const plainText = invite?.desc?.[0]?._content ?? '';
	const htmlContent = invite?.descHtml?.[0]?._content ?? '';

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
