/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { $isAutoLinkNode, type AutoLinkNode } from '@lexical/link';
import { $dfs } from '@lexical/utils';
import { act, waitFor } from '@testing-library/react';
import {
	$getRoot,
	$getSelection,
	$isRangeSelection,
	type LexicalEditor,
	type RangeSelection
} from 'lexical';

import { installRangeRectPolyfill } from './rich-toolbar-plugin-test-utils';
import {
	createEditorStore,
	renderRichTextEditor,
	richTextOf
} from '../../tests/lexical-editor-test-utils';
import { screen, within } from '@test-setup';

const EDITOR_TESTID = 'editor-composer';
const ZEXTRAS_URL = 'https://www.zextras.com';
const LINK_URL = 'https://custom-link.com';
const LINK_EMAIL = 'someone@custom-link.com';
const OTHER_URL = 'https://other-link.com';
const REMOVE_LINK_LABEL = 'lexical-label.remove_link';
const BOLD_LABEL = 'lexical-label.bold';
const UNLINKED_AUTO_LINK_CLASS = 'cal-unlinked-auto-link';

type Store = ReturnType<typeof createEditorStore>;
type TestUser = ReturnType<typeof renderRichTextEditor>['user'];

function setupEditor(richText = '<p><br></p>'): {
	store: Store;
	user: TestUser;
	unmount: () => void;
	editorElement: HTMLElement;
	lexicalEditor: LexicalEditor;
} {
	const store = createEditorStore({ richText });
	const { user, unmount } = renderRichTextEditor(store);
	const editorElement = screen.getByTestId(EDITOR_TESTID) as HTMLElement & {
		__lexicalEditor: LexicalEditor;
	};
	return { store, user, unmount, editorElement, lexicalEditor: editorElement.__lexicalEditor };
}

/** Removes the auto-detected link with the given text from its floating card. */
async function removeAutoLink(
	user: TestUser,
	editorElement: HTMLElement,
	text: string
): Promise<void> {
	await user.click(await within(editorElement).findByRole('link', { name: text }));
	await user.click(await screen.findByRole('button', { name: REMOVE_LINK_LABEL }));
	await waitFor(() => {
		expect(within(editorElement).queryByRole('link')).not.toBeInTheDocument();
	});
}

/**
 * Types `text` with the caret at the start or at the end of the removed link, through
 * the same selection insertion the editor runs for typed text (jsdom cannot place the
 * caret there with the pointer).
 */
function typeNextToRemovedLink(editor: LexicalEditor, edge: 'start' | 'end', text: string): void {
	act(() => {
		editor.update(
			() => {
				const removedLink = $dfs()
					.map(({ node }) => node)
					.find((node): node is AutoLinkNode => $isAutoLinkNode(node) && node.getIsUnlinked());
				if (edge === 'start') {
					removedLink?.selectStart();
				} else {
					removedLink?.selectEnd();
				}
				$getSelection()?.insertText(text);
			},
			{ discrete: true }
		);
	});
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
	beforeAll(() => {
		// Clicking a link puts the caret in it, and Lexical then measures a `Range`.
		installRangeRectPolyfill();
	});

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

	it('opens a typed link in a new window, without giving the opened page access to the editor', async () => {
		const { store, lexicalEditor } = setupEditor();

		await selectStartOfEditor(lexicalEditor);
		await typeText(lexicalEditor, `${ZEXTRAS_URL} `);

		await waitFor(() => {
			expect(richTextOf(store)).toContain(`href="${ZEXTRAS_URL}"`);
		});
		const doc = new DOMParser().parseFromString(richTextOf(store), 'text/html');
		// eslint-disable-next-line testing-library/no-node-access -- parsing the exported HTML string, not the rendered DOM
		const link = doc.querySelector('a');
		expect(link?.getAttribute('target')).toBe('_blank');
		expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
	});

	describe('a removed auto-detected link', () => {
		it.each([
			['a path typed right after a URL', LINK_URL, 'end', '/docs', `${LINK_URL}/docs`],
			['a letter typed right after an email address', LINK_EMAIL, 'end', 'x', `${LINK_EMAIL}x`],
			['a letter typed right before an email address', LINK_EMAIL, 'start', 'x', `x${LINK_EMAIL}`]
		] as const)(
			'stays plain text with %s, also once the saved HTML is loaded again',
			async (_case, linkText, edge, typed, expectedText) => {
				const { store, user, unmount, editorElement, lexicalEditor } = setupEditor(
					`<p>See ${linkText}</p>`
				);
				await removeAutoLink(user, editorElement, linkText);

				typeNextToRemovedLink(lexicalEditor, edge, typed);

				await waitFor(() => {
					expect(richTextOf(store)).toContain(expectedText);
				});
				expect(within(editorElement).queryByRole('link')).not.toBeInTheDocument();
				const savedHtml = richTextOf(store);
				unmount();

				const { editorElement: reloadedEditor } = setupEditor(savedHtml);
				expect(await within(reloadedEditor).findByText(expectedText)).toBeVisible();
				expect(within(reloadedEditor).queryByRole('link')).not.toBeInTheDocument();
			}
		);

		it('stays plain text when the text typed right after it is formatted', async () => {
			const { user, editorElement, lexicalEditor } = setupEditor(`<p>See ${LINK_URL}</p>`);
			await removeAutoLink(user, editorElement, LINK_URL);
			typeNextToRemovedLink(lexicalEditor, 'end', '/docs');

			await user.click(editorElement);
			await user.keyboard('{Control>}a{/Control}');
			await user.click(screen.getByRole('button', { name: BOLD_LABEL }));

			expect(await within(editorElement).findByText(`${LINK_URL}/docs`)).toHaveClass(
				'cal-lexical-bold'
			);
			expect(within(editorElement).queryByRole('link')).not.toBeInTheDocument();
		});

		it.each([
			['text glued after it', `<span class="${UNLINKED_AUTO_LINK_CLASS}">${LINK_URL}</span>/docs`],
			[
				'text in two formats glued after it',
				`<span class="${UNLINKED_AUTO_LINK_CLASS}">${LINK_URL}</span>/do<b>cs</b>`
			],
			[
				'an email address glued after it',
				`<span class="${UNLINKED_AUTO_LINK_CLASS}">${LINK_URL}</span>b@custom-link.com`
			],
			[
				'text glued after a removed email',
				`<span class="${UNLINKED_AUTO_LINK_CLASS}">${LINK_EMAIL}</span>x`
			],
			[
				'another removed link glued after it',
				`<span class="${UNLINKED_AUTO_LINK_CLASS}">${LINK_URL}</span><span class="${UNLINKED_AUTO_LINK_CLASS}">${LINK_EMAIL}</span>`
			],
			[
				'text glued before a removed email',
				`x<span class="${UNLINKED_AUTO_LINK_CLASS}">${LINK_EMAIL}</span>`
			],
			[
				'text glued before a removed email, after other text',
				`See x<span class="${UNLINKED_AUTO_LINK_CLASS}">${LINK_EMAIL}</span>`
			],
			[
				'text in two formats glued before a removed email',
				`<b>a</b>x<span class="${UNLINKED_AUTO_LINK_CLASS}">${LINK_EMAIL}</span>`
			],
			[
				'text glued before a removed URL that completes it',
				`https://<span class="${UNLINKED_AUTO_LINK_CLASS}">www.zextras.com</span>`
			],
			[
				'text glued before and after a removed email',
				`x<span class="${UNLINKED_AUTO_LINK_CLASS}">${LINK_EMAIL}</span>y`
			]
		])('stays plain text when it is loaded from HTML with %s', async (_case, html) => {
			const { editorElement } = setupEditor(`<p>${html} and ${OTHER_URL}</p>`);

			// The URL after a space was never removed: it is still auto-linked.
			const otherLink = await within(editorElement).findByRole('link', { name: OTHER_URL });
			expect(within(editorElement).getAllByRole('link')).toEqual([otherLink]);
		});
	});
});
