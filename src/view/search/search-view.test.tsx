/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import type { QueryChip } from '@zextras/carbonio-search-ui';
import { combineReducers } from 'redux';

import SearchView from './search-view';
import appointmentsSliceReducer from '../../store/slices/appointments-slice';
import editorSliceReducer from '../../store/slices/editor-slice';
import invitesSliceReducer from '../../store/slices/invites-slice';
import { setupTest } from '@test-setup';

vi.mock('@zextras/carbonio-ui-commons', async () => ({
	...(await vi.importActual('@zextras/carbonio-ui-commons')),
	convertSearchChipToString: vi.fn((chip) => chip.label || chip.value || '')
}));

describe('SearchView', () => {
	const RESULTS_HEADER_TEST_ID = 'results-header';
	const mockStore = configureStore({
		reducer: combineReducers({
			appointments: appointmentsSliceReducer,
			editor: editorSliceReducer,
			invites: invitesSliceReducer
		})
	});

	const defaultProps = {
		useQuery: (): [
			QueryChip[],
			(query: QueryChip[] | ((q: QueryChip[]) => QueryChip[])) => void
		] => [[], vi.fn()],
		ResultsHeader: ({ label, labelType }: { label: string; labelType?: string }): JSX.Element => (
			<div data-testid={RESULTS_HEADER_TEST_ID} data-label-type={labelType}>
				{label}
			</div>
		),
		useDisableSearch: (): [boolean, (searchDisabled: boolean) => void] => [false, vi.fn()]
	};

	beforeEach(() => {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renders without crashing', (): void => {
		setupTest(<SearchView {...defaultProps} />, { store: mockStore });
		expect(screen.getByTestId(RESULTS_HEADER_TEST_ID)).toBeInTheDocument();
	});

	it('displays default result label when query is empty', (): void => {
		setupTest(<SearchView {...defaultProps} />, { store: mockStore });
		expect(screen.getByTestId(RESULTS_HEADER_TEST_ID)).toHaveTextContent('');
	});

	it('displays result label when query is provided', (): void => {
		const mockQuery = [{ id: '1', label: 'test' }];
		const mockUpdateQuery = vi.fn();
		const props = {
			...defaultProps,
			useQuery: (): [
				QueryChip[],
				(query: QueryChip[] | ((q: QueryChip[]) => QueryChip[])) => void
			] => [mockQuery, mockUpdateQuery]
		};
		setupTest(<SearchView {...props} />, { store: mockStore });
		expect(screen.getByTestId(RESULTS_HEADER_TEST_ID)).toHaveTextContent('Results for:');
	});

	describe('Special characters detection', () => {
		it('should detect special characters in regular keywords', (): void => {
			const mockQuery = [{ id: '1', label: 'test:query' }];
			const mockUpdateQuery = vi.fn();
			const props = {
				...defaultProps,
				useQuery: (): [
					QueryChip[],
					(query: QueryChip[] | ((q: QueryChip[]) => QueryChip[])) => void
				] => [mockQuery, mockUpdateQuery]
			};
			setupTest(<SearchView {...props} />, { store: mockStore });

			const resultsHeader = screen.getByTestId(RESULTS_HEADER_TEST_ID);
			expect(resultsHeader).toHaveAttribute('data-label-type', 'warning');
		});

		it('should NOT detect special characters in AdvancedSearchChip with queryChipsToAdvancedFiltersValue', (): void => {
			const mockQuery = [
				{
					id: '1',
					label: 'flagged:true',
					queryChipsToAdvancedFiltersValue: { flagged: true }
				}
			];
			const mockUpdateQuery = vi.fn();
			const props = {
				...defaultProps,
				useQuery: (): [
					QueryChip[],
					(query: QueryChip[] | ((q: QueryChip[]) => QueryChip[])) => void
				] => [mockQuery, mockUpdateQuery]
			};
			setupTest(<SearchView {...props} />, { store: mockStore });

			const resultsHeader = screen.getByTestId(RESULTS_HEADER_TEST_ID);
			expect(resultsHeader).not.toHaveAttribute('data-label-type', 'warning');
		});

		it('should NOT detect special characters in chips with isQueryFilter', (): void => {
			const mockQuery = [
				{
					id: '1',
					label: 'invalid:query',
					isQueryFilter: true
				}
			];
			const mockUpdateQuery = vi.fn();
			const props = {
				...defaultProps,
				useQuery: (): [
					QueryChip[],
					(query: QueryChip[] | ((q: QueryChip[]) => QueryChip[])) => void
				] => [mockQuery, mockUpdateQuery]
			};
			setupTest(<SearchView {...props} />, { store: mockStore });

			const resultsHeader = screen.getByTestId(RESULTS_HEADER_TEST_ID);
			expect(resultsHeader).not.toHaveAttribute('data-label-type', 'warning');
		});

		it('should detect special characters in mixed query with both regular and advanced chips', (): void => {
			const mockQuery = [
				{ id: '1', label: 'regular:keyword' },
				{
					id: '2',
					label: 'flagged:true',
					queryChipsToAdvancedFiltersValue: { flagged: true }
				},
				{
					id: '3',
					label: 'invalid:query',
					isQueryFilter: true
				}
			];
			const mockUpdateQuery = vi.fn();
			const props = {
				...defaultProps,
				useQuery: (): [
					QueryChip[],
					(query: QueryChip[] | ((q: QueryChip[]) => QueryChip[])) => void
				] => [mockQuery, mockUpdateQuery]
			};
			setupTest(<SearchView {...props} />, { store: mockStore });

			const resultsHeader = screen.getByTestId(RESULTS_HEADER_TEST_ID);
			expect(resultsHeader).toHaveAttribute('data-label-type', 'warning');
		});

		it('should NOT detect special characters when query is empty', (): void => {
			const mockQuery: any[] = [];
			const mockUpdateQuery = vi.fn();
			const props = {
				...defaultProps,
				useQuery: (): [
					QueryChip[],
					(query: QueryChip[] | ((q: QueryChip[]) => QueryChip[])) => void
				] => [mockQuery, mockUpdateQuery]
			};
			setupTest(<SearchView {...props} />, { store: mockStore });

			const resultsHeader = screen.getByTestId(RESULTS_HEADER_TEST_ID);
			expect(resultsHeader).not.toHaveAttribute('data-label-type', 'warning');
		});

		it('should detect multiple special characters in keywords', (): void => {
			const mockQuery = [
				{ id: '1', label: 'test!query' },
				{ id: '2', label: 'another#query' }
			];
			const mockUpdateQuery = vi.fn();
			const props = {
				...defaultProps,
				useQuery: (): [
					QueryChip[],
					(query: QueryChip[] | ((q: QueryChip[]) => QueryChip[])) => void
				] => [mockQuery, mockUpdateQuery]
			};
			setupTest(<SearchView {...props} />, { store: mockStore });

			const resultsHeader = screen.getByTestId(RESULTS_HEADER_TEST_ID);
			expect(resultsHeader).toHaveAttribute('data-label-type', 'warning');
		});
	});
});
