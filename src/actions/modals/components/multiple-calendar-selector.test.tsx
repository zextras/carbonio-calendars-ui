/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { within } from '@testing-library/react';
import { FOLDERS } from '@zextras/carbonio-ui-commons';
import { times } from 'lodash';

import { MultipleCalendarSelector } from './multiple-calendar-selector';
import { selectCalendarFromSelector } from '../test-utils';
import { screen, setupTest } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { populateFoldersStore } from '@test-utils/store/folders';

describe('MultipleCalendarSelector', () => {
	it('should render the MultipleCalendarSelector with the correct placeholder', () => {
		populateFoldersStore({ view: 'appointment' });

		setupTest(<MultipleCalendarSelector onCalendarChange={vi.fn()} />);

		expect(screen.getByPlaceholderText('Type a calendar')).toBeVisible();
	});

	it('should render the calendars when the user starts typing on the input', async () => {
		const calendars = times(faker.number.int({ min: 1, max: 42 }), (index) =>
			generateFolder({ view: 'appointment', name: `Calendar ${index}` })
		);
		populateFoldersStore({ view: 'appointment', customFolders: calendars });

		const { user } = setupTest(<MultipleCalendarSelector onCalendarChange={vi.fn()} />);
		await user.type(screen.getByPlaceholderText('Type a calendar'), 'Ca');
		const dropdownList = await screen.findByTestId('dropdown-popper-list');
		calendars.forEach((calendar) => {
			expect(within(dropdownList).getByText(calendar.name)).toBeVisible();
		});
	});

	it('should not render the trash calendar in the dropdown list when the user clicks on the input', async () => {
		populateFoldersStore({ view: 'appointment' });

		const { user } = setupTest(<MultipleCalendarSelector onCalendarChange={vi.fn()} />);
		await user.type(screen.getByPlaceholderText('Type a calendar'), 'Tr');
		const dropdownList = await screen.findByTestId('dropdown-popper-list');
		expect(within(dropdownList).queryByText(/trash/i)).not.toBeInTheDocument();
	});

	it('should not render a trashed calendar in the dropdown list when the user clicks on the input', async () => {
		const trashedCalendarName = faker.word.words();
		const trashedCalendar = generateFolder({
			view: 'appointment',
			parent: FOLDERS.TRASH,
			name: trashedCalendarName,
			absFolderPath: `/trash/${trashedCalendarName}`
		});
		populateFoldersStore({ view: 'appointment', customFolders: [trashedCalendar] });

		const { user } = setupTest(<MultipleCalendarSelector onCalendarChange={vi.fn()} />);
		await user.type(screen.getByPlaceholderText('Type a calendar'), trashedCalendarName);
		const dropdownList = await screen.findByTestId('dropdown-popper-list');
		expect(within(dropdownList).queryByText(trashedCalendarName)).not.toBeInTheDocument();
	});

	it('should call the onCalendarChange callback with the proper parameters when a calendar is selected', async () => {
		const calendar = generateFolder({ view: 'appointment' });
		populateFoldersStore({ view: 'appointment', customFolders: [calendar] });

		const onCalendarChange = vi.fn();
		const { user } = setupTest(<MultipleCalendarSelector onCalendarChange={onCalendarChange} />);
		await selectCalendarFromSelector(user, calendar.name);
		expect(onCalendarChange).toHaveBeenCalledWith(calendar);
	});

	it('should not render the dropdown when the input is empty', async () => {
		const calendars = times(2, (index) =>
			generateFolder({ view: 'appointment', name: `Calendar${index}` })
		);
		populateFoldersStore({ view: 'appointment', customFolders: calendars });

		const { user } = setupTest(<MultipleCalendarSelector onCalendarChange={vi.fn()} />);
		const input = screen.getByPlaceholderText('Type a calendar');

		await user.click(input);

		expect(screen.queryByTestId('dropdown-popper-list')).not.toBeInTheDocument();
	});

	it('should render the dropdown only when the user starts typing', async () => {
		const calendars = times(2, (index) =>
			generateFolder({ view: 'appointment', name: `Calendar${index}` })
		);
		populateFoldersStore({ view: 'appointment', customFolders: calendars });

		const { user } = setupTest(<MultipleCalendarSelector onCalendarChange={vi.fn()} />);
		const input = screen.getByPlaceholderText('Type a calendar');

		await user.click(input);
		expect(screen.queryByTestId('dropdown-popper-list')).not.toBeInTheDocument();

		await user.type(input, 'Cal');
		const dropdownList = await screen.findByTestId('dropdown-popper-list');
		expect(dropdownList).toBeVisible();
	});
});
