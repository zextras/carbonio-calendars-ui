/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import DOMPurify from 'dompurify';

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
	'src',
	'alt',
	'width',
	'height',
	'style',
	'align',
	'color',
	'face',
	'colspan',
	'rowspan'
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
	DOMPurify.sanitize(html, {
		ALLOWED_TAGS,
		ALLOWED_ATTR,
		ALLOW_DATA_ATTR: false
	});
