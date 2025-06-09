/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChipItem } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import KeywordRow from './keyword-row';

jest.mock('@zextras/carbonio-shell-ui', () => ({
	t: jest.fn((key) => key)
}));

jest.mock('@zextras/carbonio-design-system', () => {
	const React = require('react');
	return {
		Container: ({ children, maxWidth, ...props }: any): JSX.Element => (
			<div data-testid="container" {...props}>
				{children}
			</div>
		),
		ChipInput: ({
			children,
			onAdd,
			onChange,
			value = [],
			requireUniqueChips,
			placeholder,
			...props
		}: any): JSX.Element => {
			const [inputValue, setInputValue] = React.useState('');
			console.log('ChipInput render - value:', value, 'inputValue:', inputValue);

			const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
				console.log('handleChange called with:', e.target.value);
				setInputValue(e.target.value);
			};

			const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
				console.log('handleKeyDown called with key:', e.key, 'inputValue:', inputValue);
				if (e.key === 'Enter' && inputValue) {
					const newValue = inputValue;
					console.log('Checking for duplicates. Current value:', value, 'newValue:', newValue);
					if (requireUniqueChips && value?.some((chip: ChipItem) => chip.value === newValue)) {
						console.log('Duplicate found, not adding');
						return;
					}
					console.log('Adding new chip:', newValue);
					onAdd?.(newValue);
					const newChips = [...value, { label: newValue, value: newValue, hasAvatar: false }];
					console.log('Calling onChange with:', newChips);
					onChange?.(newChips);
					setInputValue('');
				}
			};

			// Use useEffect to handle input value changes
			React.useEffect(() => {
				console.log('Input value changed to:', inputValue);
			}, [inputValue]);

			return (
				<input
					data-testid="chip-input"
					value={inputValue}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					{...props}
				/>
			);
		},
		ChipItem: jest.requireActual('@zextras/carbonio-design-system').ChipItem
	};
});

describe('Keyword Row Component', () => {
	const initialKeywords: ChipItem[] = [
		{
			label: 'keyword1',
			value: 'keyword1',
			hasAvatar: false
		}
	];

	const TestWrapper = ({ onSetOtherKeywords }: { onSetOtherKeywords: jest.Mock }) => {
		const [otherKeywords, setOtherKeywords] = React.useState<ChipItem[]>(initialKeywords);
		console.log('TestWrapper render - otherKeywords:', otherKeywords);

		const handleSetOtherKeywords = React.useCallback((newKeywords: ChipItem[]) => {
			console.log('handleSetOtherKeywords called with:', newKeywords);
			setOtherKeywords(newKeywords);
			onSetOtherKeywords(newKeywords);
		}, [onSetOtherKeywords]);

		return <KeywordRow otherKeywords={otherKeywords} setOtherKeywords={handleSetOtherKeywords} />;
	};

	let mockSetOtherKeywords: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
		mockSetOtherKeywords = jest.fn();
		console.log('Test setup - mockSetOtherKeywords reset');
	});

	it('should prevent adding duplicate keywords', async () => {
		console.log('Starting duplicate keywords test');
		render(<TestWrapper onSetOtherKeywords={mockSetOtherKeywords} />);

		const input = screen.getByTestId('chip-input');
		console.log('Found input element');

		// Try to add a duplicate keyword
		console.log('Typing duplicate keyword');
		fireEvent.change(input, { target: { value: 'keyword1' } });
		console.log('Pressing Enter for duplicate');
		fireEvent.keyDown(input, { key: 'Enter' });

		// The setOtherKeywords should not be called with the duplicate
		await waitFor(() => {
			console.log('Checking if mockSetOtherKeywords was not called');
			expect(mockSetOtherKeywords).not.toHaveBeenCalled();
		});

		// Try to add a new keyword
		console.log('Typing new keyword');
		fireEvent.change(input, { target: { value: 'keyword2' } });
		console.log('Pressing Enter for new keyword');
		fireEvent.keyDown(input, { key: 'Enter' });

		// The setOtherKeywords should be called with both keywords
		await waitFor(() => {
			console.log('Checking if mockSetOtherKeywords was called with new keyword');
			expect(mockSetOtherKeywords).toHaveBeenCalledWith([
				...initialKeywords,
				{
					label: 'keyword2',
					value: 'keyword2',
					hasAvatar: false
				}
			]);
		});
	}, 30000);

	it('should handle keyword changes correctly', async () => {
		console.log('Starting keyword changes test');
		render(<TestWrapper onSetOtherKeywords={mockSetOtherKeywords} />);

		const input = screen.getByTestId('chip-input');
		console.log('Found input element');

		console.log('Typing new keyword');
		fireEvent.change(input, { target: { value: 'keyword2' } });
		console.log('Pressing Enter');
		fireEvent.keyDown(input, { key: 'Enter' });

		await waitFor(() => {
			console.log('Checking if mockSetOtherKeywords was called');
			expect(mockSetOtherKeywords).toHaveBeenCalledWith([
				...initialKeywords,
				{
					label: 'keyword2',
					value: 'keyword2',
					hasAvatar: false
				}
			]);
		});
	}, 30000);

	it('should display translated placeholder text', () => {
		render(<KeywordRow otherKeywords={initialKeywords} setOtherKeywords={mockSetOtherKeywords} />);

		expect(t).toHaveBeenCalledWith('label.keywords', 'Keywords');
		expect(screen.getByPlaceholderText('label.keywords')).toBeInTheDocument();
	});
});