/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { $generateHtmlFromNodes } from '@lexical/html';
import { act } from '@testing-library/react';
import { type LexicalEditor } from 'lexical';

import {
	createEditorStore,
	plainTextOf,
	renderRichTextEditor,
	richTextOf
} from '../../tests/lexical-editor-test-utils';
import { screen } from '@test-setup';
import { editEditorText } from 'store/slices/editor-slice';
import { defaultEditor } from 'view/editor/tests/common';

const EDITOR_TESTID = 'editor-composer';

function getEditor(element: HTMLElement): LexicalEditor {
	return (element as unknown as { __lexicalEditor: LexicalEditor }).__lexicalEditor;
}

function exportedHtml(editor: LexicalEditor): string {
	let html = '';
	editor.read(() => {
		html = $generateHtmlFromNodes(editor, null);
	});
	return html;
}

describe('ControlledContentPlugin', () => {
	describe('down sync (store -> editor)', () => {
		it('renders the initial richText from the store on mount', async () => {
			const store = createEditorStore({ richText: '<p>Hello world</p>' });
			renderRichTextEditor(store);
			await screen.findByText('Hello world');
		});

		it('reflects a live external update to richText while the editor is mounted', async () => {
			const store = createEditorStore({ richText: '<p>Original</p>' });
			renderRichTextEditor(store);
			await screen.findByText('Original');

			store.dispatch(
				editEditorText({
					id: defaultEditor.id,
					richText: '<p>https://example.com/link</p><p>Original</p>',
					plainText: 'https://example.com/link\nOriginal'
				})
			);

			await screen.findByText('https://example.com/link');
			expect(screen.getByText('Original')).toBeInTheDocument();
		});

		it('does not steal DOM focus from a sibling field on a live external update', async () => {
			const store = createEditorStore({ richText: '<p>Original</p>' });
			renderRichTextEditor(store);
			await screen.findByText('Original');

			const outsideInput = document.createElement('input');
			document.body.appendChild(outsideInput);
			outsideInput.focus();
			expect(outsideInput).toHaveFocus();

			store.dispatch(
				editEditorText({
					id: defaultEditor.id,
					richText: '<p>Updated from outside</p>',
					plainText: 'Updated from outside'
				})
			);
			await screen.findByText('Updated from outside');

			expect(outsideInput).toHaveFocus();
			outsideInput.remove();
		});
	});

	describe('up sync (editor -> store)', () => {
		it('dispatches editEditorText with the generated HTML after the debounce window', async () => {
			const store = createEditorStore({ richText: '<p>Hello</p>' });
			const { user } = renderRichTextEditor(store);
			const editorElement = await screen.findByText('Hello');

			await user.click(editorElement);
			await user.type(editorElement, ' world');

			act(() => {
				vi.advanceTimersByTime(500);
			});

			expect(richTextOf(store)).toContain('Hello world');
			expect(plainTextOf(store)).toContain('Hello world');
		});

		it('does not let its own echoed write re-trigger the down sync and clobber the just-typed content', async () => {
			const store = createEditorStore({ richText: '<p>Hello</p>' });
			const { user } = renderRichTextEditor(store);
			const editorElement = await screen.findByText('Hello');

			await user.click(editorElement);
			await user.type(editorElement, '!');
			act(() => {
				vi.advanceTimersByTime(500);
			});

			const editor = getEditor(screen.getByTestId(EDITOR_TESTID));
			expect(exportedHtml(editor)).toContain('Hello!');
			expect(richTextOf(store)).toContain('Hello!');
		});
	});
});
