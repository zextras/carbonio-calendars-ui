/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, within } from '@testing-library/react';
import { times } from 'lodash';

import { generateFolder } from '../../../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { populateFoldersStore } from '../../../carbonio-ui-commons/test/mocks/store/folders';
import { screen, setupTest, UserEvent } from '../../../carbonio-ui-commons/test/test-setup';
import { TEST_SELECTORS } from '../../../constants/test-utils';
import { CreateGroupModal } from '../create-group-modal';
import * as createGroupApi from '../../../soap/create-calendar-group-request';

const addCalendar = async (user: UserEvent, calendarName: string): Promise<void> => {
	const input = screen.getByRole('textbox', { name: 'Add Calendars' });
	await user.type(input, calendarName);
	await act(async () => user.click(screen.getByText(calendarName)));
	await act(async () =>
		user.click(screen.getByRoleWithIcon('button', { icon: TEST_SELECTORS.ICONS.addCalendar }))
	);
};

describe('CreateGroupModal', () => {
	it('should render the modal with a specific title', () => {
		setupTest(<CreateGroupModal onClose={jest.fn()} />);

		expect(screen.getByText('Create new Calendar Group')).toBeVisible();
	});

	describe('close icon', () => {
		it('should render icon', () => {
			setupTest(<CreateGroupModal onClose={jest.fn()} />);

			expect(
				screen.getByRoleWithIcon('button', { icon: TEST_SELECTORS.ICONS.closeModal })
			).toBeVisible();
		});

		it('should call the onClose callback when clicked', async () => {
			const onClose = jest.fn();

			const { user } = setupTest(<CreateGroupModal onClose={onClose} />);
			const button = screen.getByRoleWithIcon('button', { icon: TEST_SELECTORS.ICONS.closeModal });
			await user.click(button);

			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});

	describe('group name', () => {
		it('should render an input field with the correct placeholder', () => {
			setupTest(<CreateGroupModal onClose={jest.fn()} />);

			expect(screen.getByText('Group Name')).toBeVisible();
		});

		it('should render an helper text', () => {
			setupTest(<CreateGroupModal onClose={jest.fn()} />);

			expect(screen.getByText('This group will appear in your personal account.')).toBeVisible();
		});
	});

	describe('calendars', () => {
		it('should render the section title', () => {
			setupTest(<CreateGroupModal onClose={jest.fn()} />);

			expect(screen.getByText('Calendars in this group')).toBeVisible();
		});

		describe('calendars list', () => {
			it('should render the list of all the newly added calendars', async () => {
				const targetCalendar = generateFolder({
					name: 'Awesome',
					color: faker.number.int({ max: 9 })
				});
				populateFoldersStore({ view: 'appointment', customFolders: [targetCalendar] });

				const { user } = setupTest(<CreateGroupModal onClose={jest.fn()} />);
				await addCalendar(user, targetCalendar.name);

				expect(screen.getByText(targetCalendar.name)).toBeVisible();
			});

			it('should render an updated list of calendars when a new calendar is added', async () => {
				const targetCalendars = times(2, (index) =>
					generateFolder({
						name: `Awesome${index}`,
						color: faker.number.int({ max: 9 })
					})
				);
				populateFoldersStore({ view: 'appointment', customFolders: targetCalendars });

				const { user } = setupTest(<CreateGroupModal onClose={jest.fn()} />);
				await addCalendar(user, targetCalendars[0].name);
				await addCalendar(user, targetCalendars[1].name);

				targetCalendars.forEach((calendar) => {
					expect(screen.getByText(calendar.name)).toBeVisible();
				});
			});

			it('should render an updated list of calendars when a calendar is removed', async () => {
				const targetCalendars = times(2, (index) =>
					generateFolder({
						name: `Awesome${index}`
					})
				);
				populateFoldersStore({ view: 'appointment', customFolders: targetCalendars });

				const { user } = setupTest(<CreateGroupModal onClose={jest.fn()} />);
				await addCalendar(user, targetCalendars[0].name);
				await addCalendar(user, targetCalendars[1].name);

				const listItems = screen.getAllByTestId('group-calendars-list-item');

				const clickRemoveButton = (): (() => Promise<void>) => {
					let result = (): Promise<void> => Promise.resolve();
					listItems.forEach((listItem) => {
						if (within(listItem).queryByText(targetCalendars[1].name)) {
							result = (): Promise<void> =>
								user.click(within(listItem).getByRole('button', { name: /remove/i }));
						}
					});

					return result;
				};

				await act(clickRemoveButton());

				expect(screen.getAllByTestId('group-calendars-list-item').length).toBe(1);
				expect(screen.queryByText(targetCalendars[1].name)).not.toBeInTheDocument();
			});
		});
	});

	describe('confirm button', () => {
		it('should render the button with the correct label', () => {
			setupTest(<CreateGroupModal onClose={jest.fn()} />);

			expect(screen.getByRole('button', { name: /Create group/i })).toBeVisible();
		});

		it('should be disabled when the group name is empty', () => {
			setupTest(<CreateGroupModal onClose={jest.fn()} />);

			expect(screen.getByRole('button', { name: /Create group/i })).toBeDisabled();
		});

		it('should be enabled when the group name is not empty', async () => {
			const { user } = setupTest(<CreateGroupModal onClose={jest.fn()} />);

			const input = screen.getByRole('textbox', { name: 'Group Name' });
			await user.type(input, 'Awesome Group');

			expect(screen.getByRole('button', { name: /Create group/i })).toBeEnabled();
		});

		it('should call the API with the proper parameters when clicked', async () => {
			const { user } = setupTest(<CreateGroupModal onClose={jest.fn()} />);
			const createGroupApiSpy = jest.spyOn(createGroupApi, 'createCalendarGroupRequest');
			const input = screen.getByRole('textbox', { name: 'Group Name' });

			await user.type(input, 'Awesome Group');

			const confirmButton = screen.getByRole('button', { name: /Create group/i });

			await user.click(confirmButton);

			expect(createGroupApiSpy).toHaveBeenCalledTimes(1);
		});

		it('should render a success snackbar when the API call is successful', async () => {
			const { user } = setupTest(<CreateGroupModal onClose={jest.fn()} />);
			const input = screen.getByRole('textbox', { name: 'Group Name' });

			await user.type(input, 'Awesome Group');

			const confirmButton = screen.getByRole('button', { name: /Create group/i });

			await user.click(confirmButton);

			await act(async () => {
				await jest.runOnlyPendingTimersAsync();
			});

			// TODO: create msw handler to receive a successful response
			const successfulSnackbar = await screen.findByText(/New group created/i);

			expect(successfulSnackbar).toBeVisible();
		});

		it.todo('should call the onClose callback when the API call is successful');

		it.todo('should render an error snackbar when the API call is unsuccessful');

		it.todo('should not call the onClose callback when the API call is unsuccessful');
	});
});
