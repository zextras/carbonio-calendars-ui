/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, within } from '@testing-library/react';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';
import { times } from 'lodash';

import { CreateGroupModal } from './create-group-modal';
import { selectCalendarFromSelector } from './test-utils';
import { TEST_SELECTORS } from '../../constants/test-utils';
import {
	CreateCalendarGroupRequest,
	CreateCalendarGroupResponse
} from '../../soap/create-calendar-group-request';
import * as createGroupApi from '../../soap/create-calendar-group-request';
import { generateApiErrorResponse } from '../../test/generators/api';
import { setupTest, screen } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { populateFoldersStore } from '@test-utils/store/folders';

const generateApiSuccessResponse = (
	groupName: string = faker.word.noun()
): CreateCalendarGroupResponse => ({
	group: {
		id: faker.number.int().toString(),
		name: groupName,
		calendarId: [{ _content: faker.number.int().toString() }]
	},
	_jsns: 'urn:zimbraMail'
});

describe('CreateGroupModal', () => {
	it('should render the modal with a specific title', () => {
		setupTest(<CreateGroupModal onClose={vi.fn()} />);

		expect(screen.getByText('Create new Calendar Group')).toBeVisible();
	});

	describe('close icon', () => {
		it('should render icon', () => {
			setupTest(<CreateGroupModal onClose={vi.fn()} />);

			expect(
				screen.getByRoleWithIcon('button', { icon: TEST_SELECTORS.ICONS.closeModal })
			).toBeVisible();
		});

		it('should call the onClose callback when clicked', async () => {
			const onClose = vi.fn();

			const { user } = setupTest(<CreateGroupModal onClose={onClose} />);
			const button = screen.getByRoleWithIcon('button', { icon: TEST_SELECTORS.ICONS.closeModal });
			await user.click(button);

			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});

	describe('group name', () => {
		it('should render an input field with the correct placeholder', () => {
			setupTest(<CreateGroupModal onClose={vi.fn()} />);

			expect(screen.getByPlaceholderText('Group Name*')).toBeVisible();
		});

		it('should render an input field with a default empty value', () => {
			setupTest(<CreateGroupModal onClose={vi.fn()} />);

			expect(screen.getByRole('textbox', { name: 'Group Name*' })).toHaveValue('');
		});

		it('should render an helper text', () => {
			setupTest(<CreateGroupModal onClose={vi.fn()} />);

			expect(screen.getByText('This group will appear in your personal account.')).toBeVisible();
		});

		it('should render an error message when the group name is invalid', async () => {
			const { user } = setupTest(<CreateGroupModal onClose={vi.fn()} />);

			const input = screen.getByPlaceholderText('Group Name*');
			await user.type(input, '/invalid-name');
			await user.clear(input);

			expect(screen.getByText('Type a group name to save changes')).toBeVisible();
		});

		it('should not render an error message when the group name is valid', async () => {
			const { user } = setupTest(<CreateGroupModal onClose={vi.fn()} />);
			const input = screen.getByPlaceholderText('Group Name*');
			await user.type(input, faker.word.noun());

			expect(screen.queryByText('Type a group name to save changes')).not.toBeInTheDocument();
		});

		it('should render the texts with a red foreground color when the group name is invalid', async () => {
			const { user } = setupTest(<CreateGroupModal onClose={vi.fn()} />);

			const input = screen.getByPlaceholderText('Group Name*');
			await user.type(input, '/invalid-name');
			await user.clear(input);

			expect(screen.getByText('Group Name*')).toHaveStyle('color:rgb(215, 73, 66)');
			expect(screen.getByText('Type a group name to save changes')).toHaveStyle(
				'color: rgb(215, 73, 66)'
			);
		});
	});

	describe('calendars', () => {
		it('should render the section title', () => {
			setupTest(<CreateGroupModal onClose={vi.fn()} />);

			expect(screen.getByText('Calendars in this group')).toBeVisible();
		});

		describe('calendars list', () => {
			it('should render the list of all the newly added calendars', async () => {
				const targetCalendar = generateFolder({
					name: 'Awesome',
					color: faker.number.int({ max: 9 })
				});
				populateFoldersStore({ view: 'appointment', customFolders: [targetCalendar] });

				const { user } = setupTest(<CreateGroupModal onClose={vi.fn()} />);
				await selectCalendarFromSelector(user, targetCalendar.name);

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

				const { user } = setupTest(<CreateGroupModal onClose={vi.fn()} />);
				await selectCalendarFromSelector(user, targetCalendars[0].name);
				await selectCalendarFromSelector(user, targetCalendars[1].name);

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

				const { user } = setupTest(<CreateGroupModal onClose={vi.fn()} />);
				await selectCalendarFromSelector(user, targetCalendars[0].name);
				await selectCalendarFromSelector(user, targetCalendars[1].name);

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

			it('should add calendars at the beginning of the list', async () => {
				const targetCalendars = times(3, (index) =>
					generateFolder({
						name: `Calendar${index}`,
						color: faker.number.int({ max: 9 })
					})
				);
				populateFoldersStore({ view: 'appointment', customFolders: targetCalendars });

				const { user } = setupTest(<CreateGroupModal onClose={vi.fn()} />);

				await selectCalendarFromSelector(user, targetCalendars[0].name);
				await selectCalendarFromSelector(user, targetCalendars[1].name);
				await selectCalendarFromSelector(user, targetCalendars[2].name);

				const listItems = screen.getAllByTestId('group-calendars-list-item');
				expect(listItems).toHaveLength(3);

				expect(within(listItems[0]).getByText(targetCalendars[2].name)).toBeVisible();
				expect(within(listItems[1]).getByText(targetCalendars[1].name)).toBeVisible();
				expect(within(listItems[2]).getByText(targetCalendars[0].name)).toBeVisible();
			});
		});
	});

	describe('confirm button', () => {
		it('should render the button with the correct label', () => {
			setupTest(<CreateGroupModal onClose={vi.fn()} />);

			expect(screen.getByRole('button', { name: /Create group/i })).toBeVisible();
		});

		it('should be disabled when the group name is empty', async () => {
			const { user } = setupTest(<CreateGroupModal onClose={vi.fn()} />);
			const input = screen.getByPlaceholderText('Group Name*');
			await user.clear(input);

			expect(screen.getByRole('button', { name: /Create group/i })).toBeDisabled();
		});

		it('should be enabled when the group name is not empty', async () => {
			const { user } = setupTest(<CreateGroupModal onClose={vi.fn()} />);

			const input = screen.getByPlaceholderText('Group Name*');
			await user.type(input, 'Awesome Group');

			expect(screen.getByRole('button', { name: /Create group/i })).toBeEnabled();
		});

		it('should call the API with the proper parameters when clicked', async () => {
			const groupName = faker.word.noun();
			const apiResponse = generateApiSuccessResponse(groupName);

			const apiCallInterceptor = createSoapAPIInterceptor<
				CreateCalendarGroupRequest,
				CreateCalendarGroupResponse
			>('CreateCalendarGroup', apiResponse);

			const { user } = setupTest(<CreateGroupModal onClose={vi.fn()} />);
			const createGroupApiSpy = vi.spyOn(createGroupApi, 'createCalendarGroupRequest');
			const input = screen.getByRole('textbox', { name: 'Group Name*' });
			await user.clear(input);
			await user.type(input, groupName);
			const confirmButton = screen.getByRole('button', { name: /Create group/i });
			await user.click(confirmButton);

			const apiParams = await apiCallInterceptor;
			expect(createGroupApiSpy).toHaveBeenCalledTimes(1);
			expect(apiParams).toEqual(expect.objectContaining({ name: groupName }));
		});

		it('should render a success snackbar when the API call is successful', async () => {
			const groupName = faker.word.noun();
			const apiResponse = generateApiSuccessResponse(groupName);

			const apiCallInterceptor = createSoapAPIInterceptor<
				CreateCalendarGroupRequest,
				CreateCalendarGroupResponse
			>('CreateCalendarGroup', apiResponse);

			const { user } = setupTest(<CreateGroupModal onClose={vi.fn()} />);
			const input = screen.getByRole('textbox', { name: 'Group Name*' });
			await user.type(input, groupName);
			const confirmButton = screen.getByRole('button', { name: /Create group/i });
			await user.click(confirmButton);
			await apiCallInterceptor;
			const successfulSnackbar = await screen.findByText(/New group created/i);

			expect(successfulSnackbar).toBeVisible();
		});

		it('should call the onClose callback when the API call is successful', async () => {
			const groupName = faker.word.noun();
			const apiResponse = generateApiSuccessResponse(groupName);

			createSoapAPIInterceptor<CreateCalendarGroupRequest, CreateCalendarGroupResponse>(
				'CreateCalendarGroup',
				apiResponse
			);
			const onClose = vi.fn();

			const { user } = setupTest(<CreateGroupModal onClose={onClose} />);
			const input = screen.getByPlaceholderText('Group Name*');
			await user.type(input, groupName);
			const confirmButton = screen.getByRole('button', { name: /Create group/i });
			await user.click(confirmButton);
			await screen.findByText(/New group created/i);

			expect(onClose).toHaveBeenCalledTimes(1);
		});

		it('should render an error snackbar when the API call is unsuccessful', async () => {
			const groupName = faker.word.noun();
			const apiResponse = generateApiErrorResponse();

			const apiCallInterceptor = createSoapAPIInterceptor<
				CreateCalendarGroupRequest,
				ErrorSoapBodyResponse
			>('CreateCalendarGroup', apiResponse);

			const { user } = setupTest(<CreateGroupModal onClose={vi.fn()} />);
			const input = screen.getByPlaceholderText('Group Name*');
			await user.type(input, groupName);
			const confirmButton = screen.getByRole('button', { name: /Create group/i });
			await user.click(confirmButton);
			await apiCallInterceptor;
			const successfulSnackbar = await screen.findByText(/Something went wrong, please try again/i);

			expect(successfulSnackbar).toBeVisible();
		});

		it('should not call the onClose callback when the API call is unsuccessful', async () => {
			const groupName = faker.word.noun();
			const apiResponse = generateApiErrorResponse();

			createSoapAPIInterceptor<CreateCalendarGroupRequest, ErrorSoapBodyResponse>(
				'CreateCalendarGroup',
				apiResponse
			);
			const onClose = vi.fn();

			const { user } = setupTest(<CreateGroupModal onClose={onClose} />);
			const input = screen.getByPlaceholderText('Group Name*');
			await user.type(input, groupName);
			const confirmButton = screen.getByRole('button', { name: /Create group/i });
			await user.click(confirmButton);
			await screen.findByText(/Something went wrong, please try again/i);

			expect(onClose).not.toHaveBeenCalled();
		});
	});
});
