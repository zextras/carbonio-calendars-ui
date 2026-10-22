/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { fireEvent, waitFor } from '@testing-library/react';
import { $getSelection, $isRangeSelection, type LexicalEditor, type LexicalNode } from 'lexical';

import {
	createEditorStore,
	renderRichTextEditor,
	richTextOf
} from '../../tests/lexical-editor-test-utils';
import { screen, within } from '@test-setup';

const CHEVRON_ICON = 'icon: ChevronDown';
const EDITOR_TESTID = 'editor-composer';

type TestUser = ReturnType<typeof renderRichTextEditor>['user'];

function getEditor(element: HTMLElement): LexicalEditor {
	return (element as unknown as { __lexicalEditor: LexicalEditor }).__lexicalEditor;
}

/** Renders the editor and inserts a 2x2 table through the toolbar grid picker. */
async function setupEditorWithTable(): Promise<{
	store: ReturnType<typeof createEditorStore>;
	user: TestUser;
	table: HTMLElement;
	editor: LexicalEditor;
}> {
	const store = createEditorStore({ richText: '<p><br></p>' });
	const { user } = renderRichTextEditor(store);

	await user.click(screen.getByTestId(EDITOR_TESTID));
	await user.click(screen.getByRole('button', { name: 'lexical-label.table' }));
	await user.click(await screen.findByTestId('table-grid-cell-2-2'));

	const editorElement = screen.getByTestId(EDITOR_TESTID);
	const table = await within(editorElement).findByRole('table');
	return { store, user, table, editor: getEditor(editorElement) };
}

/** Opens the floating per-cell action menu (anchored to the selected cell). */
async function openCellMenu(user: TestUser): Promise<void> {
	await user.click(await screen.findByRoleWithIcon('button', { icon: CHEVRON_ICON }));
}

/**
 * Returns the index of the table cell holding the caret, read from Lexical's
 * own selection model (not `window.getSelection()` — interacting with the
 * portaled menu can leave native DOM focus/selection out of sync with
 * Lexical's internal model under jsdom, which has no real focus-management
 * behavior to reconcile the two).
 */
function caretCellIndex(editor: LexicalEditor, table: HTMLElement): number {
	const cellKey = editor.getEditorState().read(() => {
		const selection = $getSelection();
		if (!$isRangeSelection(selection)) {
			return null;
		}
		let node: LexicalNode | null = selection.anchor.getNode();
		while (node !== null && node.getType() !== 'tablecell') {
			node = node.getParent();
		}
		return node?.getKey() ?? null;
	});
	if (cellKey === null) {
		return -1;
	}
	const cellElement = editor.getElementByKey(cellKey);
	return within(table)
		.getAllByRole('cell')
		.findIndex((cell) => cellElement !== null && cell === cellElement);
}

describe('TableActionMenuPlugin', () => {
	it('inserts a column to the right', async () => {
		const { user, table } = await setupEditorWithTable();
		expect(within(table).getAllByRole('cell')).toHaveLength(4);

		await openCellMenu(user);
		await user.click(await screen.findByText('lexical-label.table_insert_column_right'));

		await waitFor(() => {
			expect(within(table).getAllByRole('cell')).toHaveLength(6);
		});
	});

	// The table is inserted with the caret in its first cell: after every
	// insertion the caret must still be in that same (possibly shifted) cell.
	it('keeps the caret in the original cell when inserting a column to the right', async () => {
		const { user, table, editor } = await setupEditorWithTable();

		await openCellMenu(user);
		await user.click(await screen.findByText('lexical-label.table_insert_column_right'));
		await waitFor(() => {
			expect(within(table).getAllByRole('cell')).toHaveLength(6);
		});

		expect(caretCellIndex(editor, table)).toBe(0);
	});

	it('keeps the caret in the original cell when inserting a column to the left', async () => {
		const { user, table, editor } = await setupEditorWithTable();

		await openCellMenu(user);
		await user.click(await screen.findByText('lexical-label.table_insert_column_left'));
		await waitFor(() => {
			expect(within(table).getAllByRole('cell')).toHaveLength(6);
		});

		// The original cell is shifted right by the new column.
		expect(caretCellIndex(editor, table)).toBe(1);
	});

	it('keeps the caret in the original cell when inserting a row above', async () => {
		const { user, table, editor } = await setupEditorWithTable();

		await openCellMenu(user);
		await user.click(await screen.findByText('lexical-label.table_insert_row_above'));
		await waitFor(() => {
			expect(within(table).getAllByRole('row')).toHaveLength(3);
		});

		// The original cell is shifted down by the new row.
		expect(caretCellIndex(editor, table)).toBe(2);
	});

	it('keeps the caret in the original cell when inserting a row below', async () => {
		const { user, table, editor } = await setupEditorWithTable();

		await openCellMenu(user);
		await user.click(await screen.findByText('lexical-label.table_insert_row_below'));
		await waitFor(() => {
			expect(within(table).getAllByRole('row')).toHaveLength(3);
		});

		expect(caretCellIndex(editor, table)).toBe(0);
	});

	it('deletes a row', async () => {
		const { user, table } = await setupEditorWithTable();
		expect(within(table).getAllByRole('row')).toHaveLength(2);

		await openCellMenu(user);
		await user.click(await screen.findByText('lexical-label.table_delete_row'));

		await waitFor(() => {
			expect(within(table).getAllByRole('row')).toHaveLength(1);
		});
	});

	it('deletes a column', async () => {
		const { user, table } = await setupEditorWithTable();
		expect(within(table).getAllByRole('cell')).toHaveLength(4);

		await openCellMenu(user);
		await user.click(await screen.findByText('lexical-label.table_delete_column'));

		await waitFor(() => {
			expect(within(table).getAllByRole('cell')).toHaveLength(2);
		});
	});

	it('deletes the whole table', async () => {
		const { user } = await setupEditorWithTable();
		const editorElement = screen.getByTestId(EDITOR_TESTID);

		await openCellMenu(user);
		await user.click(await screen.findByText('lexical-label.table_delete'));

		await waitFor(() => {
			expect(within(editorElement).queryByRole('table')).not.toBeInTheDocument();
		});
	});

	it('toggles the header row, turning the cell into a header cell', async () => {
		const { user, table } = await setupEditorWithTable();
		expect(within(table).queryByRole('columnheader')).not.toBeInTheDocument();

		await openCellMenu(user);
		await user.click(await screen.findByText('lexical-label.table_toggle_row_header'));

		expect(await within(table).findByRole('columnheader')).toBeInTheDocument();
	});

	it('sets the cell background color from the color picker', async () => {
		const { store, user } = await setupEditorWithTable();

		// The portal holding the chevron also holds the hidden color input, an
		// aria-hidden native input with no accessible query.
		await openCellMenu(user);
		// eslint-disable-next-line testing-library/no-node-access
		const colorInput = document.querySelector<HTMLInputElement>(
			'.cal-lexical-table-cell-action-button input[type="color"]'
		);
		if (colorInput === null) {
			throw new Error('cell background color input not found');
		}

		// eslint-disable-next-line testing-library/prefer-user-event -- native color input has no user-event equivalent
		fireEvent.change(colorInput, { target: { value: '#ff0000' } });

		await waitFor(() => {
			expect(richTextOf(store)).toContain('background-color: rgb(255, 0, 0)');
		});
	});

	it('does not offer the merge entry for a single selected cell', async () => {
		const { user } = await setupEditorWithTable();

		await openCellMenu(user);

		expect(await screen.findByText('lexical-label.table_insert_row_above')).toBeInTheDocument();
		expect(screen.queryByText('lexical-label.table_merge_cells')).not.toBeInTheDocument();
	});
});
