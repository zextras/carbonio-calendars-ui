/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import DOMPurify from 'dompurify';

import { UNLINKED_AUTO_LINK_CLASS } from './unlinked-auto-link-html';

/**
 * A dedicated instance, so the hook below doesn't affect other DOMPurify users.
 * `class` is kept only for the marker of a removed auto-link (see
 * `unlinked-auto-link-html.ts`); every other class value is dropped.
 */
const purifier = DOMPurify(window);
purifier.addHook('uponSanitizeAttribute', (_node, data) => {
	if (data.attrName !== 'class') {
		return;
	}
	if (data.attrValue.split(/\s+/).includes(UNLINKED_AUTO_LINK_CLASS)) {
		// eslint-disable-next-line no-param-reassign -- DOMPurify hooks rewrite the attribute through `data`
		data.attrValue = UNLINKED_AUTO_LINK_CLASS;
	} else {
		// eslint-disable-next-line no-param-reassign -- see above
		data.keepAttr = false;
	}
});

const ALLOWED_TAGS = [
	'p',
	'div',
	'pre',
	'br',
	'span',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'blockquote',
	'b',
	'strong',
	'i',
	'em',
	'u',
	's',
	'strike',
	'sub',
	'sup',
	'mark',
	'code',
	'font',
	'ul',
	'ol',
	'li',
	'a',
	'img',
	'table',
	'thead',
	'tbody',
	'tr',
	'th',
	'td'
];

const ALLOWED_ATTR = [
	'href',
	'target',
	'rel',
	'title',
	'src',
	'alt',
	'width',
	'height',
	'style',
	'align',
	'color',
	'face',
	'colspan',
	'rowspan',
	'class'
];

/**
 * Sanitizes HTML before it is parsed into Lexical nodes. Invite descriptions
 * can originate from other organizations' calendar clients, so this is run on
 * every string that reaches the editor's DOM parser, regardless of which
 * code path produced it (normalized invite load, a public-link insertion,
 * etc.) — sanitizing closer to the producers would miss any path that
 * bypasses them.
 */
export const sanitizeEditorHtml = (html: string): string =>
	purifier.sanitize(html, {
		ALLOWED_TAGS,
		ALLOWED_ATTR,
		ALLOW_DATA_ATTR: false
	});
