/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

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
		const targetCalendar = calendarGenerators.getCalendar({ name: 'Awesome calendar' });

		populateFoldersStore({ view: 'appointment', customFolders: [targetCalendar] });
		const { user } = setupTest(<MultiCalendarSelector {...buildProps()} />);
		const input = screen.getByRole('textbox', { name: 'Add Calendars' });
		const calendarChipInput = screen.getByTestId(TEST_SELECTORS.CALENDARS_SELECTOR_INPUT);

		await user.type(input, 'Calendar');
		await user.click(screen.getByText(targetCalendar.name));
		within(calendarChipInput).getByTestId(TEST_SELECTORS.CHIP);
	});

	it.todo(
		'when a calendar already on the input is selected, its chip should be displayed only once'
	);

	describe('add icon', () => {
		it.todo('should render');

		it.todo('should render a specific tooltip when the user hover the mouse on it');

		it.todo('should be disabled when the input field is empty');

		it.todo(
			'should render a specific tooltip when the user hover the mouse on it and the icon is disabled'
		);

		it.todo('should be enabled when the input field is not empty');

		it.todo('should empty the input after the user clicks on it');
	});
});
