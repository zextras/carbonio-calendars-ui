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
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import appointmentsSliceReducer from '../../store/slices/appointments-slice';
import editorSliceReducer from '../../store/slices/editor-slice';
import invitesSliceReducer from '../../store/slices/invites-slice';

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
		] => [[], jest.fn()],
		ResultsHeader: ({ label }: { label: string }): JSX.Element => (
			<div data-testid={RESULTS_HEADER_TEST_ID}>{label}</div>
		),
		useDisableSearch: (): [boolean, (searchDisabled: boolean) => void] => [false, jest.fn()]
	};

	beforeEach(() => {
		jest.spyOn(console, 'warn').mockImplementation(() => {
			// Mock implementation
		});
	});

	afterEach(() => {
		jest.restoreAllMocks();
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
		const mockUpdateQuery = jest.fn();
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
});
