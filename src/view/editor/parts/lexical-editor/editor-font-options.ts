/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Font sizes offered by the toolbar's size select, ported from the
 * `font_size_formats` TinyMCE config this editor replaces
 * (`@zextras/carbonio-ui-text-composer`'s `"8pt 9pt 10pt 11pt 12pt 13pt 14pt
 * 16pt 18pt 24pt 30pt 36pt 48pt 60pt 72pt 96pt"`), so the available sizes stay
 * the same across the TinyMCE -> Lexical migration.
 */
export const getFontSizesOptions = (): string[] =>
	'8pt 9pt 10pt 11pt 12pt 13pt 14pt 16pt 18pt 24pt 30pt 36pt 48pt 60pt 72pt 96pt'.split(' ');

/**
 * Font families offered by the toolbar's font select: the same stock list the
 * TinyMCE config this editor replaces used.
 */
export const getFonts = (): { label: string; value: string }[] => [
	{
		label: 'Andale Mono',
		value: 'andale mono, times'
	},
	{
		label: 'Arial',
		value: 'arial, helvetica, sans-serif'
	},
	{
		label: 'Arial Black',
		value: 'arial black, avant garde'
	},
	{
		label: 'Book Antiqua',
		value: 'book antiqua, palatino'
	},
	{
		label: 'Comic Sans MS',
		value: 'comic sans ms, sans-serif'
	},
	{
		label: 'Courier New',
		value: 'courier new, courier'
	},
	{
		label: 'Georgia',
		value: 'georgia, palatino'
	},
	{
		label: 'Helvetica',
		value: 'helvetica'
	},
	{
		label: 'Impact',
		value: 'impact, chicago'
	},
	{
		label: 'Symbol',
		value: 'symbol'
	},
	{
		label: 'Tahoma',
		value: 'tahoma, arial, helvetica, sans-serif'
	},
	{
		label: 'Terminal',
		value: 'terminal, monaco'
	},
	{
		label: 'Times New Roman',
		value: 'times new roman, times'
	},
	{
		label: 'Trebuchet MS',
		value: 'trebuchet ms, geneva'
	},
	{
		label: 'Verdana',
		value: 'verdana, geneva'
	},
	{
		label: 'Webdings',
		value: 'webdings'
	},
	{
		label: 'Wingdings',
		value: 'wingdings, zapf dingbats'
	}
];
