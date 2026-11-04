/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { useTheme } from '@zextras/carbonio-design-system';
import DOMPurify from 'dompurify';

import { ShadowDomWrapper } from './shadow-dom-wrapper';
import { replaceLinkToAnchor } from './utilities';

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
	if (node.tagName === 'A' && node.hasAttribute('target')) {
		node.setAttribute('rel', 'noopener noreferrer');
	}
});

/**
 * Turns plain URLs into anchors and sanitizes the result. The sanitization must be the
 * last step: linkifying works on the serialized string and can alter attribute values,
 * so anything it produces has to be parsed and cleaned again.
 */
export const linkifyAndSanitize = (html: string): string =>
	DOMPurify.sanitize(replaceLinkToAnchor(html), { ADD_ATTR: ['target'] });

export const HtmlMessageRenderer = ({
	htmlContent
}: {
	htmlContent: string;
}): React.JSX.Element => {
	const remFontSize = useTheme().sizes.font?.small ?? '0.875rem';
	const updatedBody = useMemo(() => linkifyAndSanitize(htmlContent), [htmlContent]);
	const styledHtmlContent = useMemo(
		() => `
			<style>
				:host {
					font-family: Roboto, sans-serif;
					font-size: ${remFontSize};
				}
				p{
					margin-top: 0;
				}
			</style>
			<div>${updatedBody}</div>
		`,
		[updatedBody, remFontSize]
	);

	return (
		<ShadowDomWrapper>
			<div dangerouslySetInnerHTML={{ __html: styledHtmlContent }} />
		</ShadowDomWrapper>
	);
};
