/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, waitFor } from '@testing-library/react';
import { $getRoot, $getSelection, $isRangeSelection, type LexicalEditor } from 'lexical';

import {
	createEditorStore,
	renderRichTextEditor,
	richTextOf
} from '../../tests/lexical-editor-test-utils';
import { screen } from '@test-setup';

const EDITOR_TESTID = 'editor-composer';

function setupEditor(): {
	store: ReturnType<typeof createEditorStore>;
	lexicalEditor: LexicalEditor;
} {
	const store = createEditorStore({ richText: '<p><br></p>' });
	renderRichTextEditor(store);
	const editorElement = screen.getByTestId(EDITOR_TESTID) as HTMLElement & {
		__lexicalEditor: LexicalEditor;
	};
	return { store, lexicalEditor: editorElement.__lexicalEditor };
}

/**
 * Lexical's markdown-shortcut heuristic only fires a transform when it sees
 * the anchor offset advance by exactly one character since the previous
 * update, so each character must land in its own flushed update — matching
 * how a real keystroke is committed one at a time.
 */
async function typeChars(editor: LexicalEditor, text: string): Promise<void> {
	await text.split('').reduce(
		(previous, char) =>
			previous.then(() =>
				act(async () => {
					editor.update(() => {
						const selection = $getSelection();
						if ($isRangeSelection(selection)) {
							selection.insertText(char);
						}
					});
					await Promise.resolve();
				})
			),
		Promise.resolve()
	);
}

async function selectStartOfEditor(editor: LexicalEditor): Promise<void> {
	await act(async () => {
		editor.update(() => {
			$getRoot().getFirstChild()?.selectStart();
		});
		await Promise.resolve();
	});
}

describe('ListMarkdownShortcutPlugin', () => {
	it.each([
		['-', '<ul'],
		['*', '<ul'],
		['1.', '<ol']
	])('turns "%s" followed by a space into a list', async (marker, expectedTag) => {
		const { store, lexicalEditor } = setupEditor();

		await selectStartOfEditor(lexicalEditor);
		await typeChars(lexicalEditor, `${marker} item`);

		await waitFor(() => {
			expect(richTextOf(store)).toContain(expectedTag);
		});
	});

	it('does not treat a hyphen typed mid-sentence as a list shortcut', async () => {
		const { store, lexicalEditor } = setupEditor();

		await selectStartOfEditor(lexicalEditor);
		await typeChars(lexicalEditor, 'foo - bar');

		await waitFor(() => {
			expect(richTextOf(store)).not.toContain('<ul');
		});
	});
});
