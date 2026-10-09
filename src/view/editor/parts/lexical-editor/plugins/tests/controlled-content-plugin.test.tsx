/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { $generateHtmlFromNodes } from '@lexical/html';
import { act } from '@testing-library/react';
import {
	$getRoot,
	$getSelection,
	$isElementNode,
	$isRangeSelection,
	$isTextNode,
	type LexicalEditor
} from 'lexical';

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

type CaretInfo = { type: 'text' | 'element'; text: string; offset: number } | null;

function caretOf(editor: LexicalEditor): CaretInfo {
	return editor.getEditorState().read(() => {
		const selection = $getSelection();
		if (!$isRangeSelection(selection)) {
			return null;
		}
		const { anchor } = selection;
		return { type: anchor.type, text: anchor.getNode().getTextContent(), offset: anchor.offset };
	});
}

type ExternalUpdate = {
	initial: string;
	initialText: string;
	placeCaret: () => void;
	next: string;
	nextText: string;
};

/**
 * Renders the editor on `initial`, places the caret with `placeCaret` once
 * the content is loaded, then pushes `next` into the store as an external
 * update (like inserting a public link mid-edit) and returns the editor.
 */
async function updateExternallyWithCaret({
	initial,
	initialText,
	placeCaret,
	next,
	nextText
}: ExternalUpdate): Promise<LexicalEditor> {
	const store = createEditorStore({ richText: initial });
	renderRichTextEditor(store);
	await screen.findByText(initialText);
	const editor = getEditor(screen.getByTestId(EDITOR_TESTID));
	act(() => {
		editor.update(placeCaret, { discrete: true });
	});

	act(() => {
		store.dispatch(editEditorText({ id: defaultEditor.id, richText: next, plainText: '' }));
	});
	await screen.findByText(nextText);
	return editor;
}

function $selectInFirstText(offset: number): void {
	const text = $getRoot().getFirstDescendant();
	if ($isTextNode(text)) {
		text.select(offset, offset);
	}
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

	describe('caret preservation on a live external update', () => {
		it('keeps the caret at the same character offset', async () => {
			const editor = await updateExternallyWithCaret({
				initial: '<p>Hello world</p>',
				initialText: 'Hello world',
				placeCaret: () => $selectInFirstText(5),
				next: '<p>Hello world, again</p>',
				nextText: 'Hello world, again'
			});

			expect(caretOf(editor)).toEqual({ type: 'text', text: 'Hello world, again', offset: 5 });
		});

		it('moves the caret to the end when the new content is shorter than its offset', async () => {
			const editor = await updateExternallyWithCaret({
				initial: '<p>Hello world</p>',
				initialText: 'Hello world',
				placeCaret: () => $selectInFirstText(11),
				next: '<p>Hi</p>',
				nextText: 'Hi'
			});

			expect(caretOf(editor)).toEqual({ type: 'text', text: 'Hi', offset: 2 });
		});

		it('places the caret in a leading empty paragraph instead of skipping to the next text', async () => {
			const editor = await updateExternallyWithCaret({
				initial: '<p>x</p>',
				initialText: 'x',
				placeCaret: () => $selectInFirstText(0),
				next: '<p><br></p><p>next</p>',
				nextText: 'next'
			});

			expect(caretOf(editor)).toEqual({ type: 'element', text: '', offset: 0 });
		});

		it('restores a caret anchored after an inline image, skipping over non-text nodes', async () => {
			const image = '<img src="https://example.com/i.png" alt="i" />';
			const editor = await updateExternallyWithCaret({
				initial: `<p>a${image}</p>`,
				initialText: 'a',
				// An element-anchored caret right after the image (offset 1 in characters).
				placeCaret: () => {
					const paragraph = $getRoot().getFirstChild();
					if ($isElementNode(paragraph)) {
						paragraph.select(2, 2);
					}
				},
				next: `<p>${image}bc</p>`,
				nextText: 'bc'
			});

			expect(caretOf(editor)).toEqual({ type: 'text', text: 'bc', offset: 1 });
		});
	});
});
