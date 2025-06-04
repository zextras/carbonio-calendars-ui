/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
jest.mock('@zextras/carbonio-shell-ui', () => ({
	t: (key: string, fallback?: string): string => fallback ?? key
}));
jest.mock('../../constants/advance-filter-modal', () => ({
	DEFAULT_DATE_START: 1744329600000, // 1744329600000 = April 11, 2025, 00:00:00 UTC
	DEFAULT_DATE_END: 1745539200000 // 1745539200000 = April 25, 2025, 00:00:00 UTC
}));

import React from 'react';

import { screen } from '@testing-library/react';

import { AdvancedFilterModal, AdvancedFilterModalProps } from './advance-filter-modal';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { DEFAULT_DATE_START, DEFAULT_DATE_END } from '../../constants/advance-filter-modal';

const MOCKED_NOW = new Date('2025-04-18T00:00:00Z');

beforeAll(() => {
	jest.useFakeTimers().setSystemTime(MOCKED_NOW);
});

afterAll(() => {
	jest.useRealTimers();
});

describe('AdvancedFilterModal', () => {
	it('reset filters button should be enabled if query is not empty', async () => {
		const properties: AdvancedFilterModalProps = {
			open: true,
			onClose: jest.fn(),
			query: [
				{
					id: '1',
					label: 'test',
					value: 'test'
				}
			],
			updateQuery: jest.fn(),
			dateStart: DEFAULT_DATE_START,
			dateEnd: DEFAULT_DATE_END,
			setDateStart: jest.fn(),
			setDateEnd: jest.fn()
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
			onClose: jest.fn(),
			query: [],
			updateQuery: jest.fn(),
			dateStart: DEFAULT_DATE_START,
			dateEnd: DEFAULT_DATE_END,
			setDateStart: jest.fn(),
			setDateEnd: jest.fn()
		};
		const { user } = setupTest(<AdvancedFilterModal {...properties} />);

		const fieldLabel = screen.getByText(/Advanced Filters/i);
		expect(fieldLabel).toBeInTheDocument();

		const calendarButtons = screen.getAllByTestId('icon: CalendarOutline');
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
			onClose: jest.fn(),
			query: [],
			updateQuery: jest.fn(),
			dateStart: DEFAULT_DATE_START,
			dateEnd: DEFAULT_DATE_END,
			setDateStart: jest.fn(),
			setDateEnd: jest.fn()
		};
		const { user } = setupTest(<AdvancedFilterModal {...properties} />);

		const fieldLabel = screen.getByText(/Advanced Filters/i);
		expect(fieldLabel).toBeInTheDocument();

		const calendarButtons = screen.getAllByTestId('icon: CalendarOutline');
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
			onClose: jest.fn(),
			query: [],
			updateQuery: jest.fn(),
			dateStart: DEFAULT_DATE_START,
			dateEnd: DEFAULT_DATE_END,
			setDateStart: jest.fn(),
			setDateEnd: jest.fn()
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
			onClose: jest.fn(),
			query: [
				{
					id: '1',
					label: 'test',
					value: 'test'
				}
			],
			updateQuery: jest.fn(),
			dateStart: FIXED_TIMESTAMP,
			dateEnd: FIXED_TIMESTAMP,
			setDateStart: jest.fn(),
			setDateEnd: jest.fn()
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
		jest.spyOn(console, 'error').mockImplementation();
		const properties: AdvancedFilterModalProps = {
			open: true,
			onClose: jest.fn(),
			query: [],
			updateQuery: jest.fn(),
			dateStart: DEFAULT_DATE_START,
			dateEnd: DEFAULT_DATE_END,
			setDateStart: jest.fn(),
			setDateEnd: jest.fn()
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
		jest.spyOn(console, 'error').mockImplementation();
		const updateQuery = jest.fn();
		const setDateStart = jest.fn();
		const setDateEnd = jest.fn();
		const onClose = jest.fn();

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

		const calendarButtons = screen.getAllByTestId('icon: CalendarOutline');
		await user.click(calendarButtons[0]);
		const fromDateToSelect = screen.getByRole('option', {
			name: /Choose Saturday, April 12th, 2025/i
		});
		await user.click(fromDateToSelect);

		const searchButton = getByRole('button', { name: /search/i });
		await user.click(searchButton);

		const startCall = setDateStart.mock.calls[0][0];
		const startDateString = new Date(startCall).toISOString().slice(0, 10);
		const defaultStartDateString = new Date(DEFAULT_DATE_START).toISOString().slice(0, 10);
		expect(startDateString).not.toBe(defaultStartDateString);
		expect(startDateString).toBe('2025-04-12');

		expect(updateQuery).toHaveBeenCalledWith([
			expect.objectContaining({
				id: '1',
				label: 'Test Query'
			})
		]);
		expect(onClose).toHaveBeenCalled();
	});

	it('should update endDate and call onConfirm when date is selected and search button is clicked', async () => {
		jest.spyOn(console, 'error').mockImplementation();
		const updateQuery = jest.fn();
		const setDateStart = jest.fn();
		const setDateEnd = jest.fn();
		const onClose = jest.fn();

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

		const calendarButtons = screen.getAllByTestId('icon: CalendarOutline');
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
});
