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
import type { Invite } from '../types/store/invite';

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

type BodyMessageRendererProps = {
	fullInvite: Invite;
	fontSize?: keyof typeof Theme.sizes.font;
};

export const BodyMessageRenderer = ({
	fullInvite,
	fontSize
}: BodyMessageRendererProps): React.JSX.Element | null => {
	if (!fullInvite) {
		return null;
	}

	if (fullInvite.fragment === undefined || fullInvite.fragment === '') {
		return <EmptyBody />;
	}

	if (fullInvite?.htmlDescription?.[0]?._content) {
		const originalHtml = fullInvite?.htmlDescription?.[0]?._content ?? '';
		const roomHtmlDesc = roomValidationRegEx?.exec(originalHtml)?.[0];
		const htmlContent = roomHtmlDesc ? replace(originalHtml, roomHtmlDesc, '') : originalHtml;
		return <HtmlMessageRenderer htmlContent={extractHtmlBody(htmlContent)} />;
	}
	const originalText = fullInvite?.textDescription?.[0]?._content ?? '';
	const roomTextDesc = roomValidationRegEx?.exec(originalText)?.[0];
	const textContent = roomTextDesc ? replace(originalText, roomTextDesc, '') : originalText;
	return <TextMessageRenderer text={extractBody(textContent)} fontSize={fontSize} />;
};
