/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { $isLinkNode } from '@lexical/link';
import { $dfs } from '@lexical/utils';
import { act, waitFor } from '@testing-library/react';
import { $createTextNode, $getRoot, $isElementNode, type LexicalEditor } from 'lexical';

import {
	createEditorStore,
	renderRichTextEditor,
	richTextOf
} from '../../tests/lexical-editor-test-utils';
import { screen, within } from '@test-setup';
import { Editor } from 'types/editor';
import { defaultEditor } from 'view/editor/tests/common';

const LINK_URL = 'https://custom-link.com';
const LINK_TEXT = 'lexical';
const LINK_EMAIL = 'someone@custom-link.com';
const EDITOR_TESTID = 'editor-composer';
const EDIT_LINK_LABEL = 'lexical-label.edit_link';
const REMOVE_LINK_LABEL = 'lexical-label.remove_link';
const RESTORE_LINK_LABEL = 'lexical-label.restore_link';
const INSERT_LINK_LABEL = 'lexical-label.insert_link';
const URL_LABEL = 'lexical-label.url';
const TEXT_TO_DISPLAY_LABEL = 'lexical-label.text_to_display';
const SAVE_LABEL = 'label.save';
const NEW_LINK_TEXT = 'test';
const UNLINKED_AUTO_LINK_CLASS = 'cal-unlinked-auto-link';
// Built at runtime so the source holds no script URL literal.
const SCRIPT_URL = ['javascript', 'void(0)//'].join(':');
const UNSAFE_URL_REPLACEMENT = 'about:blank';
// Attributes the saved HTML can do without: the import relies only on these three.
const ATTRIBUTES_OTHER_THAN_CLASS_STYLE_HREF = /\s(?!(?:class|style|href)=)[\w-]+="[^"]*"/g;

type TestUser = ReturnType<typeof renderRichTextEditor>['user'];
type Store = ReturnType<typeof createEditorStore>;

function lexicalEditorOf(editorElement: HTMLElement): LexicalEditor {
	return (editorElement as HTMLElement & { __lexicalEditor: LexicalEditor }).__lexicalEditor;
}

type EditorSetup = {
	store: Store;
	user: TestUser;
	editorElement: HTMLElement;
	unmount: () => void;
};

/** Renders the editor on the given HTML and returns it with its element. */
function setupEditor(richText: string): EditorSetup {
	const store = createEditorStore({ richText });
	const { user, unmount } = renderRichTextEditor(store);
	return { store, user, editorElement: screen.getByTestId(EDITOR_TESTID), unmount };
}

/** Parses the exported rich text and returns its links as href/text pairs. */
function linksOf(store: Store): Array<{ href: string | null; text: string | null }> {
	const doc = new DOMParser().parseFromString(richTextOf(store), 'text/html');
	// eslint-disable-next-line testing-library/no-node-access -- parsing the exported HTML string, not the rendered DOM
	return Array.from(doc.querySelectorAll('a')).map((anchor) => ({
		href: anchor.getAttribute('href'),
		text: anchor.textContent
	}));
}

/** Appends text to the last paragraph, so the content is exported to the store again. */
function appendText(editorElement: HTMLElement, text: string): void {
	const editor = lexicalEditorOf(editorElement);
	act(() => {
		editor.update(() => {
			const last = $getRoot().getLastChild();
			if ($isElementNode(last)) {
				last.append($createTextNode(text));
			}
		});
	});
}

/** Opens the edit modal from the floating card, replaces the text to display and saves. */
async function editLinkText(user: TestUser, link: HTMLElement, text: string): Promise<void> {
	await user.click(link);
	await user.click(await screen.findByRole('button', { name: EDIT_LINK_LABEL }));
	const textInput = await screen.findByRole('textbox', { name: TEXT_TO_DISPLAY_LABEL });
	await user.clear(textInput);
	await user.type(textInput, text);
	await user.click(screen.getByRole('button', { name: SAVE_LABEL }));
}

/** Renders the editor on a paragraph whose text is auto-detected as a link, and removes the link. */
async function setupWithRemovedAutoLink(innerHtml: string, text: string): Promise<EditorSetup> {
	const setup = setupEditor(`<p>${innerHtml}</p>`);
	const { store, user, editorElement } = setup;
	await user.click(await within(editorElement).findByRole('link', { name: text }));
	await user.click(await screen.findByRole('button', { name: REMOVE_LINK_LABEL }));
	// The store is written after a debounce: wait for the removal itself to land
	// (the initial HTML has no `<a>` either, the link is created by the plugin).
	await waitFor(() => {
		expect(richTextOf(store)).toContain(UNLINKED_AUTO_LINK_CLASS);
	});
	return setup;
}

/** Renders the editor on the given content and returns the rendered link element. */
async function setupWithLink(
	richText = `<p>before <a href="${LINK_URL}">${LINK_TEXT}</a></p>`,
	overrides: Partial<Editor> = {}
): Promise<{
	store: ReturnType<typeof createEditorStore>;
	user: TestUser;
	link: HTMLElement;
}> {
	const store = createEditorStore({ richText, ...overrides });
	const { user } = renderRichTextEditor(store);
	const editorElement = screen.getByTestId(EDITOR_TESTID);
	const link = await within(editorElement).findByText(LINK_TEXT);
	return { store, user, link };
}

describe('FloatingLinkEditorPlugin', () => {
	it('does not show the floating editor until the link is hovered or pressed', async () => {
		const { user } = await setupWithLink();
		const editorElement = screen.getByTestId(EDITOR_TESTID);

		// Selecting the content (without touching the link) must not reveal the card.
		await user.click(editorElement);
		await user.keyboard('{Control>}a{/Control}');

		expect(screen.queryByRole('button', { name: EDIT_LINK_LABEL })).not.toBeInTheDocument();
	});

	it('shows the floating editor with the URL when the link is hovered', async () => {
		const { user, link } = await setupWithLink();

		await user.hover(link);

		expect(await screen.findByRole('link', { name: LINK_URL })).toHaveAttribute('href', LINK_URL);
		expect(screen.getByRole('button', { name: EDIT_LINK_LABEL })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: REMOVE_LINK_LABEL })).toBeInTheDocument();
	});

	it('keeps the card visible for a grace period after the pointer leaves the link', async () => {
		const { user, link } = await setupWithLink();

		await user.hover(link);
		await screen.findByRole('button', { name: EDIT_LINK_LABEL });

		await user.unhover(link);

		// Right after leaving the link the card is still there: hiding is delayed
		// so the pointer can travel from the link to the card.
		expect(screen.getByRole('button', { name: EDIT_LINK_LABEL })).toBeInTheDocument();
		// Once the grace period expires without reaching the card, it hides.
		await waitFor(
			() => {
				expect(screen.queryByRole('button', { name: EDIT_LINK_LABEL })).not.toBeInTheDocument();
			},
			{ timeout: 2000 }
		);
	});

	it('does not hide the card while the pointer hovers the card itself', async () => {
		const { user, link } = await setupWithLink();

		await user.hover(link);
		const editButton = await screen.findByRole('button', { name: EDIT_LINK_LABEL });

		await user.unhover(link);
		await user.hover(editButton);

		// Wait well past the grace period: hovering the card cancels the hide.
		await new Promise((resolve) => {
			setTimeout(resolve, 800);
		});
		expect(screen.getByRole('button', { name: EDIT_LINK_LABEL })).toBeInTheDocument();
	});

	it('keeps a pressed link pinned and dismisses it when pressing elsewhere', async () => {
		const { user, link } = await setupWithLink();

		await user.click(link);
		expect(await screen.findByRole('button', { name: EDIT_LINK_LABEL })).toBeInTheDocument();

		await user.click(screen.getByText('before'));

		await waitFor(() => {
			expect(screen.queryByRole('button', { name: EDIT_LINK_LABEL })).not.toBeInTheDocument();
		});
	});

	it('does not show the floating editor when the description is read-only', async () => {
		const { user, link } = await setupWithLink(undefined, {
			disabled: { ...defaultEditor.disabled, composer: true }
		});

		await user.hover(link);

		expect(screen.queryByRole('button', { name: EDIT_LINK_LABEL })).not.toBeInTheDocument();
	});

	it('removes the link when the remove action is clicked', async () => {
		const { store, user, link } = await setupWithLink();

		await user.click(link);
		await user.click(await screen.findByRole('button', { name: REMOVE_LINK_LABEL }));

		await waitFor(() => {
			expect(richTextOf(store)).not.toContain('<a');
		});
		// The text content is preserved after the link is removed.
		expect(richTextOf(store)).toContain(LINK_TEXT);
	});

	it('removes a link whose text is itself a URL', async () => {
		const { store, user, editorElement } = setupEditor(
			`<p><a href="${LINK_URL}">${LINK_URL}</a></p>`
		);

		await user.click(await within(editorElement).findByRole('link', { name: LINK_URL }));
		await user.click(await screen.findByRole('button', { name: REMOVE_LINK_LABEL }));

		await waitFor(() => {
			expect(richTextOf(store)).not.toContain('<a');
		});
		expect(richTextOf(store)).toContain(LINK_URL);
	});

	it('removes a link whose text contains a URL without the URL being auto-linked again', async () => {
		const linkText = `Visit ${LINK_URL}`;
		const { store, user, editorElement } = setupEditor(
			`<p><a href="https://other-link.com">${linkText}</a></p>`
		);

		await user.click(await within(editorElement).findByRole('link', { name: linkText }));
		await user.click(await screen.findByRole('button', { name: REMOVE_LINK_LABEL }));

		await waitFor(() => {
			expect(richTextOf(store)).toContain(UNLINKED_AUTO_LINK_CLASS);
		});
		expect(richTextOf(store)).not.toContain('<a');
		expect(within(editorElement).queryByRole('link')).not.toBeInTheDocument();
		expect(editorElement).toHaveTextContent(linkText);
	});

	it('opens the edit modal pre-filled when the edit action is clicked', async () => {
		const { user, link } = await setupWithLink(
			`<p><a href="${LINK_URL}" target="_blank" title="My title">${LINK_TEXT}</a></p>`
		);

		await user.click(link);
		await user.click(await screen.findByRole('button', { name: EDIT_LINK_LABEL }));

		expect(await screen.findByText('lexical-label.insert_edit_link')).toBeInTheDocument();
		expect(screen.getByRole('textbox', { name: 'lexical-label.url' })).toHaveValue(LINK_URL);
		expect(screen.getByRole('textbox', { name: 'lexical-label.text_to_display' })).toHaveValue(
			LINK_TEXT
		);
		expect(screen.getByRole('textbox', { name: 'lexical-label.link_title' })).toHaveValue(
			'My title'
		);
		expect(screen.getByText('lexical-label.new_window')).toBeInTheDocument();
	});

	it('updates the existing link in place when the edit modal is saved', async () => {
		const { store, user, link } = await setupWithLink();

		await user.click(link);
		await user.click(await screen.findByRole('button', { name: EDIT_LINK_LABEL }));
		await screen.findByText('lexical-label.insert_edit_link');

		const urlInput = screen.getByRole('textbox', { name: 'lexical-label.url' });
		await user.clear(urlInput);
		await user.paste('https://updated-link.com');
		const textInput = screen.getByRole('textbox', { name: 'lexical-label.text_to_display' });
		await user.clear(textInput);
		await user.paste('updated text');
		await user.pasteInto(
			screen.getByRole('textbox', { name: 'lexical-label.link_title' }),
			'Updated title'
		);
		await user.click(screen.getByText('lexical-label.current_window'));
		await user.click(
			within(screen.getByTestId('dropdown-popper-list')).getByText('lexical-label.new_window')
		);
		await user.click(screen.getByRole('button', { name: SAVE_LABEL }));

		await waitFor(() => {
			expect(richTextOf(store)).toContain('href="https://updated-link.com"');
		});
		const html = richTextOf(store);
		expect(html).toContain('updated text');
		expect(html).not.toContain(`>${LINK_TEXT}<`);
		expect(html).toContain('title="Updated title"');
		expect(html).toContain('target="_blank"');
		expect(html).toContain('rel="noopener noreferrer"');
	});

	describe('auto-detected links', () => {
		it.each([
			['URL', LINK_URL],
			['email address', LINK_EMAIL]
		])(
			'keeps an auto-detected %s removed instead of re-creating the link from its text',
			async (_case, text) => {
				const { store, editorElement } = await setupWithRemovedAutoLink(text, text);

				expect(within(editorElement).queryByRole('link')).not.toBeInTheDocument();
				expect(richTextOf(store)).not.toContain('<a');
				expect(richTextOf(store)).toContain(text);
				expect(screen.queryByRole('button', { name: REMOVE_LINK_LABEL })).not.toBeInTheDocument();
			}
		);

		it('keeps an auto-detected link removed, with its formatting, after the saved HTML is loaded again', async () => {
			const { store, unmount } = await setupWithRemovedAutoLink(`<b>${LINK_URL}</b>`, LINK_URL);
			const savedHtml = richTextOf(store).replaceAll(ATTRIBUTES_OTHER_THAN_CLASS_STYLE_HREF, '');
			expect(savedHtml).toContain(UNLINKED_AUTO_LINK_CLASS);
			unmount();

			const { store: reloadedStore, editorElement } = setupEditor(savedHtml);
			const text = await within(editorElement).findByText(LINK_URL);
			expect(within(editorElement).queryByRole('link')).not.toBeInTheDocument();
			expect(text).toHaveClass('cal-lexical-bold');
			expect(richTextOf(reloadedStore)).not.toContain('<a');
		});

		it('restores the link of an auto-detected URL that was removed', async () => {
			const { store, user, editorElement } = await setupWithRemovedAutoLink(LINK_URL, LINK_URL);

			// The removed link is plain text: pressing it offers only to restore the link.
			await user.click(within(editorElement).getByText(LINK_URL));
			const restoreButton = await screen.findByRole('button', { name: RESTORE_LINK_LABEL });
			expect(screen.queryByRole('button', { name: EDIT_LINK_LABEL })).not.toBeInTheDocument();
			expect(screen.queryByRole('button', { name: REMOVE_LINK_LABEL })).not.toBeInTheDocument();
			await user.click(restoreButton);

			expect(
				await within(editorElement).findByRole('link', { name: LINK_URL })
			).toBeInTheDocument();
			await waitFor(() => {
				expect(richTextOf(store)).toContain(`href="${LINK_URL}"`);
			});
			expect(richTextOf(store)).not.toContain(UNLINKED_AUTO_LINK_CLASS);
		});

		it('shows the restore card while the pointer hovers the text of a removed auto-detected link', async () => {
			const { user, editorElement } = await setupWithRemovedAutoLink(LINK_URL, LINK_URL);

			await user.hover(within(editorElement).getByText(LINK_URL));

			expect(await screen.findByRole('button', { name: RESTORE_LINK_LABEL })).toBeInTheDocument();
		});

		it('restores a removed link loaded from HTML with the URL of its text', async () => {
			const linkText = 'www.custom-link.com';
			const { user, editorElement } = setupEditor(
				`<p><span class="${UNLINKED_AUTO_LINK_CLASS}">${linkText}</span></p>`
			);

			await user.hover(await within(editorElement).findByText(linkText));
			await user.click(await screen.findByRole('button', { name: RESTORE_LINK_LABEL }));

			const link = await within(editorElement).findByRole('link', { name: linkText });
			expect(link).toHaveAttribute('href', `https://${linkText}`);
		});

		it('imports a marked span whose text is not a link without the removed-link wrapper', async () => {
			const { store, user, editorElement } = setupEditor(
				`<p><span class="${UNLINKED_AUTO_LINK_CLASS}"><a href="${LINK_URL}">${SCRIPT_URL}</a></span></p>`
			);
			const innerLink = await within(editorElement).findByRole('link', { name: SCRIPT_URL });

			// The element around the inner link is where a removed link would be.
			// eslint-disable-next-line testing-library/no-node-access -- the outer element has no role or text of its own
			await user.hover(innerLink.parentElement ?? innerLink);
			expect(screen.queryByRole('button', { name: RESTORE_LINK_LABEL })).not.toBeInTheDocument();

			appendText(editorElement, 'x');
			// Wait for the re-export (the initial HTML already holds the same link).
			await waitFor(() => {
				expect(richTextOf(store)).not.toContain(UNLINKED_AUTO_LINK_CLASS);
			});
			expect(linksOf(store)).toEqual([expect.objectContaining({ href: LINK_URL })]);
		});

		it('unwraps a removed link holding another link when it is restored, keeping the inner link', async () => {
			const linkText = 'www.custom-link.com';
			const { store, user, editorElement } = setupEditor(
				`<p><span class="${UNLINKED_AUTO_LINK_CLASS}"><a href="${LINK_URL}">${linkText}</a></span></p>`
			);
			const innerLink = await within(editorElement).findByRole('link', { name: linkText });

			// The text sits in an inner link: open the card of the removed link from its own element.
			// eslint-disable-next-line testing-library/no-node-access -- the outer element has no role or text of its own
			await user.hover(innerLink.parentElement ?? innerLink);
			await user.click(await screen.findByRole('button', { name: RESTORE_LINK_LABEL }));

			// Wait for the re-export (the initial HTML already holds the same link).
			await waitFor(() => {
				expect(richTextOf(store)).not.toContain(UNLINKED_AUTO_LINK_CLASS);
			});
			expect(linksOf(store)).toEqual([{ href: LINK_URL, text: linkText }]);
		});

		it('keeps an auto-detected link with its URL when the text to display is changed', async () => {
			const { store, user, editorElement } = setupEditor(`<p>${LINK_URL}</p>`);
			const link = await within(editorElement).findByRole('link', { name: LINK_URL });

			await editLinkText(user, link, NEW_LINK_TEXT);

			await waitFor(() => {
				expect(linksOf(store)).toEqual([{ href: LINK_URL, text: NEW_LINK_TEXT }]);
			});
		});

		it('turns a removed auto-detected link into a link again when it is saved from the link modal', async () => {
			const { store, user, editorElement } = await setupWithRemovedAutoLink(LINK_URL, LINK_URL);

			// Put the caret inside the removed link and open the toolbar link modal.
			await user.click(editorElement);
			await user.keyboard('{Control>}a{/Control}');
			await user.click(screen.getByRole('button', { name: INSERT_LINK_LABEL }));
			expect(await screen.findByRole('textbox', { name: URL_LABEL })).toHaveValue(LINK_URL);
			await user.click(screen.getByRole('button', { name: SAVE_LABEL }));

			expect(
				await within(editorElement).findByRole('link', { name: LINK_URL })
			).toBeInTheDocument();
			await waitFor(() => {
				expect(linksOf(store)).toEqual([{ href: LINK_URL, text: LINK_URL }]);
			});
			expect(richTextOf(store)).not.toContain(UNLINKED_AUTO_LINK_CLASS);
		});
	});

	it('does not put an unsafe URL in the link of the floating card', async () => {
		const { user, link } = await setupWithLink();
		// The import sanitizer already drops unsafe hrefs, so set one directly on the node.
		const editor = lexicalEditorOf(screen.getByTestId(EDITOR_TESTID));
		act(() => {
			editor.update(
				() => {
					$dfs()
						.map(({ node }) => node)
						.filter($isLinkNode)
						.forEach((node) => node.setURL(SCRIPT_URL));
				},
				{ discrete: true }
			);
		});

		await user.hover(link);

		// The card shows the URL as it is, but does not link it.
		expect(await screen.findByRole('link', { name: SCRIPT_URL })).toHaveAttribute(
			'href',
			UNSAFE_URL_REPLACEMENT
		);
	});

	it('opens the edit modal pre-filled from a hovered link while the caret is elsewhere', async () => {
		const { user, editorElement } = setupEditor(
			`<p>${LINK_TEXT}</p><p><a href="${LINK_URL}">${NEW_LINK_TEXT}</a></p>`
		);
		const link = await within(editorElement).findByRole('link', { name: NEW_LINK_TEXT });
		// Put the caret in the first paragraph, outside the link.
		await user.click(within(editorElement).getByText(LINK_TEXT));

		await user.hover(link);
		await user.click(await screen.findByRole('button', { name: EDIT_LINK_LABEL }));

		expect(await screen.findByRole('textbox', { name: URL_LABEL })).toHaveValue(LINK_URL);
		expect(screen.getByRole('textbox', { name: TEXT_TO_DISPLAY_LABEL })).toHaveValue(NEW_LINK_TEXT);
	});
});
