/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { times } from 'lodash';

import { generateFolder } from '../../../../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { populateFoldersStore } from '../../../../carbonio-ui-commons/test/mocks/store/folders';
import { setupTest, screen, within } from '../../../../carbonio-ui-commons/test/test-setup';
import { MultipleCalendarSelector } from '../multiple-calendar-selector';

describe('MultipleCalendarSelector', () => {
	it('should render the MultipleCalendarSelector with the correct placeholder', () => {
		populateFoldersStore({ view: 'appointment' });

		setupTest(<MultipleCalendarSelector onCalendarChange={jest.fn()} />);

		expect(screen.getByPlaceholderText('Add Calendars')).toBeVisible();
	});

	it('should render a dropdown list when the user clicks on the ChipInput', async () => {
		populateFoldersStore({ view: 'appointment' });

		const { user } = setupTest(<MultipleCalendarSelector onCalendarChange={jest.fn()} />);
		await user.click(screen.getByPlaceholderText('Add Calendars'));

		expect(screen.getByTestId('dropdown-popper-list')).toBeVisible();
	});

	it("should render all the calendars' name in the dropdown list when the user clicks on the ChipInput", async () => {
		const calendars = times(faker.number.int({ min: 1, max: 42 }), (index) =>
			generateFolder({ view: 'appointment', name: `Calendar ${index}` })
		);
		populateFoldersStore({ view: 'appointment', customFolders: calendars });

		const { user } = setupTest(<MultipleCalendarSelector onCalendarChange={jest.fn()} />);
		await user.click(screen.getByPlaceholderText('Add Calendars'));

		const dropdownList = screen.getByTestId('dropdown-popper-list');
		calendars.forEach((calendar) => {
			expect(within(dropdownList).getByText(calendar.name)).toBeVisible();
		});
	});

	it.todo('should render the selected calendar chip when a calendar is selected');

	it.todo('should render the selected calendars chips when another calendar is selected');

	it.todo('should remove the selected calendar chip when the chip is closed');

	it.todo('should remove only the first selected calendar chip when the first chip is closed');

	it.todo(
		'should call the onCalendarChange callback with the proper parameters when a calendar is selected'
	);

	it.todo(
		'should call the onCalendarChange callback with the proper parameters when a calendar is removed'
	);
});
