/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable testing-library/prefer-user-event -- user-event does not support dropping or pasting files */
/* eslint-disable max-classes-per-file -- jsdom lacks both DragEvent and ClipboardEvent */
import { act, fireEvent, waitFor } from '@testing-library/react';
import { type LexicalEditor, UNDO_COMMAND } from 'lexical';

import {
	createEditorStore,
	renderRichTextEditor,
	richTextOf
} from '../../tests/lexical-editor-test-utils';
import { screen, within } from '@test-setup';

const EDITOR_TESTID = 'editor-composer';
const INITIAL_TEXT = 'description';
const INITIAL_HTML = `<p>${INITIAL_TEXT}</p>`;
const UNSUPPORTED_DROP_MESSAGE = 'snackbar.dropped_file_type_not_supported';
// Longer than the debounce of the editor -> store sync
const STORE_SYNC_DELAY = 600;
const PDF_TYPE = 'application/pdf';

// 1x1 transparent PNG
const PNG_BYTES = Uint8Array.from(
	atob(
		'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
	),
	(char) => char.charCodeAt(0)
);

function imageFile(name: string, type = 'image/png'): File {
	return new File([PNG_BYTES], name, { type });
}

/**
 * The files of a drop or paste, as the browsers expose them: their data are
 * not available as text.
 */
function filesTransfer(files: Array<File>): DataTransfer {
	return {
		types: ['Files'],
		files: files as unknown as FileList,
		getData: (): string => ''
	} as unknown as DataTransfer;
}

/*
 * jsdom implements neither DragEvent nor ClipboardEvent, which Lexical tells
 * apart by their class.
 */
class DragEventMock extends Event {
	readonly clientX = 0;

	readonly clientY = 0;

	constructor(
		type: string,
		readonly dataTransfer: DataTransfer
	) {
		super(type, { bubbles: true, cancelable: true });
	}
}

class ClipboardEventMock extends Event {
	constructor(
		type: string,
		readonly clipboardData: DataTransfer
	) {
		super(type, { bubbles: true, cancelable: true });
	}
}

function getEditorElement(): HTMLElement {
	return screen.getByTestId(EDITOR_TESTID);
}

function getTextNode(element: Element): Text {
	const textNode = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode();
	if (!(textNode instanceof Text)) {
		throw new Error('missing text node');
	}
	return textNode;
}

async function setupEditor(): Promise<{
	store: ReturnType<typeof createEditorStore>;
	editor: LexicalEditor;
}> {
	const store = createEditorStore({ richText: INITIAL_HTML });
	renderRichTextEditor(store);
	const editorElement = getEditorElement();
	await within(editorElement).findByText(INITIAL_TEXT);
	const editor = (editorElement as HTMLElement & { __lexicalEditor: LexicalEditor })
		.__lexicalEditor;
	return { store, editor };
}

/**
 * Drops the files on the initial text, at `offset` (jsdom has no layout, so
 * the DOM position under the pointer is provided through a mocked
 * `document.caretPositionFromPoint`). Returns whether the browser default
 * action (opening the files) was prevented.
 */
function dropFiles(files: Array<File>, offset = INITIAL_TEXT.length): boolean {
	const editorElement = getEditorElement();
	const textNode = getTextNode(editorElement);
	Object.defineProperty(document, 'caretPositionFromPoint', {
		configurable: true,
		value: vi.fn(() => ({ offsetNode: textNode, offset }))
	});
	return !fireEvent(
		textNode.parentElement ?? editorElement,
		new DragEventMock('drop', filesTransfer(files))
	);
}

function pasteFiles(files: Array<File>): void {
	fireEvent(getEditorElement(), new ClipboardEventMock('paste', filesTransfer(files)));
}

/**
 * Tracks the file reads started from now on. The returned function resolves
 * once all of them are over (and the editor has handled their result).
 */
function trackFileReads(): () => Promise<void> {
	const reads: Array<Promise<void>> = [];
	const originalRead = vi.fn(FileReader.prototype.readAsDataURL);
	vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function read(
		this: FileReader,
		blob: Blob
	) {
		reads.push(
			new Promise((resolve) => {
				this.addEventListener('loadend', () => resolve());
			})
		);
		originalRead.call(this, blob);
	});
	return async (): Promise<void> => {
		await act(async () => {
			await Promise.all(reads);
		});
	};
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

describe('Inserting image files in the editor', () => {
	beforeEach(() => {
		vi.stubGlobal('DragEvent', DragEventMock);
		vi.stubGlobal('ClipboardEvent', ClipboardEventMock);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		Reflect.deleteProperty(document, 'caretPositionFromPoint');
	});

	it('embeds a dropped image as a data image at the drop point', async () => {
		const { store } = await setupEditor();

		const defaultPrevented = dropFiles([imageFile('pic.png')], 4);

		expect(defaultPrevented).toBe(true);
		await waitFor(() => {
			expect(richTextOf(store)).toMatch(/desc<\/span><img [^>]*src="data:image\/png;base64,/);
		});
		expect(richTextOf(store)).toMatch(/<img [^>]*><span[^>]*>ription</);
		expect(within(getEditorElement()).getByRole('img')).toBeInTheDocument();
		// As TinyMCE, the file name is not reused
		expect(richTextOf(store)).not.toContain('pic');
	});

	it.each(['image/png', 'image/jpeg', 'image/gif', 'image/bmp', 'image/webp'])(
		'embeds a pasted %s image',
		async (type) => {
			const { store } = await setupEditor();

			pasteFiles([imageFile('pic', type)]);

			await waitFor(() => {
				expect(richTextOf(store)).toContain(`src="data:${type};base64,`);
			});
		}
	);

	it('embeds an image whatever its size', async () => {
		const { store } = await setupEditor();
		const largeImage = imageFile('large.png');
		Object.defineProperty(largeImage, 'size', { value: 50 * 1024 * 1024 });

		dropFiles([largeImage]);

		await waitFor(() => {
			expect(richTextOf(store)).toContain('src="data:image/png;base64,');
		});
	});

	it('embeds all the images of a drop with a single undo step', async () => {
		const { store, editor } = await setupEditor();

		dropFiles([imageFile('a.png'), imageFile('b.gif', 'image/gif')]);

		await waitFor(() => {
			expect(richTextOf(store)).toMatch(
				/data:image\/png;base64,[^"]*"[^>]*><img [^>]*data:image\/gif/
			);
		});

		act(() => {
			editor.dispatchCommand(UNDO_COMMAND, undefined);
		});

		await waitFor(() => {
			expect(richTextOf(store)).not.toContain('<img');
		});
	});

	it.each([
		['an SVG image', 'image/svg+xml'],
		['a TIFF image', 'image/tiff'],
		['a document', PDF_TYPE],
		['a file of unknown type', '']
	])('reports a drop of %s without embedding it', async (_, type) => {
		const { store } = await setupEditor();
		const readSpy = vi.spyOn(FileReader.prototype, 'readAsDataURL');

		const defaultPrevented = dropFiles([imageFile('file', type)]);
		flushStoreSync();

		expect(defaultPrevented).toBe(true);
		expect(await screen.findByText(UNSUPPORTED_DROP_MESSAGE)).toBeVisible();
		expect(readSpy).not.toHaveBeenCalled();
		expect(richTextOf(store)).toBe(INITIAL_HTML);
	});

	it('silently ignores a paste without supported images', async () => {
		const { store } = await setupEditor();
		const readSpy = vi.spyOn(FileReader.prototype, 'readAsDataURL');

		pasteFiles([imageFile('file', PDF_TYPE)]);
		flushStoreSync();

		expect(screen.queryByText(UNSUPPORTED_DROP_MESSAGE)).not.toBeInTheDocument();
		expect(readSpy).not.toHaveBeenCalled();
		expect(richTextOf(store)).toBe(INITIAL_HTML);
	});

	it('does not report a paste that follows a drop the editor could not place', async () => {
		const { store } = await setupEditor();
		const editorElement = getEditorElement();
		Object.defineProperty(document, 'caretPositionFromPoint', {
			configurable: true,
			value: vi.fn(() => null)
		});
		fireEvent(
			editorElement,
			new DragEventMock('drop', filesTransfer([imageFile('file', PDF_TYPE)]))
		);

		pasteFiles([imageFile('file', PDF_TYPE)]);
		flushStoreSync();

		expect(screen.queryByText(UNSUPPORTED_DROP_MESSAGE)).not.toBeInTheDocument();
		expect(richTextOf(store)).toBe(INITIAL_HTML);
	});

	it('embeds the supported images of a drop and silently ignores the other files', async () => {
		const { store } = await setupEditor();

		dropFiles([imageFile('ok.png'), imageFile('doc', PDF_TYPE)]);

		await waitFor(() => {
			expect(richTextOf(store).match(/<img /g)).toHaveLength(1);
		});
		expect(screen.queryByText(UNSUPPORTED_DROP_MESSAGE)).not.toBeInTheDocument();
	});

	it('does not embed anything when an image cannot be read', async () => {
		const { store } = await setupEditor();
		const readSpy = vi
			.spyOn(FileReader.prototype, 'readAsDataURL')
			.mockImplementation(function fail(this: FileReader) {
				this.dispatchEvent(new ProgressEvent('error'));
			});

		dropFiles([imageFile('broken.png')]);
		flushStoreSync();

		expect(readSpy).toHaveBeenCalled();
		expect(richTextOf(store)).toBe(INITIAL_HTML);
		expect(screen.queryByText(UNSUPPORTED_DROP_MESSAGE)).not.toBeInTheDocument();
	});

	it('does not embed an image read after the editor turned read-only', async () => {
		const { store, editor } = await setupEditor();
		const fileReadsDone = trackFileReads();

		dropFiles([imageFile('pic.png')]);
		act(() => {
			editor.setEditable(false);
		});
		await fileReadsDone();
		flushStoreSync();

		expect(within(getEditorElement()).queryByRole('img')).not.toBeInTheDocument();
		expect(richTextOf(store)).toBe(INITIAL_HTML);
	});
});
