/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable testing-library/prefer-user-event -- user-event does not support dragging files */
import { fireEvent } from '@testing-library/react';

import { createEditorStore, renderRichTextEditor } from '../../tests/lexical-editor-test-utils';
import { INLINE_IMAGE_DRAG_TYPE } from '../nodes/image-types';
import { screen, within } from '@test-setup';
import { defaultEditor } from 'view/editor/tests/common';

const EDITOR_TESTID = 'editor-composer';
const INITIAL_TEXT = 'description';
const UNSUPPORTED_DROP_MESSAGE = 'snackbar.dropped_file_type_not_supported';

/*
 * jsdom does not implement DragEvent, which the editor tells apart by its
 * class. The event data transfer is set by fireEvent.
 */
class DragEventMock extends MouseEvent {}

/**
 * The data transfer of a drag, as the browsers expose it while dragging: only
 * the types can be read.
 */
function dragTransfer(types: Array<string>): DataTransfer {
	return {
		types,
		files: [] as unknown as FileList,
		getData: (): string => ''
	} as unknown as DataTransfer;
}

const FILES = ['Files'];

/**
 * Drags the data over the element and drops them on it. Returns whether the
 * browser default actions were prevented: the dragover one, to accept the drop,
 * and the drop one, that opens the dropped files.
 */
function dragAndDrop(
	element: Element,
	types: Array<string>
): { dropAccepted: boolean; dropPrevented: boolean } {
	const dataTransfer = dragTransfer(types);
	const dropAccepted = !fireEvent.dragOver(element, { dataTransfer });
	const dropPrevented = !fireEvent.drop(element, { dataTransfer });
	return { dropAccepted, dropPrevented };
}

async function setupEditor(readOnly = false): Promise<HTMLElement> {
	const store = createEditorStore({
		richText: `<p>${INITIAL_TEXT}</p>`,
		disabled: { ...defaultEditor.disabled, composer: readOnly }
	});
	renderRichTextEditor(store);
	const editorElement = screen.getByTestId(EDITOR_TESTID);
	await within(editorElement).findByText(INITIAL_TEXT);
	return editorElement;
}

describe('Files dropped on the editor out of its text', () => {
	beforeEach(() => {
		vi.stubGlobal('DragEvent', DragEventMock);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		Reflect.deleteProperty(document, 'caretPositionFromPoint');
	});

	it('are not opened by the browser when dropped on the toolbar, and are reported', async () => {
		await setupEditor();

		const result = dragAndDrop(screen.getByRole('toolbar'), FILES);

		expect(result).toEqual({ dropAccepted: true, dropPrevented: true });
		expect(await screen.findByText(UNSUPPORTED_DROP_MESSAGE)).toBeVisible();
	});

	it('are not opened by the browser when dropped on the read-only editor, and are reported', async () => {
		const editorElement = await setupEditor(true);

		const result = dragAndDrop(within(editorElement).getByText(INITIAL_TEXT), FILES);

		expect(result).toEqual({ dropAccepted: true, dropPrevented: true });
		expect(await screen.findByText(UNSUPPORTED_DROP_MESSAGE)).toBeVisible();
	});

	it('are left to the editor when dragged over the editable text', async () => {
		const editorElement = await setupEditor();
		const text = within(editorElement).getByText(INITIAL_TEXT);
		// jsdom has no layout: the DOM position under the pointer is mocked
		Object.defineProperty(document, 'caretPositionFromPoint', {
			configurable: true,
			value: vi.fn(() => ({ offsetNode: text, offset: 0 }))
		});

		// With no files to read, the editor lets the browser handle the drop
		const result = dragAndDrop(text, FILES);

		expect(result).toEqual({ dropAccepted: false, dropPrevented: false });
		expect(screen.queryByText(UNSUPPORTED_DROP_MESSAGE)).not.toBeInTheDocument();
	});

	it('are ignored when the drag carries no file', async () => {
		await setupEditor();

		const result = dragAndDrop(screen.getByRole('toolbar'), ['text/plain']);

		expect(result).toEqual({ dropAccepted: false, dropPrevented: false });
		expect(screen.queryByText(UNSUPPORTED_DROP_MESSAGE)).not.toBeInTheDocument();
	});

	it('are ignored when an inline image is dragged out of the text', async () => {
		await setupEditor();

		const result = dragAndDrop(screen.getByRole('toolbar'), [INLINE_IMAGE_DRAG_TYPE, 'Files']);

		expect(result).toEqual({ dropAccepted: false, dropPrevented: false });
		expect(screen.queryByText(UNSUPPORTED_DROP_MESSAGE)).not.toBeInTheDocument();
	});
});
