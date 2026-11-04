/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $nodesOfType, createEditor, TextNode } from 'lexical';

import { STYLE_PRESERVING_HTML_IMPORT } from '../html-import-style';

function stylesFromHtml(html: string): string[] {
	const editor = createEditor({
		namespace: 'html-import-style-test',
		onError: (error) => {
			throw error;
		},
		html: { import: STYLE_PRESERVING_HTML_IMPORT }
	});

	editor.update(
		() => {
			const dom = new DOMParser().parseFromString(html, 'text/html');
			const nodes = $generateNodesFromDOM(editor, dom);
			$getRoot().append(...nodes);
		},
		{ discrete: true }
	);

	let styles: string[] = [];
	editor.read(() => {
		styles = $nodesOfType(TextNode).map((node) => node.getStyle());
	});
	return styles;
}

describe('STYLE_PRESERVING_HTML_IMPORT', () => {
	it('preserves color on <em> text, which the built-in importer would drop', () => {
		const styles = stylesFromHtml('<p><em style="color: rgb(255, 0, 0)">red</em></p>');
		expect(styles.some((style) => style.includes('color: rgb(255, 0, 0)'))).toBe(true);
	});

	it('preserves color and font-family together on <span> text', () => {
		const styles = stylesFromHtml(
			'<p><span style="color: blue; font-family: Arial">blue arial</span></p>'
		);
		expect(
			styles.some((style) => style.includes('color: blue') && style.includes('font-family: Arial'))
		).toBe(true);
	});

	it('preserves font-size on <strong> text', () => {
		const styles = stylesFromHtml('<p><strong style="font-size: 18pt">big bold</strong></p>');
		expect(styles.some((style) => style.includes('font-size: 18pt'))).toBe(true);
	});

	it('converts legacy <font color face> attributes into a preserved inline style', () => {
		const styles = stylesFromHtml('<p><font color="#ff0000" face="Arial">legacy</font></p>');
		expect(
			styles.some(
				(style) => style.includes('color: #ff0000') && style.includes('font-family: Arial')
			)
		).toBe(true);
	});

	it('leaves text with no inline style untouched', () => {
		const styles = stylesFromHtml('<p><em>plain italic</em></p>');
		expect(styles.every((style) => style === '')).toBe(true);
	});
});
