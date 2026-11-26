/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable testing-library/prefer-user-event -- user-event does not support native drag and drop */
import { act, createEvent, fireEvent, waitFor } from '@testing-library/react';
import { $getNearestNodeFromDOMNode, type LexicalEditor, UNDO_COMMAND } from 'lexical';

import {
	createEditorStore,
	renderRichTextEditor,
	richTextOf
} from '../../tests/lexical-editor-test-utils';
import { DROP_CARET_TEST_ID } from '../image-drag-drop';
import { INLINE_IMAGE_DRAG_TYPE } from '../nodes/image-types';
import { screen, within } from '@test-setup';

const EDITOR_TESTID = 'editor-composer';
const TARGET_TEXT = 'second paragraph';
// Longer than the debounce of the editor -> store sync
const STORE_SYNC_DELAY = 600;

const MOVABLE_IMAGE_HTML =
	'<p>first<img src="https://example.com/inline.png" alt="pic" /></p><p>second paragraph</p>';

type EditorStore = ReturnType<typeof createEditorStore>;

/**
 * Minimal DataTransfer (not implemented by jsdom), shared by the events of a
 * single drag operation. As in the browsers, its data can be read only on drop:
 * during the dragover (protected mode) only the types are exposed.
 */
function createDataTransfer(): {
	dataTransfer: DataTransfer;
	setProtected: (value: boolean) => void;
} {
	const data = new Map<string, string>();
	let isProtected = false;
	const dataTransfer = {
		get types(): string[] {
			return Array.from(data.keys());
		},
		setData: (type: string, value: string): void => {
			data.set(type, value);
		},
		getData: (type: string): string => (isProtected ? '' : (data.get(type) ?? '')),
		effectAllowed: 'uninitialized',
		dropEffect: 'none',
		files: [] as unknown as FileList
	} as unknown as DataTransfer;
	return {
		dataTransfer,
		setProtected: (value: boolean): void => {
			isProtected = value;
		}
	};
}

/**
 * jsdom has no layout, so the DOM position under the pointer is provided through
 * a mocked `document.caretPositionFromPoint` (or, with `legacy`, through the
 * `document.caretRangeFromPoint` used by the browsers lacking the former).
 */
function mockDropPosition(node: Node, offset: number, { legacy = false } = {}): void {
	if (legacy) {
		const range = document.createRange();
		range.setStart(node, offset);
		range.collapse(true);
		Object.defineProperty(document, 'caretRangeFromPoint', {
			configurable: true,
			value: vi.fn((): Range => range)
		});
		return;
	}
	Object.defineProperty(document, 'caretPositionFromPoint', {
		configurable: true,
		value: vi.fn(() => ({ offsetNode: node, offset }))
	});
}

function getTextNode(element: Element): Node {
	const textNode = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode();
	if (textNode === null) {
		throw new Error('missing text node');
	}
	return textNode;
}

/**
 * Drags `source` and drops it on `target`. Returns whether the editor allowed
 * the drop (by cancelling the dragover) and whether it drew the drop caret
 * while dragging.
 */
function dragAndDrop(
	source: Element,
	target: Element
): { dropAllowed: boolean; dropCaretShown: boolean } {
	const { dataTransfer, setProtected } = createDataTransfer();
	fireEvent.dragStart(source, { dataTransfer });
	setProtected(true);
	const dropAllowed = !fireEvent.dragOver(target, { dataTransfer });
	const dropCaretShown = screen.queryByTestId(DROP_CARET_TEST_ID) !== null;
	setProtected(false);
	fireEvent.drop(target, { dataTransfer });
	fireEvent.dragEnd(source, { dataTransfer });
	return { dropAllowed, dropCaretShown };
}

/**
 * Starts dragging `source` and moves it over `target`, without dropping it.
 */
function startDragOver(source: Element, target: Element): DataTransfer {
	const { dataTransfer, setProtected } = createDataTransfer();
	fireEvent.dragStart(source, { dataTransfer });
	setProtected(true);
	fireEvent.dragOver(target, { dataTransfer });
	return dataTransfer;
}

function fireDragLeave(element: Element, relatedTarget: EventTarget | null): void {
	const event = createEvent.dragLeave(element);
	Object.defineProperty(event, 'relatedTarget', { value: relatedTarget });
	fireEvent(element, event);
}

/**
 * Lets the debounced editor -> store sync run, so that an unchanged store
 * content means that the editor content did not change either.
 */
function flushStoreSync(): void {
	act(() => {
		vi.advanceTimersByTime(STORE_SYNC_DELAY);
	});
}

async function setupEditorForMove(richText: string): Promise<{
	store: EditorStore;
	editor: LexicalEditor;
	editorElement: HTMLElement;
}> {
	const store = createEditorStore({ richText });
	renderRichTextEditor(store);
	const editorElement = screen.getByTestId(EDITOR_TESTID);
	await within(editorElement).findAllByRole('img');
	const editor = (editorElement as HTMLElement & { __lexicalEditor: LexicalEditor })
		.__lexicalEditor;
	return { store, editor, editorElement };
}

async function findEditorImage(): Promise<HTMLImageElement> {
	const image = await within(screen.getByTestId(EDITOR_TESTID)).findByRole('img');
	return image as HTMLImageElement;
}

describe('Inline image drag and drop', () => {
	afterEach(() => {
		// Remove the mocks installed by mockDropPosition
		Reflect.deleteProperty(document, 'caretPositionFromPoint');
		Reflect.deleteProperty(document, 'caretRangeFromPoint');
	});

	it('moves the image to the drop position when dragged into another paragraph', async () => {
		const { store, editorElement } = await setupEditorForMove(
			'<p>first<img src="https://example.com/inline.png" alt="pic" ' +
				'style="width: 200px; height: 100px;" /></p><p>second paragraph</p>'
		);
		const image = await findEditorImage();
		const targetText = within(editorElement).getByText(TARGET_TEXT);
		mockDropPosition(getTextNode(targetText), 'second'.length);

		const { dropAllowed, dropCaretShown } = dragAndDrop(image, targetText);

		expect(dropAllowed).toBe(true);
		expect(dropCaretShown).toBe(true);
		expect(screen.queryByTestId(DROP_CARET_TEST_ID)).not.toBeInTheDocument();

		await waitFor(() => {
			expect(richTextOf(store)).toMatch(/second<\/span><img [^>]*><span[^>]*> paragraph/);
		});
		const richText = richTextOf(store);
		expect(richText.match(/<img /g)).toHaveLength(1);
		expect(richText).toMatch(/<p[^>]*><span[^>]*>first<\/span><\/p>/);
		expect(richText).toContain('src="https://example.com/inline.png"');
		expect(richText).toContain('alt="pic"');
		expect(richText).toContain('width: 200px');
		expect(richText).toContain('height: 100px');
		expect(within(editorElement).getAllByRole('img')).toHaveLength(1);
	});

	it('only moves the image when the browser also lists it as a dropped file', async () => {
		const { store, editorElement } = await setupEditorForMove(MOVABLE_IMAGE_HTML);
		const image = await findEditorImage();
		const targetText = within(editorElement).getByText(TARGET_TEXT);
		mockDropPosition(getTextNode(targetText), 'second'.length);
		const { dataTransfer, setProtected } = createDataTransfer();
		dataTransfer.setData('Files', '');
		Object.defineProperty(dataTransfer, 'files', {
			value: [new File(['png'], 'inline.png', { type: 'image/png' })]
		});

		fireEvent.dragStart(image, { dataTransfer });
		setProtected(true);
		fireEvent.dragOver(targetText, { dataTransfer });
		setProtected(false);
		fireEvent.drop(targetText, { dataTransfer });

		await waitFor(() => {
			expect(richTextOf(store)).toMatch(/second<\/span><img [^>]*><span[^>]*> paragraph/);
		});
		flushStoreSync();
		expect(richTextOf(store).match(/<img /g)).toHaveLength(1);
		expect(richTextOf(store)).not.toContain('data:');
	});

	it('resolves the drop position on the browsers lacking caretPositionFromPoint', async () => {
		const { store, editorElement } = await setupEditorForMove(MOVABLE_IMAGE_HTML);
		const image = await findEditorImage();
		const targetText = within(editorElement).getByText(TARGET_TEXT);
		mockDropPosition(getTextNode(targetText), 'second'.length, { legacy: true });

		dragAndDrop(image, targetText);

		await waitFor(() => {
			expect(richTextOf(store)).toMatch(/second<\/span><img [^>]*><span[^>]*> paragraph/);
		});
	});

	it('moves the image to the end of the text when the pointer is past the text', async () => {
		const { store, editorElement } = await setupEditorForMove(MOVABLE_IMAGE_HTML);
		const image = await findEditorImage();
		const targetText = within(editorElement).getByText(TARGET_TEXT);
		// Hit on the text element, after its text node
		mockDropPosition(targetText, 1);

		dragAndDrop(image, targetText);

		await waitFor(() => {
			expect(richTextOf(store)).toMatch(/second paragraph<\/span><img /);
		});
	});

	it('moves the image into an empty paragraph', async () => {
		const { store, editorElement } = await setupEditorForMove(
			'<p>first<img src="https://example.com/inline.png" alt="pic" /></p><p><br></p><p>last</p>'
		);
		const image = await findEditorImage();
		const emptyParagraph = within(editorElement).getAllByRole('paragraph')[1];
		mockDropPosition(emptyParagraph, 0);

		const { dropCaretShown } = dragAndDrop(image, emptyParagraph);

		expect(dropCaretShown).toBe(true);
		await waitFor(() => {
			expect(richTextOf(store)).toMatch(
				/first<\/span><\/p><p[^>]*><img [^>]*><\/p><p[^>]*><span[^>]*>last/
			);
		});
	});

	it('moves the image right after another image when dropped on it', async () => {
		const { store, editorElement } = await setupEditorForMove(
			'<p><img src="https://example.com/a.png" alt="moved" />text</p>' +
				'<p>end<img src="https://example.com/b.png" alt="target" /></p>'
		);
		const image = within(editorElement).getByRole('img', { name: 'moved' });
		const targetImage = within(editorElement).getByRole('img', { name: 'target' });
		mockDropPosition(targetImage, 0);

		const { dropCaretShown } = dragAndDrop(image, targetImage);

		expect(dropCaretShown).toBe(true);
		await waitFor(() => {
			expect(richTextOf(store)).toMatch(/alt="target"[^>]*><img [^>]*alt="moved"/);
		});
		expect(richTextOf(store).match(/alt="moved"/g)).toHaveLength(1);
	});

	it('appends the image to the last paragraph when dropped below it', async () => {
		const { store, editorElement } = await setupEditorForMove(MOVABLE_IMAGE_HTML);
		const image = await findEditorImage();
		// Hit on the editor root, below its last paragraph
		mockDropPosition(editorElement, 2);

		dragAndDrop(image, editorElement);

		await waitFor(() => {
			expect(richTextOf(store)).toMatch(/second paragraph<\/span><img /);
		});
	});

	it('moves the image at the start of the first paragraph when dropped above it', async () => {
		const { store, editorElement } = await setupEditorForMove(
			'<p>first</p><p>second<img src="https://example.com/inline.png" alt="pic" /></p>'
		);
		const image = await findEditorImage();
		// Hit on the editor root, above its first paragraph
		mockDropPosition(editorElement, 0);

		dragAndDrop(image, editorElement);

		await waitFor(() => {
			expect(richTextOf(store)).toMatch(/^<p[^>]*><img [^>]*><span[^>]*>first/);
		});
	});

	it('moves the image into the last list item when dropped on the list itself', async () => {
		const { store, editorElement } = await setupEditorForMove(
			'<p>first<img src="https://example.com/inline.png" alt="pic" /></p>' +
				'<ul><li>one</li><li>two</li></ul>'
		);
		const image = await findEditorImage();
		const list = within(editorElement).getByRole('list');
		mockDropPosition(list, 2);

		const { dropCaretShown } = dragAndDrop(image, list);

		expect(dropCaretShown).toBe(true);
		await waitFor(() => {
			expect(richTextOf(store)).toMatch(/two<\/span><img /);
		});
		expect(richTextOf(store).match(/<img /g)).toHaveLength(1);
	});

	it('moves the image into the paragraph of a table cell when dropped on the cell', async () => {
		const { store, editorElement } = await setupEditorForMove(
			'<p>first<img src="https://example.com/inline.png" alt="pic" /></p>' +
				'<table><tbody><tr><td><p>cell</p></td></tr></tbody></table>'
		);
		const image = await findEditorImage();
		const cell = within(editorElement).getByRole('cell');
		mockDropPosition(cell, 1);

		dragAndDrop(image, cell);

		await waitFor(() => {
			expect(richTextOf(store)).toMatch(/cell<\/span><img /);
		});
		expect(richTextOf(store).match(/<img /g)).toHaveLength(1);
	});

	it('restores the image position with a single undo', async () => {
		const { store, editor, editorElement } = await setupEditorForMove(MOVABLE_IMAGE_HTML);
		const image = await findEditorImage();
		const targetText = within(editorElement).getByText(TARGET_TEXT);
		mockDropPosition(getTextNode(targetText), 'second'.length);
		dragAndDrop(image, targetText);
		await waitFor(() => {
			expect(richTextOf(store)).toMatch(/second<\/span><img /);
		});

		act(() => {
			editor.dispatchCommand(UNDO_COMMAND, undefined);
		});

		await waitFor(() => {
			expect(richTextOf(store)).toMatch(/first<\/span><img /);
		});
		expect(richTextOf(store).match(/<img /g)).toHaveLength(1);
	});

	it('leaves the content unchanged when the image is dropped on itself', async () => {
		const { store } = await setupEditorForMove(MOVABLE_IMAGE_HTML);
		const image = await findEditorImage();
		mockDropPosition(image, 0);

		const { dropCaretShown } = dragAndDrop(image, image);
		flushStoreSync();

		expect(dropCaretShown).toBe(false);
		expect(richTextOf(store)).toBe(MOVABLE_IMAGE_HTML);
		expect(screen.getByRole('img')).toBe(image);
	});

	it('leaves the content unchanged when the drop position cannot be resolved', async () => {
		const { store, editorElement } = await setupEditorForMove(MOVABLE_IMAGE_HTML);
		const image = await findEditorImage();
		const targetText = within(editorElement).getByText(TARGET_TEXT);

		const { dropAllowed, dropCaretShown } = dragAndDrop(image, targetText);
		flushStoreSync();

		expect(dropAllowed).toBe(true);
		expect(dropCaretShown).toBe(false);
		expect(richTextOf(store)).toBe(MOVABLE_IMAGE_HTML);
	});

	it.each([
		['an image of another editor', JSON.stringify({ editorKey: 'other-editor', nodeKey: '1' })],
		['an unknown payload', 'not a json payload'],
		['an empty payload', '']
	])('ignores the drop of %s', async (_, payload) => {
		const { store, editorElement } = await setupEditorForMove(MOVABLE_IMAGE_HTML);
		const targetText = within(editorElement).getByText(TARGET_TEXT);
		mockDropPosition(getTextNode(targetText), 'second'.length);
		const { dataTransfer } = createDataTransfer();
		dataTransfer.setData(INLINE_IMAGE_DRAG_TYPE, payload);

		fireEvent.dragOver(targetText, { dataTransfer });
		expect(screen.queryByTestId(DROP_CARET_TEST_ID)).not.toBeInTheDocument();
		const dropHandled = !fireEvent.drop(targetText, { dataTransfer });
		flushStoreSync();

		expect(dropHandled).toBe(true);
		expect(richTextOf(store)).toBe(MOVABLE_IMAGE_HTML);
	});

	it('ignores a drop naming an image of this editor when its drag did not start here', async () => {
		const { store, editor, editorElement } = await setupEditorForMove(MOVABLE_IMAGE_HTML);
		const image = await findEditorImage();
		const nodeKey = editor.read(() => $getNearestNodeFromDOMNode(image)?.getKey());
		const targetText = within(editorElement).getByText(TARGET_TEXT);
		mockDropPosition(getTextNode(targetText), 'second'.length);
		const { dataTransfer } = createDataTransfer();
		dataTransfer.setData(
			INLINE_IMAGE_DRAG_TYPE,
			JSON.stringify({ editorKey: editor.getKey(), nodeKey })
		);

		const dropHandled = !fireEvent.drop(targetText, { dataTransfer });
		flushStoreSync();

		expect(dropHandled).toBe(true);
		expect(richTextOf(store)).toBe(MOVABLE_IMAGE_HTML);
	});

	it('hides the drop caret when the drag leaves the editor', async () => {
		const { editorElement } = await setupEditorForMove(MOVABLE_IMAGE_HTML);
		const image = await findEditorImage();
		const targetText = within(editorElement).getByText(TARGET_TEXT);
		mockDropPosition(getTextNode(targetText), 'second'.length);
		startDragOver(image, targetText);
		expect(screen.getByTestId(DROP_CARET_TEST_ID)).toBeInTheDocument();

		// Moving between elements of the editor keeps it
		fireDragLeave(editorElement, targetText);
		expect(screen.getByTestId(DROP_CARET_TEST_ID)).toBeInTheDocument();

		fireDragLeave(editorElement, document.body);
		expect(screen.queryByTestId(DROP_CARET_TEST_ID)).not.toBeInTheDocument();
	});

	it('hides the drop caret and keeps the content when the drag is cancelled', async () => {
		const { store, editorElement } = await setupEditorForMove(MOVABLE_IMAGE_HTML);
		const image = await findEditorImage();
		const targetText = within(editorElement).getByText(TARGET_TEXT);
		mockDropPosition(getTextNode(targetText), 'second'.length);
		const dataTransfer = startDragOver(image, targetText);
		expect(screen.getByTestId(DROP_CARET_TEST_ID)).toBeInTheDocument();

		fireEvent.dragEnd(image, { dataTransfer });
		flushStoreSync();

		expect(screen.queryByTestId(DROP_CARET_TEST_ID)).not.toBeInTheDocument();
		expect(richTextOf(store)).toBe(MOVABLE_IMAGE_HTML);
	});

	it('hides the drop caret when the editor becomes read-only during the drag', async () => {
		const { editor, editorElement } = await setupEditorForMove(MOVABLE_IMAGE_HTML);
		const image = await findEditorImage();
		const targetText = within(editorElement).getByText(TARGET_TEXT);
		mockDropPosition(getTextNode(targetText), 'second'.length);
		startDragOver(image, targetText);
		expect(screen.getByTestId(DROP_CARET_TEST_ID)).toBeInTheDocument();

		act(() => {
			editor.setEditable(false);
		});

		expect(screen.queryByTestId(DROP_CARET_TEST_ID)).not.toBeInTheDocument();
	});

	it('removes the drop caret when the editor is unmounted during the drag', async () => {
		const store = createEditorStore({ richText: MOVABLE_IMAGE_HTML });
		const { unmount } = renderRichTextEditor(store);
		const editorElement = screen.getByTestId(EDITOR_TESTID);
		const image = await findEditorImage();
		const targetText = within(editorElement).getByText(TARGET_TEXT);
		mockDropPosition(getTextNode(targetText), 'second'.length);
		startDragOver(image, targetText);
		expect(screen.getByTestId(DROP_CARET_TEST_ID)).toBeInTheDocument();

		unmount();

		expect(screen.queryByTestId(DROP_CARET_TEST_ID)).not.toBeInTheDocument();
	});
});
