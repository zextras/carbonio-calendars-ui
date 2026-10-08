/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { setupTest, screen } from '@test-setup';

import { TableGridPicker } from '../table-grid-picker';

describe('TableGridPicker', () => {
	it('renders a default 10x10 grid', () => {
		setupTest(<TableGridPicker onSelect={vi.fn()} />);
		expect(screen.getByTestId('table-grid-cell-1-1')).toBeInTheDocument();
		expect(screen.getByTestId('table-grid-cell-10-10')).toBeInTheDocument();
		expect(screen.queryByTestId('table-grid-cell-11-1')).not.toBeInTheDocument();
	});

	it('calls onSelect with the hovered row/column when clicked', async () => {
		const onSelect = vi.fn();
		const { user } = setupTest(<TableGridPicker onSelect={onSelect} />);

		await user.click(screen.getByTestId('table-grid-cell-3-4'));

		expect(onSelect).toHaveBeenCalledWith(3, 4);
	});

	it('shows the hovered size and falls back to the insert-table label otherwise', async () => {
		const { user } = setupTest(<TableGridPicker onSelect={vi.fn()} />);

		expect(screen.getByText('lexical-label.insert_table')).toBeInTheDocument();

		await user.hover(screen.getByTestId('table-grid-cell-2-3'));

		expect(screen.getByText('lexical-label.table_size')).toBeInTheDocument();
	});
});
