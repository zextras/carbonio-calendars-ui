/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { waitFor, within } from '@testing-library/react';

import {
	createEditorStore,
	renderRichTextEditor,
	richTextOf
} from '../../tests/lexical-editor-test-utils';
import { screen } from '@test-setup';

const EDITOR_TESTID = 'editor-composer';
const CONTENT = 'hello source code';
const SOURCE_CODE_LABEL = 'lexical-label.source_code';
const SAVE_LABEL = 'label.save';

type TestUser = ReturnType<typeof renderRichTextEditor>['user'];

function setupEditor(): { store: ReturnType<typeof createEditorStore>; user: TestUser } {
	const store = createEditorStore({ richText: `<p>${CONTENT}</p>` });
	const { user } = renderRichTextEditor(store);
	return { store, user };
}

async function openSourceCodeModal(user: TestUser): Promise<void> {
	const editorElement = screen.getByTestId(EDITOR_TESTID);
	await within(editorElement).findByText(CONTENT);
	await user.click(screen.getByRole('button', { name: SOURCE_CODE_LABEL }));
	await screen.findByText(SOURCE_CODE_LABEL, { selector: 'div' });
}

describe('SourceCodeModal', () => {
	it('opens showing the current editor content as HTML source', async () => {
		const { user } = setupEditor();

		await openSourceCodeModal(user);

		// The content shows up a second time, as source, inside the modal
		await waitFor(() => {
			expect(screen.getAllByText(new RegExp(CONTENT)).length).toBeGreaterThan(1);
		});
		expect(screen.getByRole('button', { name: SAVE_LABEL })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'label.cancel' })).toBeInTheDocument();
	});

	it('closes without altering the content when cancelled', async () => {
		const { store, user } = setupEditor();

		await openSourceCodeModal(user);
		await user.click(screen.getByRole('button', { name: 'label.cancel' }));

		await waitFor(() => {
			expect(screen.queryByRole('button', { name: SAVE_LABEL })).not.toBeInTheDocument();
		});
		const editorElement = screen.getByTestId(EDITOR_TESTID);
		expect(within(editorElement).getByText(CONTENT)).toBeInTheDocument();
		expect(richTextOf(store)).toContain(CONTENT);
	});

	it('parses the source back into the editor when saved', async () => {
		const { user } = setupEditor();

		await openSourceCodeModal(user);
		await waitFor(() => {
			expect(screen.getAllByText(new RegExp(CONTENT)).length).toBeGreaterThan(1);
		});

		await user.click(screen.getByRole('button', { name: SAVE_LABEL }));

		await waitFor(() => {
			expect(screen.queryByRole('button', { name: SAVE_LABEL })).not.toBeInTheDocument();
		});
		const editorElement = screen.getByTestId(EDITOR_TESTID);
		await within(editorElement).findByText(CONTENT);
	});
});
