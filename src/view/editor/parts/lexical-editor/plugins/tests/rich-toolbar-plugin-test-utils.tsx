/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { $generateHtmlFromNodes } from '@lexical/html';
import { ListItemNode, ListNode } from '@lexical/list';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { act } from '@testing-library/react';
import { $createParagraphNode, $createTextNode, $getRoot, type LexicalEditor } from 'lexical';

import { RichToolbarPlugin } from '../rich-toolbar-plugin';
import { screen, setupTest } from '@test-setup';

export const EDITOR_TESTID = 'toolbar-test-editor';
export const SELECT_INDEX = { font: 0, size: 1, paragraph: 2 };

export type TestUser = ReturnType<typeof setupTest>['user'];

type TestEditorProps = {
	fontFamily?: string;
	fontSize?: string;
};

/**
 * Minimal standalone Lexical composer hosting only the ported
 * `RichToolbarPlugin` — the toolbar isn't wired into the shared
 * `RichTextEditorContainer` yet, so these tests build their own tiny editor
 * rather than depending on that (still-pending) integration.
 */
const TestEditor = ({ fontFamily, fontSize }: TestEditorProps): React.JSX.Element => {
	const initialConfig = useMemo(
		() => ({
			namespace: 'RichToolbarPluginTest',
			nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
			onError: (error: Error): void => {
				throw error;
			}
		}),
		[]
	);

	return (
		<LexicalComposer initialConfig={initialConfig}>
			<RichToolbarPlugin fontFamily={fontFamily} fontSize={fontSize} />
			<RichTextPlugin
				contentEditable={<ContentEditable data-testid={EDITOR_TESTID} />}
				placeholder={<div />}
				ErrorBoundary={LexicalErrorBoundary}
			/>
			<HistoryPlugin />
			<ListPlugin />
		</LexicalComposer>
	);
};

/** jsdom has no layout engine; CDS's `Select`/popovers call this during positioning. */
export function installRangeRectPolyfill(): void {
	if (typeof Range.prototype.getBoundingClientRect !== 'function') {
		Range.prototype.getBoundingClientRect = (): DOMRect =>
			({
				bottom: 0,
				height: 0,
				left: 0,
				right: 0,
				top: 0,
				width: 0,
				x: 0,
				y: 0,
				toJSON: () => ({})
			}) as DOMRect;
	}
}

export function getEditor(element: HTMLElement): LexicalEditor {
	return (element as unknown as { __lexicalEditor: LexicalEditor }).__lexicalEditor;
}

export function exportedHtml(editor: LexicalEditor): string {
	let html = '';
	editor.read(() => {
		html = $generateHtmlFromNodes(editor, null);
	});
	return html;
}

export function setupEditor(props: TestEditorProps = {}): {
	editor: LexicalEditor;
	editorElement: HTMLElement;
	user: TestUser;
} {
	const { user } = setupTest(<TestEditor {...props} />);
	const editorElement = screen.getByTestId(EDITOR_TESTID);
	return { editor: getEditor(editorElement), editorElement, user };
}

/**
 * Renders the editor, seeds it with a single paragraph of `text` and selects
 * all of it. Content is seeded directly through the editor's own update API
 * rather than via simulated typing: jsdom doesn't implement the native
 * `contenteditable` text-insertion behavior real browsers provide (which is
 * what Lexical's own `beforeinput` handling relies on), so `userEvent.type`
 * into the content-editable root is not a reliable way to get real text nodes
 * into the document under jsdom.
 */
export async function setupWithSelectedContent(
	text = 'hello world',
	props: TestEditorProps = {}
): Promise<{
	editor: LexicalEditor;
	editorElement: HTMLElement;
	user: TestUser;
}> {
	const { editor, editorElement, user } = setupEditor(props);

	act(() => {
		editor.update(() => {
			const root = $getRoot();
			root.clear();
			const paragraph = $createParagraphNode();
			paragraph.append($createTextNode(text));
			root.append(paragraph);
		});
	});
	await screen.findByText(text);

	await user.click(editorElement);
	await user.keyboard('{Control>}a{/Control}');
	return { editor, editorElement, user };
}

/**
 * Opens the font / size / paragraph `Select` at the given position (see
 * `SELECT_INDEX`). The selects render no label and the chevron icon has
 * `pointer-events: none`, so the dropdown is opened by clicking the
 * focusable trigger box around the chevron.
 */
export async function openSelect(user: TestUser, index: number): Promise<void> {
	const chevron = screen.getAllByTestId('icon: ArrowDown')[index];
	// eslint-disable-next-line testing-library/no-node-access
	const trigger = chevron.closest('[tabindex="0"]');
	if (trigger === null) {
		throw new Error('select trigger not found');
	}
	await user.click(trigger);
}
