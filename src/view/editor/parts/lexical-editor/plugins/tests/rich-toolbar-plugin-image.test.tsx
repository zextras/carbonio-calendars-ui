/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { waitFor } from '@testing-library/react';

import {
	createEditorStore,
	renderRichTextEditor,
	richTextOf
} from '../../tests/lexical-editor-test-utils';
import { screen, within } from '@test-setup';

const EDITOR_TESTID = 'editor-composer';
const INSERT_IMAGE_LABEL = 'lexical-label.insert_image_url';
const IMAGE_URL = 'https://example.com/picture.png';

describe('RichToolbarPlugin - image', () => {
	it('inserts an image from the values entered in the modal', async () => {
		const store = createEditorStore({ richText: '<p><br></p>' });
		const { user } = renderRichTextEditor(store);
		const editorElement = screen.getByTestId(EDITOR_TESTID);

		await user.click(screen.getByRole('button', { name: INSERT_IMAGE_LABEL }));

		expect(await screen.findByText('lexical-label.insert_edit_image')).toBeInTheDocument();
		await user.pasteInto(
			screen.getByRole('textbox', { name: 'lexical-label.image_source' }),
			IMAGE_URL
		);
		await user.pasteInto(
			screen.getByRole('textbox', { name: 'lexical-label.image_alt' }),
			'a picture'
		);
		await user.click(screen.getByRole('button', { name: 'label.save' }));

		const image = await within(editorElement).findByRole('img');
		expect(image).toHaveAttribute('src', IMAGE_URL);
		expect(image).toHaveAttribute('alt', 'a picture');

		await waitFor(() => {
			expect(richTextOf(store)).toContain(`src="${IMAGE_URL}"`);
		});
		expect(richTextOf(store)).toContain('alt="a picture"');
	});

	it('keeps the save action disabled until a source is provided', async () => {
		const store = createEditorStore({ richText: '<p><br></p>' });
		const { user } = renderRichTextEditor(store);

		await user.click(screen.getByRole('button', { name: INSERT_IMAGE_LABEL }));

		expect(await screen.findByText('lexical-label.insert_edit_image')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'label.save' })).toBeDisabled();

		await user.pasteInto(
			screen.getByRole('textbox', { name: 'lexical-label.image_source' }),
			IMAGE_URL
		);

		expect(screen.getByRole('button', { name: 'label.save' })).toBeEnabled();
	});

	it('does not insert an image when the modal is dismissed', async () => {
		const store = createEditorStore({ richText: '<p><br></p>' });
		const { user } = renderRichTextEditor(store);
		const editorElement = screen.getByTestId(EDITOR_TESTID);

		await user.click(screen.getByRole('button', { name: INSERT_IMAGE_LABEL }));
		expect(await screen.findByText('lexical-label.insert_edit_image')).toBeInTheDocument();
		await user.click(screen.getByRole('button', { name: 'label.cancel' }));

		expect(within(editorElement).queryByRole('img')).not.toBeInTheDocument();
	});

	it('edits a selected image in place when double-clicked', async () => {
		const store = createEditorStore({
			richText: '<p><img src="https://example.com/inline.png" alt="pic" /></p>'
		});
		const { user } = renderRichTextEditor(store);
		const editorElement = screen.getByTestId(EDITOR_TESTID);

		const image = (await within(editorElement).findByRole('img')) as HTMLImageElement;
		await user.dblClick(image);

		expect(await screen.findByText('lexical-label.insert_edit_image')).toBeInTheDocument();
		expect(screen.getByRole('textbox', { name: 'lexical-label.image_source' })).toHaveValue(
			'https://example.com/inline.png'
		);
		expect(screen.getByRole('textbox', { name: 'lexical-label.image_alt' })).toHaveValue('pic');

		const altInput = screen.getByRole('textbox', { name: 'lexical-label.image_alt' });
		await user.clear(altInput);
		await user.paste('updated alt');
		await user.click(screen.getByRole('button', { name: 'label.save' }));

		await waitFor(() => {
			expect(richTextOf(store)).toContain('alt="updated alt"');
		});
	});

	it('round-trips a description that already contains a plain <img> tag from another client on load', async () => {
		// Simulates content saved by another calendar client (or by this editor
		// before a reload): no attributes this editor's own UI would ever write
		// beyond src/alt/width/height, and critically produced outside this
		// session, so nothing but ImageNode's own importDOM should be able to
		// resurrect it.
		const store = createEditorStore({
			richText:
				'<p>Some notes</p><p><img src="https://example.com/legacy.png" alt="legacy image" width="200" height="100" /></p>'
		});
		const { user } = renderRichTextEditor(store);
		const editorElement = screen.getByTestId(EDITOR_TESTID);

		const image = await within(editorElement).findByRole('img');
		expect(image).toHaveAttribute('src', 'https://example.com/legacy.png');
		expect(image).toHaveAttribute('alt', 'legacy image');
		expect(within(editorElement).getByText('Some notes')).toBeInTheDocument();

		// And it survives being selected/clicked like any image this editor itself inserted.
		await user.click(image);
		await waitFor(() => {
			expect(screen.getByTestId('image-resizer-se')).toBeInTheDocument();
		});
	});

	it('removes the image when selected and Delete is pressed', async () => {
		const store = createEditorStore({
			richText: '<p><img src="https://example.com/inline.png" alt="pic" /></p>'
		});
		const { user } = renderRichTextEditor(store);
		const editorElement = screen.getByTestId(EDITOR_TESTID);

		const image = await within(editorElement).findByRole('img');
		await user.click(image);
		await waitFor(() => {
			expect(screen.getByTestId('image-resizer-se')).toBeInTheDocument();
		});

		await user.keyboard('{Delete}');

		await waitFor(() => {
			expect(within(editorElement).queryByRole('img')).not.toBeInTheDocument();
		});
	});
});
