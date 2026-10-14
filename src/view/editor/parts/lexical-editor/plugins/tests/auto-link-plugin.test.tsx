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

/**
 * AutoLinkPlugin's matcher re-evaluates on each text-content change, so (unlike
 * the markdown-shortcut heuristic) it doesn't strictly require one character
 * per update — but committing one character per update still mirrors a real
 * keystroke most faithfully, and `{Enter}` is committed as a dedicated
 * paragraph-split update.
 */
async function typeText(editor: LexicalEditor, text: string): Promise<void> {
	const tokens = text.split(/(\{Enter\})/).filter((token) => token.length > 0);
	// eslint-disable-next-line no-restricted-syntax
	for (const token of tokens) {
		if (token === '{Enter}') {
			// eslint-disable-next-line no-await-in-loop
			await act(async () => {
				editor.update(() => {
					const selection = $getSelection();
					if ($isRangeSelection(selection)) {
						selection.insertParagraph();
					}
				});
				await Promise.resolve();
			});
			// eslint-disable-next-line no-continue
			continue;
		}
		// eslint-disable-next-line no-await-in-loop
		await token.split('').reduce(
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
