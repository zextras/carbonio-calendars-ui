/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { act } from '@testing-library/react';
import { times } from 'lodash';

import {
	MultiCalendarSelector,
	MultiCalendarSelectorProps
} from './custom-components/multiple-calendar-selector';
import { populateFoldersStore } from '../../carbonio-ui-commons/test/mocks/store/folders';
import { screen, setupTest, within } from '../../carbonio-ui-commons/test/test-setup';
import { TEST_SELECTORS } from '../../constants/test-utils';
import calendarGenerators from '../../test/generators/calendar';

const buildProps = ({
	onCalendarChange = jest.fn(),
	excludeTrash = false,
	disabled = false,
	...rest
}: Partial<MultiCalendarSelectorProps> = {}): MultiCalendarSelectorProps => ({
	onCalendarChange,
	excludeTrash,
	disabled,
	...rest
});

describe('MultiCalendarSelector', () => {
	it('should render an input field with the correct placeholder', () => {
		setupTest(<MultiCalendarSelector {...buildProps()} />);

		expect(screen.getByRole('textbox', { name: 'Add Calendars' })).toBeVisible();
	});

	it('when a calendar is selected, its chip, with the name and the color of the calendar, should be added to the input field', async () => {
		const targetCalendar = calendarGenerators.getCalendar({ name: 'Awesome' });

		populateFoldersStore({ view: 'appointment', customFolders: [targetCalendar] });
		const { user } = setupTest(<MultiCalendarSelector {...buildProps()} />);
		const input = screen.getByRole('textbox', { name: 'Add Calendars' });

		await user.type(input, targetCalendar.name);
		await act(() => user.click(screen.getByText(targetCalendar.name)));

		const chip = screen.getByTestId(TEST_SELECTORS.CHIP);

		expect(within(chip).getByText(targetCalendar.name)).toBeVisible();
		expect(within(chip).getByTestId('colored-square')).toBeVisible();
	});

	it('when a second calendar is selected, two chips should be rendered', async () => {
		const targetCalendars = times(2, () => calendarGenerators.getCalendar());

		populateFoldersStore({ view: 'appointment', customFolders: targetCalendars });
		const { user } = setupTest(<MultiCalendarSelector {...buildProps()} />);
		const input = screen.getByRole('textbox', { name: 'Add Calendars' });

		await user.type(input, targetCalendars[0].name);
		await act(() => user.click(screen.getByText(targetCalendars[0].name)));
		await user.type(input, targetCalendars[1].name);
		await act(() => user.click(screen.getByText(targetCalendars[1].name)));
		const chips = screen.getAllByTestId(TEST_SELECTORS.CHIP);

		expect(chips).toHaveLength(2);
	});

	it('when a calendar already on the input is selected, its chip should be displayed only once', async () => {
		const targetCalendar = calendarGenerators.getCalendar({ name: 'Awesome' });

		populateFoldersStore({ view: 'appointment', customFolders: [targetCalendar] });
		const { user } = setupTest(<MultiCalendarSelector {...buildProps()} />);
		const input = screen.getByRole('textbox', { name: 'Add Calendars' });

		await user.type(input, targetCalendar.name);
		await act(() => user.click(screen.getByText(targetCalendar.name)));
		const chip = screen.getByTestId(TEST_SELECTORS.CHIP);

		expect(within(chip).getByText(targetCalendar.name)).toBeVisible();
	});

	describe('add icon', () => {
		it('should render', () => {
			setupTest(<MultiCalendarSelector {...buildProps()} />);

			expect(screen.getByTestId(TEST_SELECTORS.ICONS.add)).toBeVisible();
		});

		it.todo('should render a specific tooltip when the user hover the mouse on it');

		it.todo('should be disabled when the input field is empty');

		it.todo(
			'should render a specific tooltip when the user hover the mouse on it and the icon is disabled'
		);

		it.todo('should be enabled when the input field is not empty');

		it.todo('should empty the input after the user clicks on it');
	});
});
