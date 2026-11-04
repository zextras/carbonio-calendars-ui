/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, waitFor } from '@testing-library/react';
import {
	$getRoot,
	$getSelection,
	$isRangeSelection,
	type LexicalEditor,
	type RangeSelection
} from 'lexical';

import {
	createEditorStore,
	renderRichTextEditor,
	richTextOf
} from '../../tests/lexical-editor-test-utils';
import { screen } from '@test-setup';

const EDITOR_TESTID = 'editor-composer';
const ZEXTRAS_URL = 'https://www.zextras.com';

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

async function selectStartOfEditor(editor: LexicalEditor): Promise<void> {
	await act(async () => {
		editor.update(() => {
			$getRoot().getFirstChild()?.selectStart();
		});
		await Promise.resolve();
	});
}

async function commit(
	editor: LexicalEditor,
	apply: (selection: RangeSelection) => void
): Promise<void> {
	await act(async () => {
		editor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				apply(selection);
			}
		});
		await Promise.resolve();
	});
}

async function typeText(editor: LexicalEditor, text: string): Promise<void> {
	const [, candidate, separator] = /^(.*?)(\s|\{Enter\})?$/.exec(text) ?? [];
	await commit(editor, (selection) => selection.insertText(candidate));
	if (separator === '{Enter}') {
		await commit(editor, (selection) => selection.insertParagraph());
	} else if (separator) {
		await commit(editor, (selection) => selection.insertText(separator));
	}
}

describe('AutoLinkPlugin', () => {
	it.each([
		['a typed URL, once a space is typed after it', `${ZEXTRAS_URL} `, ZEXTRAS_URL],
		['a typed URL, once a new line is created after it', `${ZEXTRAS_URL}{Enter}`, ZEXTRAS_URL],
		['a scheme-less www. URL, prefixing it with https://', 'www.zextras.com ', ZEXTRAS_URL]
	])('turns %s into a link with href %s', async (_case, typed, expectedHref) => {
		const { store, lexicalEditor } = setupEditor();

		await selectStartOfEditor(lexicalEditor);
		await typeText(lexicalEditor, typed);

		await waitFor(() => {
			expect(richTextOf(store)).toContain(`href="${expectedHref}"`);
		});
	});

	it.each([
		['a single-label domain', 'someone@zextras.com'],
		['a hyphenated domain', 'someone@my-domain.com'],
		['a multi-label domain', 'someone@domain.domain.fr'],
		['a deeply nested multi-label domain', 'someone@mail.sub.domain.co.uk']
	])('turns a typed email address with %s into a mailto link', async (_case, email) => {
		const { store, lexicalEditor } = setupEditor();

		await selectStartOfEditor(lexicalEditor);
		await typeText(lexicalEditor, `${email} `);

		await waitFor(() => {
			expect(richTextOf(store)).toContain(`href="mailto:${email}"`);
		});
		// The whole address, including the last domain label, is inside the link.
		const doc = new DOMParser().parseFromString(richTextOf(store), 'text/html');
		// eslint-disable-next-line testing-library/no-node-access -- parsing the exported HTML string, not the rendered DOM
		expect(doc.querySelector('a')?.textContent).toBe(email);
	});
});
