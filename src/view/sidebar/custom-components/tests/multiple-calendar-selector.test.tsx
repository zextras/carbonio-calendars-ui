/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';
import { times } from 'lodash';

import { FOLDERS } from '@zextras/carbonio-ui-commons';
import { generateFolder } from '@zextras/carbonio-ui-commons';
import { populateFoldersStore } from '@zextras/carbonio-ui-commons';
import { setupTest, screen, within } from '@zextras/carbonio-ui-commons';
import { TEST_SELECTORS } from '../../../../constants/test-utils';
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
		await act(() => user.click(screen.getByPlaceholderText('Add Calendars')));

		expect(screen.getByTestId('dropdown-popper-list')).toBeVisible();
	});

	it("should render all calendars' name in the dropdown list when the user clicks on the ChipInput", async () => {
		const calendars = times(faker.number.int({ min: 1, max: 42 }), (index) =>
			generateFolder({ view: 'appointment', name: `Calendar ${index}` })
		);
		populateFoldersStore({ view: 'appointment', customFolders: calendars });

		const { user } = setupTest(<MultipleCalendarSelector onCalendarChange={jest.fn()} />);
		await act(() => user.click(screen.getByPlaceholderText('Add Calendars')));

		const dropdownList = screen.getByTestId('dropdown-popper-list');
		calendars.forEach((calendar) => {
			expect(within(dropdownList).getByText(calendar.name)).toBeVisible();
		});
	});

	it('should not render the trash calendar in the dropdown list when the user clicks on the ChipInput', async () => {
		populateFoldersStore({ view: 'appointment' });

		const { user } = setupTest(<MultipleCalendarSelector onCalendarChange={jest.fn()} />);
		await act(() => user.click(screen.getByPlaceholderText('Add Calendars')));

		const dropdownList = screen.getByTestId('dropdown-popper-list');
		expect(within(dropdownList).queryByText(/trash/i)).not.toBeInTheDocument();
	});

	it('should not render a trashed calendar in the dropdown list when the user clicks on the ChipInput', async () => {
		const trashedCalendarName = faker.word.words();
		const trashedCalendar = generateFolder({
			view: 'appointment',
			parent: FOLDERS.TRASH,
			name: trashedCalendarName,
			absFolderPath: `/trash/${trashedCalendarName}`
		});
		populateFoldersStore({ view: 'appointment', customFolders: [trashedCalendar] });

		const { user } = setupTest(<MultipleCalendarSelector onCalendarChange={jest.fn()} />);
		await act(() => user.click(screen.getByPlaceholderText('Add Calendars')));

		const dropdownList = screen.getByTestId('dropdown-popper-list');
		expect(within(dropdownList).queryByText(trashedCalendarName)).not.toBeInTheDocument();
	});

	it('should render the selected calendar chip when a calendar is selected', async () => {
		const calendar = generateFolder({ view: 'appointment' });
		populateFoldersStore({ view: 'appointment', customFolders: [calendar] });

		const { user } = setupTest(<MultipleCalendarSelector onCalendarChange={jest.fn()} />);
		await act(() => user.click(screen.getByPlaceholderText('Add Calendars')));
		await user.click(screen.getByText(calendar.name));
		const chip = screen.getByTestId(TEST_SELECTORS.CHIP);

		expect(within(chip).getByText(calendar.name)).toBeVisible();
	});

	it('should render the selected calendars chips when another calendar is selected', async () => {
		const calendars = [
			generateFolder({ view: 'appointment', name: 'Calendar 1' }),
			generateFolder({ view: 'appointment', name: 'Calendar 2' })
		];
		populateFoldersStore({ view: 'appointment', customFolders: calendars });

		const { user } = setupTest(<MultipleCalendarSelector onCalendarChange={jest.fn()} />);
		await act(() => user.click(screen.getByPlaceholderText('Add Calendars')));
		await user.click(screen.getByText(calendars[0].name));
		await user.click(screen.getByText(calendars[1].name));
		// This is a workaround to close the dropdown and that works only in test
		await act(() => user.click(screen.getByPlaceholderText('Add Calendars')));

		calendars.forEach((calendar) => {
			expect(screen.getByText(calendar.name)).toBeVisible();
		});
	});

	it('should remove the selected calendar chip when the chip is closed', async () => {
		const calendar = generateFolder({ view: 'appointment' });
		populateFoldersStore({ view: 'appointment', customFolders: [calendar] });

		const { user } = setupTest(<MultipleCalendarSelector onCalendarChange={jest.fn()} />);
		await act(() => user.click(screen.getByPlaceholderText('Add Calendars')));
		await user.click(screen.getByText(calendar.name));
		await user.click(screen.getByRoleWithIcon('button', { icon: TEST_SELECTORS.ICONS.closeChip }));

		expect(screen.queryByTestId(TEST_SELECTORS.CHIP)).not.toBeInTheDocument();
	});

	it('should remove only the first selected calendar chip when the first chip is closed', async () => {
		const calendars = [
			generateFolder({ view: 'appointment', name: 'Calendar 1' }),
			generateFolder({ view: 'appointment', name: 'Calendar 2' })
		];
		populateFoldersStore({ view: 'appointment', customFolders: calendars });

		const { user } = setupTest(<MultipleCalendarSelector onCalendarChange={jest.fn()} />);
		await act(() => user.click(screen.getByPlaceholderText('Add Calendars')));
		await user.click(screen.getByText(calendars[0].name));
		await user.click(screen.getByText(calendars[1].name));
		await user.click(
			screen.getAllByRoleWithIcon('button', { icon: TEST_SELECTORS.ICONS.closeChip })[0]
		);
		const chip = screen.getByTestId(TEST_SELECTORS.CHIP);

		expect(within(chip).getByText(calendars[1].name)).toBeVisible();
	});

	describe('Add Calendars Icon', () => {
		it('should render with a specific icon', () => {
			populateFoldersStore({ view: 'appointment' });

			setupTest(<MultipleCalendarSelector onCalendarChange={jest.fn()} />);

			expect(screen.getByTestId(TEST_SELECTORS.ICONS.addCalendar)).toBeVisible();
		});

		it('should call the onCalendarChange callback with the proper parameters when a calendar is selected', async () => {
			const calendar = generateFolder({ view: 'appointment' });
			populateFoldersStore({ view: 'appointment', customFolders: [calendar] });

			const onCalendarChange = jest.fn();
			const { user } = setupTest(<MultipleCalendarSelector onCalendarChange={onCalendarChange} />);
			await act(() => user.click(screen.getByPlaceholderText('Add Calendars')));
			await user.click(screen.getByText(calendar.name));
			await user.click(
				screen.getByRoleWithIcon('button', { icon: TEST_SELECTORS.ICONS.addCalendar })
			);

			expect(onCalendarChange).toHaveBeenCalledWith([calendar]);
		});

		it('should call the onCalendarChange callback with the proper parameters when two calendars are added and one calendar is removed', async () => {
			const calendars = [
				generateFolder({ view: 'appointment', name: 'Calendar 1' }),
				generateFolder({ view: 'appointment', name: 'Calendar 2' })
			];
			populateFoldersStore({ view: 'appointment', customFolders: calendars });

			const onCalendarChange = jest.fn();
			const { user } = setupTest(<MultipleCalendarSelector onCalendarChange={onCalendarChange} />);
			await act(() => user.click(screen.getByPlaceholderText('Add Calendars')));
			await user.click(screen.getByText(calendars[0].name));
			await user.click(screen.getByText(calendars[1].name));
			await user.click(
				screen.getAllByRoleWithIcon('button', { icon: TEST_SELECTORS.ICONS.closeChip })[0]
			);
			await user.click(
				screen.getByRoleWithIcon('button', { icon: TEST_SELECTORS.ICONS.addCalendar })
			);

			expect(onCalendarChange).toHaveBeenCalledWith([calendars[1]]);
		});
	});
});
