/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react';

import { Container, Text, Theme, useTheme } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { isNull, replace } from 'lodash';

import { ROOM_DIVIDER } from '../constants';
import type { Invite, Parts } from '../types/store/invite';

export const roomValidationRegEx = new RegExp(`${ROOM_DIVIDER}(.*)${ROOM_DIVIDER}`, 's');

const replaceLinkToAnchor = (content: string): string => {
	if (content === '' || content === undefined) {
		return '';
	}

	return content.replace(
		/(?:https?:\/\/|www\.)+(?![^\s]*?")([\w.,@?!^=%&amp;:()/~+#-]*[\w@?!^=%&amp;()/~+#-])?/gi,
		(url) => {
			const wrap = document.createElement('div');
			const anchor = document.createElement('a');
			let href = url.replace(/&amp;/g, '&');
			if (!url.startsWith('http') && !url.startsWith('https')) {
				href = `http://${url}`;
			}
			anchor.href = href.replace(/&#64;/g, '@').replace(/&#61;/g, '=');
			anchor.target = '_blank';
			anchor.innerHTML = url;

			wrap.appendChild(anchor);
			return wrap.innerHTML.trim();
		}
	);
};

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

const HtmlMessageRenderer = ({
	msgId,
	body,
	parts,
	fontSize = 'small'
}: {
	msgId: string;
	body: string;
	parts: Parts;
	fontSize?: keyof typeof Theme.sizes.font;
}): React.JSX.Element => {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const divRef = useRef<HTMLDivElement>(null);

	const remFontSize = useTheme().sizes.font?.[fontSize] ?? '0.875rem';

	const convertInRem = useCallback((px: number) => `${(1 / 16) * px}rem`, []);

	const calculateHeight = useCallback(() => {
		if (isNull(iframeRef?.current) || isNull(iframeRef.current.contentDocument)) {
			return;
		}

		const scrollHeight = iframeRef.current.contentDocument.querySelector('html')?.scrollHeight;
		iframeRef.current.style.height = '0';
		iframeRef.current.style.height = convertInRem(scrollHeight ?? 0);
	}, [convertInRem]);

	const updatedBody = useMemo(() => replaceLinkToAnchor(body), [body]);

	useLayoutEffect(() => {
		if (!isNull(iframeRef.current) && !isNull(iframeRef.current.contentDocument)) {
			iframeRef.current.contentDocument.open();
			iframeRef.current.contentDocument.write(`<div>${updatedBody}</div>`);
			iframeRef.current.contentDocument.close();
		}
		const styleTag = document.createElement('style');
		styleTag.textContent = `
			body {
				max-width: 100% !important;
				margin: 0;
				overflow-y: hidden;
				font-family: Roboto, sans-serif;
				font-size: ${remFontSize};
				background-color: #ffffff;
			}
			body pre, body pre * {
				white-space: pre-wrap;
				word-wrap: anywhere !important;
				text-wrap: suppress !important;
			}
			img {
				max-width: 100%
			}
			tbody{position:relative !important}
			td{
				max-width: 100% !important;
				overflow-wrap: anywhere !important;
			}
			#bodyTable {
				height: fit-content
			}
		`;
		if (!isNull(iframeRef.current) && !isNull(iframeRef.current.contentDocument))
			iframeRef.current.contentDocument.head.append(styleTag);

		calculateHeight();

		const resizeObserver = new ResizeObserver(calculateHeight);
		divRef.current && resizeObserver.observe(divRef.current);

		return () => resizeObserver.disconnect();
	}, [calculateHeight, msgId, parts, remFontSize, updatedBody]);

	return (
		<div ref={divRef} className="force-white-bg" style={{ width: '100%' }}>
			<iframe
				title={msgId}
				ref={iframeRef}
				onLoad={calculateHeight}
				style={{ border: 'none', width: '100%', height: '0' }}
			/>
		</div>
	);
};

const EmptyBody = (): React.JSX.Element => (
	<Container padding={{ bottom: 'medium' }}>
		<Text>{`(${t('message.invite_has_no_message', 'This invite has no text message')}.)`}</Text>
	</Container>
);

const BodyMessageRenderer = ({
	fullInvite,
	inviteId,
	parts,
	fontSize
}: {
	fullInvite: Invite;
	inviteId: string;
	parts: Parts;
	fontSize?: keyof typeof Theme.sizes.font;
}): React.JSX.Element | null => {
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
		return (
			<HtmlMessageRenderer
				msgId={inviteId}
				body={extractHtmlBody(htmlContent)}
				parts={parts}
				fontSize={fontSize}
			/>
		);
	}
	const originalText = fullInvite?.textDescription?.[0]?._content ?? '';
	const roomTextDesc = roomValidationRegEx?.exec(originalText)?.[0];
	const textContent = roomTextDesc ? replace(originalText, roomTextDesc, '') : originalText;
	return <TextMessageRenderer text={extractBody(textContent)} fontSize={fontSize} />;
};

export default BodyMessageRenderer;
