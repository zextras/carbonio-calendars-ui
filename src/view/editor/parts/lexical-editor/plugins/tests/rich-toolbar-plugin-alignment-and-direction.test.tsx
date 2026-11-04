/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { waitFor } from '@testing-library/react';
import { $getRoot, $isElementNode, type LexicalEditor } from 'lexical';

import {
	exportedHtml,
	installRangeRectPolyfill,
	setupWithSelectedContent
} from './rich-toolbar-plugin-test-utils';
import { screen } from '@test-setup';

beforeAll(() => {
	installRangeRectPolyfill();
});

function firstBlockIndent(editor: LexicalEditor): number {
	let indent = 0;
	editor.getEditorState().read(() => {
		const firstChild = $getRoot().getFirstChild();
		if ($isElementNode(firstChild)) {
			indent = firstChild.getIndent();
		}
	});
	return indent;
}

describe('RichToolbarPlugin - alignment and direction', () => {
	it('aligns the paragraph left', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await user.click(screen.getByRole('button', { name: 'lexical-label.align_left' }));

		await waitFor(() => {
			expect(exportedHtml(editor)).toContain('text-align: left');
		});
	});

	it('aligns the paragraph center', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await user.click(screen.getByRole('button', { name: 'lexical-label.align_center' }));

		await waitFor(() => {
			expect(exportedHtml(editor)).toContain('text-align: center');
		});
	});

	it('aligns the paragraph right', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await user.click(screen.getByRole('button', { name: 'lexical-label.align_right' }));

		await waitFor(() => {
			expect(exportedHtml(editor)).toContain('text-align: right');
		});
	});

	it('justifies the paragraph', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await user.click(screen.getByRole('button', { name: 'lexical-label.align_justify' }));

		await waitFor(() => {
			expect(exportedHtml(editor)).toContain('text-align: justify');
		});
	});

	it('marks the matching alignment button as active', async () => {
		const { user } = await setupWithSelectedContent();

		const centerButton = screen.getByRole('button', { name: 'lexical-label.align_center' });
		await user.click(centerButton);

		await waitFor(() => {
			expect(centerButton).toHaveAttribute('aria-pressed', 'true');
		});
	});

	it('sets the paragraph direction to right-to-left', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await user.click(screen.getByRole('button', { name: 'lexical-label.rtl' }));

		await waitFor(() => {
			expect(exportedHtml(editor)).toContain('dir="rtl"');
		});
	});

	it('sets the paragraph direction back to left-to-right', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await user.click(screen.getByRole('button', { name: 'lexical-label.rtl' }));
		await waitFor(() => {
			expect(exportedHtml(editor)).toContain('dir="rtl"');
		});

		await user.click(screen.getByRole('button', { name: 'lexical-label.ltr' }));
		await waitFor(() => {
			expect(exportedHtml(editor)).not.toContain('dir="rtl"');
		});
	});

	it('increases the block indent level on the indent control', async () => {
		const { editor, user } = await setupWithSelectedContent();

		expect(firstBlockIndent(editor)).toBe(0);

		await user.click(screen.getByRole('button', { name: 'lexical-label.indent_increase' }));

		await waitFor(() => {
			expect(firstBlockIndent(editor)).toBe(1);
		});
	});

	it('decreases the block indent level on the outdent control', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await user.click(screen.getByRole('button', { name: 'lexical-label.indent_increase' }));
		await waitFor(() => {
			expect(firstBlockIndent(editor)).toBe(1);
		});

		await user.click(screen.getByRole('button', { name: 'lexical-label.indent_decrease' }));
		await waitFor(() => {
			expect(firstBlockIndent(editor)).toBe(0);
		});
	});
});
