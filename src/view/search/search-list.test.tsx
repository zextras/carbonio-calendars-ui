/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';
import { format } from 'date-fns';

import SearchList from './search-list';
import { setupTest } from '@test-setup';

describe('SearchList', () => {
	const defaultProps = {
		appointments: [],
		loadMore: vi.fn(),
		loading: false,
		searchDisabled: false,
		setShowAdvanceFilters: vi.fn(),
		query: [{ id: '1', label: 'test' }]
	};

	const FROM_DATE_KEY = 'search.from_date';
	const TO_DATE_KEY = 'search.to_date';

	it('should format dateStart correctly', () => {
		const dateStart = new Date('2024-04-15').getTime();
		setupTest(<SearchList {...defaultProps} dateStart={dateStart} dateEnd={Date.now()} />);
		const formattedDate = format(new Date(dateStart), 'dd/MM/yyyy');
		expect(screen.getByText(`${FROM_DATE_KEY} ${formattedDate}`)).toBeInTheDocument();
	});

	it('should format dateEnd correctly', () => {
		const dateEnd = new Date('2024-04-20').getTime();
		setupTest(<SearchList {...defaultProps} dateStart={Date.now()} dateEnd={dateEnd} />);
		const formattedDate = format(new Date(dateEnd), 'dd/MM/yyyy');
		expect(screen.getByText(`${TO_DATE_KEY} ${formattedDate}`)).toBeInTheDocument();
	});

	it('should update date strings when dates change', () => {
		const initialDateStart = new Date('2024-04-15').getTime();
		const initialDateEnd = new Date('2024-04-20').getTime();
		const { rerender } = setupTest(
			<SearchList {...defaultProps} dateStart={initialDateStart} dateEnd={initialDateEnd} />
		);
		const newDateStart = new Date('2024-04-16').getTime();
		const newDateEnd = new Date('2024-04-21').getTime();
		rerender(<SearchList {...defaultProps} dateStart={newDateStart} dateEnd={newDateEnd} />);
		const newFormattedStartDate = format(new Date(newDateStart), 'dd/MM/yyyy');
		const newFormattedEndDate = format(new Date(newDateEnd), 'dd/MM/yyyy');
		expect(screen.getByText(`${FROM_DATE_KEY} ${newFormattedStartDate}`)).toBeInTheDocument();
		expect(screen.getByText(`${TO_DATE_KEY} ${newFormattedEndDate}`)).toBeInTheDocument();
	});

	it('should handle different date formats correctly', () => {
		const dateStart = new Date('2024-12-31').getTime();
		const dateEnd = new Date('2025-01-01').getTime();
		setupTest(<SearchList {...defaultProps} dateStart={dateStart} dateEnd={dateEnd} />);
		const formattedStartDate = format(new Date(dateStart), 'dd/MM/yyyy');
		const formattedEndDate = format(new Date(dateEnd), 'dd/MM/yyyy');
		expect(screen.getByText(`${FROM_DATE_KEY} ${formattedStartDate}`)).toBeInTheDocument();
		expect(screen.getByText(`${TO_DATE_KEY} ${formattedEndDate}`)).toBeInTheDocument();
	});
});
