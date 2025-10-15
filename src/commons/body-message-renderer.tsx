/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Container, Text, Theme } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { replace } from 'lodash';

import { ROOM_DIVIDER } from '../constants';
import { HtmlMessageRenderer } from './html-message-renderer';
import { replaceLinkToAnchor } from './utilities';
import { InviteDescription } from 'types/store/invite';

export const roomValidationRegEx = new RegExp(`${ROOM_DIVIDER}(.*)${ROOM_DIVIDER}`, 's');

const plainTextToHTML = (str: string): string => {
	if (str !== undefined && str !== null) {
		return str.replace(/(?:\r\n|\r|\n)/g, '<br/>');
	}
	return '';
};

export const extractBody = (body: string): string => {
	if (body) {
		const defaultMessage = roomValidationRegEx.exec(body)?.[0];
		const stripDefaultRoomMessage = defaultMessage ? replace(body, defaultMessage, '') : body;
		return stripDefaultRoomMessage.trim();
	}
	return '';
};

export const extractHtmlBody = (body: string): string => {
	let htmlBody = extractBody(body);
	if (htmlBody.startsWith('</div>')) {
		htmlBody = `<html>${htmlBody.slice(12)}`;
	}

	return htmlBody;
};

const TextMessageRenderer = ({
	text,
	fontSize = 'medium'
}: {
	text: string;
	fontSize?: keyof typeof Theme.sizes.font;
}): React.JSX.Element => {
	const convertedHTML = useMemo(() => replaceLinkToAnchor(plainTextToHTML(text)), [text]);
	return (
		<Text
			dangerouslySetInnerHTML={{
				__html: convertedHTML
			}}
			overflow="break-word"
			size={fontSize}
		/>
	);
};

const EmptyBody = (): React.JSX.Element => (
	<Container padding={{ bottom: 'medium' }}>
		<Text>{`(${t('message.invite_has_no_message', 'This invite has no text message')}.)`}</Text>
	</Container>
);

export const BodyMessageRenderer = ({
	htmlDescription,
	textDescription,
	fontSize
}: {
	htmlDescription: Array<InviteDescription>;
	textDescription: Array<InviteDescription>;
	fontSize?: keyof typeof Theme.sizes.font;
}): React.JSX.Element => {
	const processedHtmlContent = useMemo(() => {
		const htmlContent = htmlDescription?.[0]?._content;
		if (!htmlContent) return null;

		const roomHtmlDesc = roomValidationRegEx?.exec(htmlContent)?.[0];
		const cleanedHtml = roomHtmlDesc ? replace(htmlContent, roomHtmlDesc, '') : htmlContent;
		const extracted = extractHtmlBody(cleanedHtml);
		const trimmed = extracted.trim();

		// Check if HTML is empty or contains only empty tags
		if (!trimmed || trimmed === '"') return null;

		// Check for empty HTML body structures
		const emptyHtmlPattern = /<html[^>]*>\s*<body[^>]*>\s*<\/body>\s*<\/html>/i;
		if (emptyHtmlPattern.test(trimmed)) return null;

		return trimmed;
	}, [htmlDescription]);

	const processedTextContent = useMemo(() => {
		const textContent = textDescription?.[0]?._content;
		if (!textContent) return null;

		const roomTextDesc = roomValidationRegEx?.exec(textContent)?.[0];
		const cleanedText = roomTextDesc ? replace(textContent, roomTextDesc, '') : textContent;
		const extracted = extractBody(cleanedText);
		const trimmed = extracted.trim();

		// Filter out invalid content like single quote or empty strings
		if (!trimmed || trimmed === '"') return null;

		return trimmed;
	}, [textDescription]);

	if (processedHtmlContent) {
		return <HtmlMessageRenderer htmlContent={processedHtmlContent} />;
	}

	if (processedTextContent) {
		return <TextMessageRenderer text={processedTextContent} fontSize={fontSize} />;
	}

	return <EmptyBody />;
};
