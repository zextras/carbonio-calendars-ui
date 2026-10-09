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

const IMAGE_URL = 'https://example.com/picture.png';
const EDITOR_TESTID = 'editor-composer';
const INSERT_IMAGE_LABEL = 'lexical-label.insert_image_url';
const MODAL_TITLE = 'lexical-label.insert_edit_image';
const WIDTH_LABEL = 'lexical-label.width';
const HEIGHT_LABEL = 'lexical-label.height';

type TestUser = ReturnType<typeof renderRichTextEditor>['user'];

/** Makes every loaded image report a fixed 2:1 natural size synchronously. */
function stubImageWithNaturalSize(naturalWidth = 400, naturalHeight = 200): void {
	class MockImage {
		onload: (() => void) | null = null;

		naturalWidth = naturalWidth;

		naturalHeight = naturalHeight;

		set src(_value: string) {
			this.onload?.();
		}
	}
	vi.stubGlobal('Image', MockImage);
}

async function openInsertModalWithSource(): Promise<{
	store: ReturnType<typeof createEditorStore>;
	user: TestUser;
}> {
	const store = createEditorStore({ richText: '<p><br></p>' });
	const { user } = renderRichTextEditor(store);
	await user.click(screen.getByRole('button', { name: INSERT_IMAGE_LABEL }));
	expect(await screen.findByText(MODAL_TITLE)).toBeInTheDocument();
	await user.pasteInto(
		screen.getByRole('textbox', { name: 'lexical-label.image_source' }),
		IMAGE_URL
	);
	return { store, user };
}

async function replaceValue(user: TestUser, input: HTMLElement, value: string): Promise<void> {
	await user.clear(input);
	await user.paste(value);
}

describe('ImageModal', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('pre-fills the natural size once the source loads', async () => {
		stubImageWithNaturalSize();
		await openInsertModalWithSource();

		await waitFor(() =>
			expect(screen.getByRole('spinbutton', { name: WIDTH_LABEL })).toHaveValue(400)
		);
		expect(screen.getByRole('spinbutton', { name: HEIGHT_LABEL })).toHaveValue(200);
	});

	it('keeps the height proportional to the width while the aspect ratio is locked', async () => {
		stubImageWithNaturalSize();
		const { user } = await openInsertModalWithSource();
		const widthInput = screen.getByRole('spinbutton', { name: WIDTH_LABEL });
		await waitFor(() => expect(widthInput).toHaveValue(400));

		await replaceValue(user, widthInput, '100');

		expect(screen.getByRole('spinbutton', { name: HEIGHT_LABEL })).toHaveValue(50);
	});

	it('keeps the width proportional to the height while the aspect ratio is locked', async () => {
		stubImageWithNaturalSize();
		const { user } = await openInsertModalWithSource();
		const heightInput = screen.getByRole('spinbutton', { name: HEIGHT_LABEL });
		await waitFor(() => expect(heightInput).toHaveValue(200));

		await replaceValue(user, heightInput, '100');

		expect(screen.getByRole('spinbutton', { name: WIDTH_LABEL })).toHaveValue(200);
	});

	it('lets width and height change independently once the aspect ratio is unlocked', async () => {
		stubImageWithNaturalSize();
		const { user } = await openInsertModalWithSource();
		const widthInput = screen.getByRole('spinbutton', { name: WIDTH_LABEL });
		const heightInput = screen.getByRole('spinbutton', { name: HEIGHT_LABEL });
		await waitFor(() => expect(widthInput).toHaveValue(400));

		await user.click(screen.getByRole('button', { name: 'lexical-label.unlock_aspect_ratio' }));
		expect(screen.getByRole('button', { name: 'lexical-label.lock_aspect_ratio' })).toHaveAttribute(
			'aria-pressed',
			'false'
		);

		await replaceValue(user, widthInput, '100');
		expect(heightInput).toHaveValue(200);

		await replaceValue(user, heightInput, '30');
		expect(widthInput).toHaveValue(100);
	});

	it('inserts the image with the entered dimensions', async () => {
		stubImageWithNaturalSize();
		const { store, user } = await openInsertModalWithSource();
		const widthInput = screen.getByRole('spinbutton', { name: WIDTH_LABEL });
		await waitFor(() => expect(widthInput).toHaveValue(400));

		await replaceValue(user, widthInput, '100');
		await user.click(screen.getByRole('button', { name: 'label.save' }));

		await waitFor(() => {
			expect(richTextOf(store)).toContain(`src="${IMAGE_URL}"`);
		});
		expect(richTextOf(store)).toContain('width: 100px');
		expect(richTextOf(store)).toContain('height: 50px');
	});

	it('inserts the image without dimensions when they are left empty or invalid', async () => {
		// jsdom never loads images, so the natural size is never pre-filled here.
		const { store, user } = await openInsertModalWithSource();

		await user.pasteInto(screen.getByRole('spinbutton', { name: WIDTH_LABEL }), '0');
		await user.click(screen.getByRole('button', { name: 'label.save' }));

		await waitFor(() => {
			expect(richTextOf(store)).toContain(`src="${IMAGE_URL}"`);
		});
		expect(richTextOf(store)).not.toContain('width:');
		expect(richTextOf(store)).not.toContain('height:');
	});

	it('scales an existing image by its current size when its natural size is unknown', async () => {
		const store = createEditorStore({
			richText: `<p><img src="${IMAGE_URL}" alt="pic" width="200" height="100" /></p>`
		});
		const { user } = renderRichTextEditor(store);
		const editorElement = screen.getByTestId(EDITOR_TESTID);

		await user.dblClick(await within(editorElement).findByRole('img'));
		expect(await screen.findByText(MODAL_TITLE)).toBeInTheDocument();
		const widthInput = screen.getByRole('spinbutton', { name: WIDTH_LABEL });
		expect(widthInput).toHaveValue(200);
		expect(screen.getByRole('spinbutton', { name: HEIGHT_LABEL })).toHaveValue(100);

		await replaceValue(user, widthInput, '50');
		expect(screen.getByRole('spinbutton', { name: HEIGHT_LABEL })).toHaveValue(25);

		await user.click(screen.getByRole('button', { name: 'label.save' }));

		await waitFor(() => {
			expect(richTextOf(store)).toContain('width: 50px');
		});
		expect(richTextOf(store)).toContain('height: 25px');
	});

	it('keeps the new proportions after unlocking, resizing and locking again', async () => {
		const store = createEditorStore({
			richText: `<p><img src="${IMAGE_URL}" alt="pic" width="200" height="100" /></p>`
		});
		const { user } = renderRichTextEditor(store);
		const editorElement = screen.getByTestId(EDITOR_TESTID);

		await user.dblClick(await within(editorElement).findByRole('img'));
		expect(await screen.findByText(MODAL_TITLE)).toBeInTheDocument();
		const widthInput = screen.getByRole('spinbutton', { name: WIDTH_LABEL });
		const heightInput = screen.getByRole('spinbutton', { name: HEIGHT_LABEL });

		await user.click(screen.getByRole('button', { name: 'lexical-label.unlock_aspect_ratio' }));
		await replaceValue(user, heightInput, '50');
		expect(widthInput).toHaveValue(200);

		// Re-locking captures the new 200x50 (4:1) ratio.
		await user.click(screen.getByRole('button', { name: 'lexical-label.lock_aspect_ratio' }));
		await replaceValue(user, widthInput, '100');

		expect(heightInput).toHaveValue(25);
	});
});
