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

const ERROR_COLOR = 'color: rgb(215, 73, 66)';

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
	it('renders modal title', () => {
		setupTest(<CreateGroupModal onClose={jest.fn()} />);
		expect(screen.getByText('Create new Calendar Group')).toBeVisible();
	});

	describe('close icon', () => {
		it('renders icon', () => {
			setupTest(<CreateGroupModal onClose={jest.fn()} />);
			expect(
				screen.getByRoleWithIcon('button', { icon: TEST_SELECTORS.ICONS.closeModal })
			).toBeVisible();
		});

		it('calls onClose on click', async () => {
			const onClose = jest.fn();
			const { user } = setupTest(<CreateGroupModal onClose={onClose} />);
			await user.click(
				screen.getByRoleWithIcon('button', { icon: TEST_SELECTORS.ICONS.closeModal })
			);
			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});

	describe('group name', () => {
		it('renders input with placeholder', () => {
			setupTest(<CreateGroupModal onClose={jest.fn()} />);
			expect(screen.getByPlaceholderText('Group Name*')).toBeVisible();
		});

		it('renders empty default value and disabled save button', () => {
			setupTest(<CreateGroupModal onClose={jest.fn()} />);
			expect(screen.getByRole('textbox', { name: 'Group Name*' })).toHaveValue('');
			expect(screen.getByRole('button', { name: /Create group/i })).toBeDisabled();
		});

		it('renders helper text', () => {
			setupTest(<CreateGroupModal onClose={jest.fn()} />);
			expect(screen.getByText('This group will appear in your personal account.')).toBeVisible();
		});

		it('shows error for invalid name', async () => {
			const { user } = setupTest(<CreateGroupModal onClose={jest.fn()} />);
			await user.type(screen.getByPlaceholderText('Group Name*'), '/invalid');
			expect(
				screen.getByText('This group name is invalid. Please avoid using special characters')
			).toBeVisible();
		});

		it('removes error for valid name', async () => {
			const { user } = setupTest(<CreateGroupModal onClose={jest.fn()} />);
			await user.type(screen.getByPlaceholderText('Group Name*'), faker.word.noun());
			expect(screen.queryByText('Type a group name to save changes')).not.toBeInTheDocument();
		});

		it('colors texts red when invalid', async () => {
			const { user } = setupTest(<CreateGroupModal onClose={jest.fn()} />);
			await user.type(screen.getByPlaceholderText('Group Name*'), '/invalid');
			expect(screen.getByText('Group Name*')).toHaveStyle(ERROR_COLOR);
			const msg = screen.getByText(
				'This group name is invalid. Please avoid using special characters'
			);
			expect(msg).toHaveStyle(ERROR_COLOR);
		});

		it('colors texts red when emptied after typing', async () => {
			const { user } = setupTest(<CreateGroupModal onClose={jest.fn()} />);
			const input = screen.getByPlaceholderText('Group Name*');
			await user.type(input, 'valid');
			await user.clear(input);
			expect(screen.getByText('Group Name*')).toHaveStyle(ERROR_COLOR);
			expect(screen.getByText('Type a group name to save changes')).toHaveStyle(ERROR_COLOR);
		});
	});

	describe('calendars', () => {
		it('renders section title', () => {
			setupTest(<CreateGroupModal onClose={jest.fn()} />);
			expect(screen.getByText('Calendars in this group')).toBeVisible();
		});

		describe('calendars list', () => {
			it('renders newly added calendars', async () => {
				const folder = generateFolder({ name: 'Awesome', color: faker.number.int({ max: 9 }) });
				populateFoldersStore({ view: 'appointment', customFolders: [folder] });
				const { user } = setupTest(<CreateGroupModal onClose={jest.fn()} />);
				await selectCalendarFromSelector(user, folder.name);
				expect(screen.getByText(folder.name)).toBeVisible();
			});

			it('updates list when new calendars added', async () => {
				const folders = times(2, (i) =>
					generateFolder({ name: `Awesome${i}`, color: faker.number.int({ max: 9 }) })
				);
				populateFoldersStore({ view: 'appointment', customFolders: folders });
				const { user } = setupTest(<CreateGroupModal onClose={jest.fn()} />);
				await selectCalendarFromSelector(user, folders[0].name);
				await selectCalendarFromSelector(user, folders[1].name);
				folders.forEach((f) => expect(screen.getByText(f.name)).toBeVisible());
			});

			it('updates list when a calendar is removed', async () => {
				const folders = times(2, (i) => generateFolder({ name: `Awesome${i}` }));
				populateFoldersStore({ view: 'appointment', customFolders: folders });
				const { user } = setupTest(<CreateGroupModal onClose={jest.fn()} />);
				await selectCalendarFromSelector(user, folders[0].name);
				await selectCalendarFromSelector(user, folders[1].name);

				const items = screen.getAllByTestId('group-calendars-list-item');
				const remove = (): (() => Promise<void>) => {
					let fn = (): Promise<void> => Promise.resolve();
					items.forEach((item) => {
						if (within(item).queryByText(folders[1].name)) {
							fn = (): Promise<void> =>
								user.click(within(item).getByRole('button', { name: /remove/i }));
						}
					});
					return fn;
				};

				await act(remove());
				expect(screen.getAllByTestId('group-calendars-list-item').length).toBe(1);
				expect(screen.queryByText(folders[1].name)).not.toBeInTheDocument();
			});

			it('adds calendars at the beginning', async () => {
				const folders = times(3, (i) =>
					generateFolder({ name: `Calendar${i}`, color: faker.number.int({ max: 9 }) })
				);
				populateFoldersStore({ view: 'appointment', customFolders: folders });
				const { user } = setupTest(<CreateGroupModal onClose={jest.fn()} />);
				await selectCalendarFromSelector(user, folders[0].name);
				await selectCalendarFromSelector(user, folders[1].name);
				await selectCalendarFromSelector(user, folders[2].name);

				const items = screen.getAllByTestId('group-calendars-list-item');
				expect(within(items[0]).getByText(folders[2].name)).toBeVisible();
				expect(within(items[1]).getByText(folders[1].name)).toBeVisible();
				expect(within(items[2]).getByText(folders[0].name)).toBeVisible();
			});
		});
	});

	describe('confirm button', () => {
		it('renders label', () => {
			setupTest(<CreateGroupModal onClose={jest.fn()} />);
			expect(screen.getByRole('button', { name: /Create group/i })).toBeVisible();
		});

		it('is disabled when group name empty', async () => {
			const { user } = setupTest(<CreateGroupModal onClose={jest.fn()} />);
			const input = screen.getByPlaceholderText('Group Name*');
			await user.clear(input);
			expect(screen.getByRole('button', { name: /Create group/i })).toBeDisabled();
		});

		it('is enabled when group name is filled', async () => {
			const { user } = setupTest(<CreateGroupModal onClose={jest.fn()} />);
			await user.type(screen.getByPlaceholderText('Group Name*'), 'Awesome Group');
			expect(screen.getByRole('button', { name: /Create group/i })).toBeEnabled();
		});

		it('calls API with proper params', async () => {
			const groupName = faker.word.noun();
			const apiResponse = generateApiSuccessResponse(groupName);
			const interceptor = createSoapAPIInterceptor<
				CreateCalendarGroupRequest,
				CreateCalendarGroupResponse
			>('CreateCalendarGroup', apiResponse);

			const { user } = setupTest(<CreateGroupModal onClose={jest.fn()} />);
			const spy = jest.spyOn(createGroupApi, 'createCalendarGroupRequest');
			const input = screen.getByRole('textbox', { name: 'Group Name*' });
			await user.clear(input);
			await user.type(input, groupName);
			await user.click(screen.getByRole('button', { name: /Create group/i }));
			const params = await interceptor;

			expect(spy).toHaveBeenCalledTimes(1);
			expect(params).toEqual(expect.objectContaining({ name: groupName }));
		});

		it('shows success snackbar on success', async () => {
			const groupName = faker.word.noun();
			const apiResponse = generateApiSuccessResponse(groupName);
			const interceptor = createSoapAPIInterceptor<
				CreateCalendarGroupRequest,
				CreateCalendarGroupResponse
			>('CreateCalendarGroup', apiResponse);

			const { user } = setupTest(<CreateGroupModal onClose={jest.fn()} />);
			await user.type(screen.getByRole('textbox', { name: 'Group Name*' }), groupName);
			await user.click(screen.getByRole('button', { name: /Create group/i }));
			await interceptor;
			expect(await screen.findByText(/New group created/i)).toBeVisible();
		});

		it('calls onClose on success', async () => {
			const groupName = faker.word.noun();
			const apiResponse = generateApiSuccessResponse(groupName);
			createSoapAPIInterceptor<CreateCalendarGroupRequest, CreateCalendarGroupResponse>(
				'CreateCalendarGroup',
				apiResponse
			);

			const onClose = jest.fn();
			const { user } = setupTest(<CreateGroupModal onClose={onClose} />);
			await user.type(screen.getByPlaceholderText('Group Name*'), groupName);
			await user.click(screen.getByRole('button', { name: /Create group/i }));
			await screen.findByText(/New group created/i);
			expect(onClose).toHaveBeenCalledTimes(1);
		});

		it('shows error snackbar on failure', async () => {
			const groupName = faker.word.noun();
			const apiResponse = generateApiErrorResponse();
			const interceptor = createSoapAPIInterceptor<
				CreateCalendarGroupRequest,
				ErrorSoapBodyResponse
			>('CreateCalendarGroup', apiResponse);

			const { user } = setupTest(<CreateGroupModal onClose={jest.fn()} />);
			await user.type(screen.getByPlaceholderText('Group Name*'), groupName);
			await user.click(screen.getByRole('button', { name: /Create group/i }));
			await interceptor;
			expect(await screen.findByText(/Something went wrong, please try again/i)).toBeVisible();
		});

		it('does not call onClose on failure', async () => {
			const groupName = faker.word.noun();
			const apiResponse = generateApiErrorResponse();
			createSoapAPIInterceptor<CreateCalendarGroupRequest, ErrorSoapBodyResponse>(
				'CreateCalendarGroup',
				apiResponse
			);

			const onClose = jest.fn();
			const { user } = setupTest(<CreateGroupModal onClose={onClose} />);
			await user.type(screen.getByPlaceholderText('Group Name*'), groupName);
			await user.click(screen.getByRole('button', { name: /Create group/i }));
			await screen.findByText(/Something went wrong, please try again/i);
			expect(onClose).not.toHaveBeenCalled();
		});
	});
});
