/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { screen, within } from '@testing-library/react';

import { AdvancedFilterModal, AdvancedFilterModalProps } from './advance-filter-modal';
import { DEFAULT_DATE_START, DEFAULT_DATE_END } from '../../constants/advance-filter-modal';
import { setupTest } from '@test-setup';
import { TEST_SELECTORS } from 'constants/test-utils';

vi.mock('@zextras/carbonio-shell-ui', () => ({
	t: (key: string, fallback?: string): string => fallback ?? key
}));

vi.mock('../../constants/advance-filter-modal', () => ({
	DEFAULT_DATE_START: 1744329600000, // 1744329600000 = April 11, 2025, 00:00:00 UTC
	DEFAULT_DATE_END: 1745539200000 // 1745539200000 = April 25, 2025, 00:00:00 UTC
}));

const MOCKED_NOW = new Date('2025-04-18T00:00:00Z');

beforeAll(() => {
	vi.useFakeTimers().setSystemTime(MOCKED_NOW);
});

describe('AdvancedFilterModal', () => {
	it('reset filters button should be enabled if query is not empty', async () => {
		const properties: AdvancedFilterModalProps = {
			open: true,
			onClose: vi.fn(),
			query: [
				{
					id: '1',
					label: 'test',
					value: 'test'
				}
			],
			updateQuery: vi.fn(),
			dateStart: DEFAULT_DATE_START,
			dateEnd: DEFAULT_DATE_END,
			setDateStart: vi.fn(),
			setDateEnd: vi.fn()
		};
		setupTest(<AdvancedFilterModal {...properties} />);

		const fieldLabel = screen.getByText(/Advanced Filters/i);
		expect(fieldLabel).toBeInTheDocument();

		const resetButton = await screen.findByRole('button', { name: /reset filters/i });
		expect(resetButton).toBeEnabled();
	});

	it('reset filters button should be enabled if dateStart is different from default', async () => {
		const properties: AdvancedFilterModalProps = {
			open: true,
			onClose: vi.fn(),
			query: [],
			updateQuery: vi.fn(),
			dateStart: DEFAULT_DATE_START,
			dateEnd: DEFAULT_DATE_END,
			setDateStart: vi.fn(),
			setDateEnd: vi.fn()
		};
		const { user } = setupTest(<AdvancedFilterModal {...properties} />);

		const fieldLabel = screen.getByText(/Advanced Filters/i);
		expect(fieldLabel).toBeInTheDocument();

		const calendarButtons = screen.getAllByTestId(TEST_SELECTORS.ICONS.unSelectedCalendar);
		await user.click(calendarButtons[0]);

		const dateToSelect = screen.getByRole('option', { name: /Choose Monday, April 14th, 2025/i });
		expect(dateToSelect).toBeInTheDocument();
		await user.click(dateToSelect);

		const resetButton = await screen.findByRole('button', { name: /reset filters/i });
		expect(resetButton).toBeEnabled();
	});

	it('reset filters button should be enabled if dateEnd is different from default', async () => {
		const properties: AdvancedFilterModalProps = {
			open: true,
			onClose: vi.fn(),
			query: [],
			updateQuery: vi.fn(),
			dateStart: DEFAULT_DATE_START,
			dateEnd: DEFAULT_DATE_END,
			setDateStart: vi.fn(),
			setDateEnd: vi.fn()
		};
		const { user } = setupTest(<AdvancedFilterModal {...properties} />);

		const fieldLabel = screen.getByText(/Advanced Filters/i);
		expect(fieldLabel).toBeInTheDocument();

		const calendarButtons = screen.getAllByTestId(TEST_SELECTORS.ICONS.unSelectedCalendar);
		await user.click(calendarButtons[1]);

		const dateToSelect = screen.getByRole('option', { name: /Choose Monday, April 14th, 2025/i });
		expect(dateToSelect).toBeInTheDocument();
		await user.click(dateToSelect);

		const resetButton = await screen.findByRole('button', { name: /reset filters/i });
		expect(resetButton).toBeEnabled();
	});

	it('reset filters button should be disabled when there are no query filters and dates are set to default values', async () => {
		const properties: AdvancedFilterModalProps = {
			open: true,
			onClose: vi.fn(),
			query: [],
			updateQuery: vi.fn(),
			dateStart: DEFAULT_DATE_START,
			dateEnd: DEFAULT_DATE_END,
			setDateStart: vi.fn(),
			setDateEnd: vi.fn()
		};

		setupTest(<AdvancedFilterModal {...properties} />);
		const fieldLabel = screen.getByText(/Advanced Filters/i);
		expect(fieldLabel).toBeInTheDocument();

		const resetButton = await screen.findByRole('button', { name: /reset filters/i });
		expect(resetButton).toBeDisabled();
	});

	it('should reset filters when reset filters button is clicked', async () => {
		const FIXED_TIMESTAMP = 1744405500000;
		const FIXED_DATE = new Date(FIXED_TIMESTAMP);

		const properties: AdvancedFilterModalProps = {
			open: true,
			onClose: vi.fn(),
			query: [
				{
					id: '1',
					label: 'test',
					value: 'test'
				}
			],
			updateQuery: vi.fn(),
			dateStart: FIXED_TIMESTAMP,
			dateEnd: FIXED_TIMESTAMP,
			setDateStart: vi.fn(),
			setDateEnd: vi.fn()
		};

		const { user } = setupTest(<AdvancedFilterModal {...properties} />);

		const chipsBeforeReset = screen.queryAllByTestId('chip');
		expect(chipsBeforeReset).toHaveLength(3);
		const keywordsChipBeforeReset = chipsBeforeReset[0];
		expect(keywordsChipBeforeReset).toHaveAttribute('id', '1');
		// eslint-disable-next-line jest-dom/prefer-to-have-value
		expect(keywordsChipBeforeReset).toHaveAttribute('value', 'test');

		const fromDateChipBeforeReset = chipsBeforeReset[1];
		// eslint-disable-next-line jest-dom/prefer-to-have-value
		expect(fromDateChipBeforeReset).toHaveAttribute('value', FIXED_DATE.toString());

		const toDateChipBeforeReset = chipsBeforeReset[2];
		// eslint-disable-next-line jest-dom/prefer-to-have-value
		expect(toDateChipBeforeReset).toHaveAttribute('value', FIXED_DATE.toString());

		const resetButton = await screen.findByRole('button', { name: /reset filters/i });
		expect(resetButton).toBeEnabled();
		await user.click(resetButton);

		const chipsAfterReset = screen.queryAllByTestId('chip');
		expect(chipsAfterReset).toHaveLength(2);
		const fromDateChipAfterReset = chipsAfterReset[0];
		// eslint-disable-next-line jest-dom/prefer-to-have-value
		expect(fromDateChipAfterReset).toHaveAttribute(
			'value',
			new Date(DEFAULT_DATE_START).toString()
		);

		const toDateChipAfterReset = chipsAfterReset[1];
		// eslint-disable-next-line jest-dom/prefer-to-have-value
		expect(toDateChipAfterReset).toHaveAttribute('value', new Date(DEFAULT_DATE_END).toString());
	});

	it('should set queryToBe when Search button is pressed', async () => {
		vi.spyOn(console, 'error');
		const properties: AdvancedFilterModalProps = {
			open: true,
			onClose: vi.fn(),
			query: [],
			updateQuery: vi.fn(),
			dateStart: DEFAULT_DATE_START,
			dateEnd: DEFAULT_DATE_END,
			setDateStart: vi.fn(),
			setDateEnd: vi.fn()
		};

		const { user } = setupTest(<AdvancedFilterModal {...properties} />);

		const keywordInputEle = screen.getByPlaceholderText('Keywords');
		await user.type(keywordInputEle, 'test');
		await user.type(keywordInputEle, '[Enter]');

		const searchButton = screen.getByRole('button', { name: /search/i });
		await user.click(searchButton);

		expect(properties.updateQuery).toHaveBeenCalledWith([
			expect.objectContaining({
				label: 'test'
			})
		]);
	});

	it('should update fromDate and call onConfirm when date is selected and search button is clicked', async () => {
		vi.spyOn(console, 'error');
		const updateQuery = vi.fn();
		const setDateStart = vi.fn();
		const setDateEnd = vi.fn();
		const onClose = vi.fn();

		const properties: AdvancedFilterModalProps = {
			open: true,
			onClose,
			query: [
				{
					id: '1',
					label: 'Test Query'
				}
			],
			updateQuery,
			dateStart: DEFAULT_DATE_START,
			dateEnd: DEFAULT_DATE_END,
			setDateStart,
			setDateEnd
		};

		const { user, getByRole } = setupTest(<AdvancedFilterModal {...properties} />);

		const calendarButtons = screen.getAllByTestId(TEST_SELECTORS.ICONS.unSelectedCalendar);
		await user.click(calendarButtons[0]);
		const fromDateToSelect = screen.getByRole('option', {
			name: /Choose Saturday, April 12th, 2025/i
		});
		await user.click(fromDateToSelect);

		const searchButton = getByRole('button', { name: /search/i });
		await user.click(searchButton);

		expect(updateQuery).toHaveBeenCalledWith([
			expect.objectContaining({
				id: '1',
				label: 'Test Query'
			})
		]);
		expect(setDateStart).toHaveBeenCalled();
		expect(setDateEnd).toHaveBeenCalled();
		expect(onClose).toHaveBeenCalled();
	});

	it('should update endDate and call onConfirm when date is selected and search button is clicked', async () => {
		vi.spyOn(console, 'error');
		const updateQuery = vi.fn();
		const setDateStart = vi.fn();
		const setDateEnd = vi.fn();
		const onClose = vi.fn();

		const properties: AdvancedFilterModalProps = {
			open: true,
			onClose,
			query: [
				{
					id: '1',
					label: 'Test Query'
				}
			],
			updateQuery,
			dateStart: DEFAULT_DATE_START,
			dateEnd: DEFAULT_DATE_END,
			setDateStart,
			setDateEnd
		};

		const { user, getByRole } = setupTest(<AdvancedFilterModal {...properties} />);

		const calendarButtons = screen.getAllByTestId(TEST_SELECTORS.ICONS.unSelectedCalendar);
		await user.click(calendarButtons[2]);
		const toDateToSelect = screen.getByRole('option', { name: /Choose Sunday, April 20th, 2025/i });
		expect(toDateToSelect).toBeInTheDocument();
		await user.click(toDateToSelect);

		const searchButton = getByRole('button', { name: /search/i });
		await user.click(searchButton);

		const endCall = setDateEnd.mock.calls[0][0];
		const endDateString = new Date(endCall).toISOString().slice(0, 10);
		const defaultEndDateString = new Date(DEFAULT_DATE_END).toISOString().slice(0, 10);
		expect(endDateString).not.toBe(defaultEndDateString);
		expect(endDateString).toBe('2025-04-20');

		expect(updateQuery).toHaveBeenCalledWith([
			expect.objectContaining({
				id: '1',
				label: 'Test Query'
			})
		]);
		expect(onClose).toHaveBeenCalled();
	});

	it('should not add duplicate keywords to the query', async () => {
		const properties: AdvancedFilterModalProps = {
			open: true,
			onClose: vi.fn(),
			query: [
				{
					id: '1',
					label: 'test',
					value: 'test'
				}
			],
			updateQuery: vi.fn(),
			dateStart: DEFAULT_DATE_START,
			dateEnd: DEFAULT_DATE_END,
			setDateStart: vi.fn(),
			setDateEnd: vi.fn()
		};

		const { user } = setupTest(<AdvancedFilterModal {...properties} />);

		const keywordInputEle = screen.getByPlaceholderText('Keywords');
		await user.type(keywordInputEle, 'test');
		await user.type(keywordInputEle, '[Enter]');

		expect(properties.updateQuery).not.toHaveBeenCalled();
	});

	describe('AdvancedSearchChip filtering', () => {
		it('should exclude AdvancedSearchChip with queryChipsToAdvancedFiltersValue from keywords', async () => {
			const properties: AdvancedFilterModalProps = {
				open: true,
				onClose: vi.fn(),
				query: [
					{
						id: '1',
						label: 'regular keyword',
						value: 'regular keyword'
					},
					{
						id: '2',
						label: 'flagged:true',
						value: 'flagged:true',
						queryChipsToAdvancedFiltersValue: { flagged: true }
					},
					{
						id: '3',
						label: 'shared:true',
						value: 'shared:true',
						queryChipsToAdvancedFiltersValue: { shared: true }
					}
				],
				updateQuery: vi.fn(),
				dateStart: DEFAULT_DATE_START,
				dateEnd: DEFAULT_DATE_END,
				setDateStart: vi.fn(),
				setDateEnd: vi.fn()
			};

			setupTest(<AdvancedFilterModal {...properties} />);

			const keywordChips = screen
				.queryAllByTestId('chip')
				.filter((chip) => !within(chip).queryByTestId(TEST_SELECTORS.ICONS.unSelectedCalendar));
			expect(keywordChips).toHaveLength(1);

			const regularChip = keywordChips[0];
			expect(regularChip).toHaveAttribute('id', '1');
			// eslint-disable-next-line jest-dom/prefer-to-have-value
			expect(regularChip).toHaveAttribute('value', 'regular keyword');
		});

		it('should exclude chips with isQueryFilter from keywords', async () => {
			const properties: AdvancedFilterModalProps = {
				open: true,
				onClose: vi.fn(),
				query: [
					{
						id: '1',
						label: 'valid keyword',
						value: 'valid keyword'
					},
					{
						id: '2',
						label: 'invalid:query',
						value: 'invalid:query',
						isQueryFilter: true
					}
				],
				updateQuery: vi.fn(),
				dateStart: DEFAULT_DATE_START,
				dateEnd: DEFAULT_DATE_END,
				setDateStart: vi.fn(),
				setDateEnd: vi.fn()
			};

			setupTest(<AdvancedFilterModal {...properties} />);

			const keywordChips = screen
				.queryAllByTestId('chip')
				.filter((chip) => !within(chip).queryByTestId(TEST_SELECTORS.ICONS.unSelectedCalendar));
			expect(keywordChips).toHaveLength(1);

			const validChip = keywordChips[0];
			expect(validChip).toHaveAttribute('id', '1');
			// eslint-disable-next-line jest-dom/prefer-to-have-value
			expect(validChip).toHaveAttribute('value', 'valid keyword');
		});

		it('should handle mixed query with regular keywords, AdvancedSearchChip, and isQueryFilter', async () => {
			const properties: AdvancedFilterModalProps = {
				open: true,
				onClose: vi.fn(),
				query: [
					{
						id: '1',
						label: 'keyword1',
						value: 'keyword1'
					},
					{
						id: '2',
						label: 'keyword2',
						value: 'keyword2'
					},
					{
						id: '3',
						label: 'flagged:true',
						value: 'flagged:true',
						queryChipsToAdvancedFiltersValue: { flagged: true }
					},
					{
						id: '4',
						label: 'invalid:query',
						value: 'invalid:query',
						isQueryFilter: true
					}
				],
				updateQuery: vi.fn(),
				dateStart: DEFAULT_DATE_START,
				dateEnd: DEFAULT_DATE_END,
				setDateStart: vi.fn(),
				setDateEnd: vi.fn()
			};

			setupTest(<AdvancedFilterModal {...properties} />);

			const keywordChips = screen
				.queryAllByTestId('chip')
				.filter((chip) => !within(chip).queryByTestId(TEST_SELECTORS.ICONS.unSelectedCalendar));
			expect(keywordChips).toHaveLength(2);

			const chip1 = keywordChips[0];
			expect(chip1).toHaveAttribute('id', '1');
			// eslint-disable-next-line jest-dom/prefer-to-have-value
			expect(chip1).toHaveAttribute('value', 'keyword1');

			const chip2 = keywordChips[1];
			expect(chip2).toHaveAttribute('id', '2');
			// eslint-disable-next-line jest-dom/prefer-to-have-value
			expect(chip2).toHaveAttribute('value', 'keyword2');
		});

		it('should handle empty query correctly', async () => {
			const properties: AdvancedFilterModalProps = {
				open: true,
				onClose: vi.fn(),
				query: [],
				updateQuery: vi.fn(),
				dateStart: DEFAULT_DATE_START,
				dateEnd: DEFAULT_DATE_END,
				setDateStart: vi.fn(),
				setDateEnd: vi.fn()
			};

			setupTest(<AdvancedFilterModal {...properties} />);

			const keywordChips = screen
				.queryAllByTestId('chip')
				.filter((chip) => !within(chip).queryByTestId('icon: CalendarOutline'));
			expect(keywordChips).toHaveLength(0);
		});

		it('should handle query with only AdvancedSearchChip and isQueryFilter (no regular keywords)', async () => {
			const properties: AdvancedFilterModalProps = {
				open: true,
				onClose: vi.fn(),
				query: [
					{
						id: '1',
						label: 'flagged:true',
						value: 'flagged:true',
						queryChipsToAdvancedFiltersValue: { flagged: true }
					},
					{
						id: '2',
						label: 'invalid:query',
						value: 'invalid:query',
						isQueryFilter: true
					}
				],
				updateQuery: vi.fn(),
				dateStart: DEFAULT_DATE_START,
				dateEnd: DEFAULT_DATE_END,
				setDateStart: vi.fn(),
				setDateEnd: vi.fn()
			};

			setupTest(<AdvancedFilterModal {...properties} />);

			const keywordChips = screen
				.queryAllByTestId('chip')
				.filter((chip) => !within(chip).queryByTestId(TEST_SELECTORS.ICONS.unSelectedCalendar));
			expect(keywordChips).toHaveLength(0);
		});
	});
});
