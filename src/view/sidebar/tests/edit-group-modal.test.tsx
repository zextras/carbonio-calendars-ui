/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';
import { times } from 'lodash';

import { selectCalendarFromSelector } from './utils';
import { generateFolder } from '../../../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { createSoapAPIInterceptor } from '../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { populateFoldersStore } from '../../../carbonio-ui-commons/test/mocks/store/folders';
import { within, screen, setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { CalendarGroup, Folder } from '../../../carbonio-ui-commons/types';
import { TEST_SELECTORS } from '../../../constants/test-utils';
import {
	CreateCalendarGroupRequest,
	CreateCalendarGroupResponse
} from '../../../soap/create-calendar-group-request';
import {
	ModifyCalendarGroupRequest,
	ModifyCalendarGroupResponse
} from '../../../soap/modify-calendar-group-request';
import * as modifyGroupApi from '../../../soap/modify-calendar-group-request';
import { generateApiErrorResponse } from '../../../test/generators/api';
import { generateGroup, populateGroupsStore } from '../../../test/generators/group';
import { EditGroupModal, EditGroupModalProps } from '../edit-group-modal';

const generateApiSuccessResponse = (): CreateCalendarGroupResponse => ({
	group: {
		id: faker.number.int().toString(),
		name: faker.word.noun(),
		calendarId: [{ _content: faker.number.int().toString() }]
	},
	_jsns: 'urn:zimbraMail'
});

const buildProps = ({
	groupId = faker.number.int().toString(),
	onClose = jest.fn()
}: Partial<EditGroupModalProps> = {}): EditGroupModalProps => ({
	groupId,
	onClose
});

const initializeStore = ({
	groupCalendarsCount = 2,
	otherCalendarsCount = 0
}: { groupCalendarsCount?: number; otherCalendarsCount?: number } = {}): {
	group: CalendarGroup;
	groupCalendars: Array<Folder>;
	otherCalendars: Array<Folder>;
} => {
	const groupCalendars = times(groupCalendarsCount, (index) =>
		generateFolder({
			name: `Awesome${index}`
		})
	);
	const otherCalendars = times(otherCalendarsCount, (index) =>
		generateFolder({
			name: `OtherCalendar${index}`
		})
	);
	const group: CalendarGroup = generateGroup({
		calendarId: groupCalendars.map((calendar) => calendar.id)
	});

	populateFoldersStore({
		view: 'appointment',
		customFolders: [...groupCalendars, ...otherCalendars]
	});
	populateGroupsStore({
		groups: [group]
	});

	return { group, groupCalendars, otherCalendars };
};

describe('EditGroupModal', () => {
	it('should render the modal with a specific title', () => {
		const { group } = initializeStore();
		setupTest(<EditGroupModal {...buildProps({ groupId: group.id })} />);

		expect(screen.getByText('Edit Calendar Group')).toBeVisible();
	});

	describe('close icon', () => {
		it('should render icon', () => {
			const { group } = initializeStore();
			setupTest(<EditGroupModal {...buildProps({ groupId: group.id })} />);

			expect(
				screen.getByRoleWithIcon('button', { icon: TEST_SELECTORS.ICONS.closeModal })
			).toBeVisible();
		});

		it('should call the onClose callback when clicked', async () => {
			const { group } = initializeStore();
			const onClose = jest.fn();

			const { user } = setupTest(
				<EditGroupModal {...buildProps({ groupId: group.id, onClose })} />
			);
			const button = screen.getByRoleWithIcon('button', { icon: TEST_SELECTORS.ICONS.closeModal });
			await user.click(button);

			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});

	describe('Existing group check', () => {
		it("should render an error snackbar if the group doesn't exist", () => {
			setupTest(<EditGroupModal {...buildProps({ groupId: faker.number.int().toString() })} />);

			expect(screen.getByText('Group not found')).toBeVisible();
		});

		it("should call the onClose callback if the group doesn't exist", () => {
			const onClose = jest.fn();
			setupTest(
				<EditGroupModal {...buildProps({ groupId: faker.number.int().toString(), onClose })} />
			);

			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});

	describe('Group Name*', () => {
		it('should render an input field with the correct placeholder', () => {
			const { group } = initializeStore();
			setupTest(<EditGroupModal {...buildProps({ groupId: group.id })} />);

			expect(screen.getByText('Group Name*')).toBeVisible();
		});

		it('should render the group name inside the input field', () => {
			const { group } = initializeStore();
			setupTest(<EditGroupModal {...buildProps({ groupId: group.id })} />);

			expect(screen.getByRole('textbox', { name: 'Group Name*' })).toHaveValue(group.name);
		});
	});

	describe('calendars', () => {
		it('should render the section title', () => {
			const { group } = initializeStore();
			setupTest(<EditGroupModal {...buildProps({ groupId: group.id })} />);

			expect(screen.getByText('Calendars in this group')).toBeVisible();
		});

		describe('calendars list', () => {
			it('should render the list of existing calendars in the group', async () => {
				const { group, groupCalendars: targetCalendars } = initializeStore();
				setupTest(<EditGroupModal {...buildProps({ groupId: group.id })} />);

				targetCalendars.forEach((calendar) => {
					expect(screen.getByText(calendar.name)).toBeVisible();
				});
			});

			it('should render the list with the existing and the newly added calendars', async () => {
				const { group, groupCalendars, otherCalendars } = initializeStore({
					otherCalendarsCount: 1
				});

				const { user } = setupTest(<EditGroupModal {...buildProps({ groupId: group.id })} />);
				await selectCalendarFromSelector(user, otherCalendars[0].name);

				[...groupCalendars, ...otherCalendars].forEach((calendar) => {
					expect(screen.getByText(calendar.name)).toBeVisible();
				});
			});

			it('should render an updated list of calendars when a calendar is removed', async () => {
				const { group, groupCalendars } = initializeStore({ groupCalendarsCount: 3 });

				const { user } = setupTest(<EditGroupModal {...buildProps({ groupId: group.id })} />);

				const listItems = screen.getAllByTestId('group-calendars-list-item');

				const clickRemoveButton = (): (() => Promise<void>) => {
					let result = (): Promise<void> => Promise.resolve();
					listItems.forEach((listItem) => {
						if (within(listItem).queryByText(groupCalendars[1].name)) {
							result = (): Promise<void> =>
								user.click(within(listItem).getByRole('button', { name: /remove/i }));
						}
					});

					return result;
				};

				await act(clickRemoveButton());

				expect(screen.getAllByTestId('group-calendars-list-item').length).toBe(2);
				expect(screen.queryByText(groupCalendars[1].name)).not.toBeInTheDocument();
			});
		});
	});

	describe('confirm button', () => {
		it('should render the button with the correct label', () => {
			const { group } = initializeStore();
			setupTest(<EditGroupModal {...buildProps({ groupId: group.id })} />);

			expect(screen.getByRole('button', { name: /save changes/i })).toBeVisible();
		});

		it('should be disabled when the group name is empty', () => {
			const { group } = initializeStore();
			const { user } = setupTest(<EditGroupModal {...buildProps({ groupId: group.id })} />);

			const input = screen.getByRole('textbox', { name: 'Group Name*' });
			user.clear(input);

			expect(screen.getByRole('button', { name: /Save changes/i })).toBeDisabled();
		});

		it.todo('should be disabled when no group data is changed');

		it('should be enabled when the group name is not empty', async () => {
			const { group } = initializeStore();
			const { user } = setupTest(<EditGroupModal {...buildProps({ groupId: group.id })} />);

			const input = screen.getByRole('textbox', { name: 'Group Name*' });
			await user.type(input, 'Updated group name');

			expect(screen.getByRole('button', { name: /Save changes/i })).toBeEnabled();
		});

		it('should be enabled when the group name is changed', async () => {
			const { group } = initializeStore();
			const { user } = setupTest(<EditGroupModal {...buildProps({ groupId: group.id })} />);

			const input = screen.getByRole('textbox', { name: 'Group Name*' });
			await user.type(input, 'Updated group name');

			expect(screen.getByRole('button', { name: /Save changes/i })).toBeEnabled();
		});

		it('should call the API with the proper parameters when clicked', async () => {
			const { group, groupCalendars, otherCalendars } = initializeStore({ otherCalendarsCount: 2 });
			const groupNewName = faker.word.noun();
			const groupNewCalendarsIds = [...groupCalendars, ...otherCalendars].map(
				(calendar) => calendar.id
			);

			const apiResponse = generateApiSuccessResponse();

			const apiCallInterceptor = createSoapAPIInterceptor<
				ModifyCalendarGroupRequest,
				ModifyCalendarGroupResponse
			>('ModifyCalendarGroup', apiResponse);

			const { user } = setupTest(<EditGroupModal {...buildProps({ groupId: group.id })} />);

			const modifyGroupApiSpy = jest.spyOn(modifyGroupApi, 'modifyCalendarGroupRequest');
			const input = screen.getByRole('textbox', { name: 'Group Name*' });
			await user.clear(input);
			await user.type(input, groupNewName);
			await selectCalendarFromSelector(user, otherCalendars[0].name);
			await selectCalendarFromSelector(user, otherCalendars[1].name);
			const confirmButton = screen.getByRole('button', { name: /save changes/i });
			await user.click(confirmButton);

			const apiParams = await apiCallInterceptor;
			expect(modifyGroupApiSpy).toHaveBeenCalledTimes(1);
			expect(apiParams).toEqual(
				expect.objectContaining({
					id: group.id,
					name: groupNewName,
					calendarId: groupNewCalendarsIds.map((id) => ({ _content: id }))
				})
			);
		});

		it('should render a success snackbar when the API call is successful', async () => {
			const { group } = initializeStore({ otherCalendarsCount: 2 });
			const apiResponse = generateApiSuccessResponse();

			createSoapAPIInterceptor<ModifyCalendarGroupRequest, ModifyCalendarGroupResponse>(
				'ModifyCalendarGroup',
				apiResponse
			);

			const { user } = setupTest(<EditGroupModal {...buildProps()} />);
			const input = screen.getByRole('textbox', { name: 'Group Name*' });
			await user.type(input, `Updated ${group.name}`);
			const confirmButton = screen.getByRole('button', { name: /Save changes/i });
			await act(() => user.click(confirmButton));
			const successfulSnackbar = await screen.findByText(/Changes saved/i);

			expect(successfulSnackbar).toBeVisible();
		});

		it('should call the onClose callback when the API call is successful', async () => {
			const { group } = initializeStore({ otherCalendarsCount: 2 });
			const apiResponse = generateApiSuccessResponse();

			createSoapAPIInterceptor<ModifyCalendarGroupRequest, ModifyCalendarGroupResponse>(
				'ModifyCalendarGroup',
				apiResponse
			);
			const onClose = jest.fn();

			const { user } = setupTest(<EditGroupModal {...buildProps({ onClose })} />);
			const input = screen.getByRole('textbox', { name: 'Group Name*' });
			await user.type(input, `Updated ${group.name}`);
			const confirmButton = screen.getByRole('button', { name: /Save changes/i });
			await act(() => user.click(confirmButton));

			expect(onClose).toHaveBeenCalledTimes(1);
		});

		it('should render an error snackbar when the API call is unsuccessful', async () => {
			const groupName = faker.word.noun();
			const apiResponse = generateApiErrorResponse();

			const apiCallInterceptor = createSoapAPIInterceptor<
				CreateCalendarGroupRequest,
				ErrorSoapBodyResponse
			>('CreateCalendarGroup', apiResponse);

			const { user } = setupTest(<EditGroupModal {...buildProps()} />);
			const input = screen.getByRole('textbox', { name: 'Group Name*' });
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
			const onClose = jest.fn();

			const { user } = setupTest(<EditGroupModal {...buildProps({ onClose })} />);
			const input = screen.getByRole('textbox', { name: 'Group Name*' });
			await user.type(input, groupName);
			const confirmButton = screen.getByRole('button', { name: /Create group/i });
			await user.click(confirmButton);
			await screen.findByText(/Something went wrong, please try again/i);

			expect(onClose).not.toHaveBeenCalled();
		});
	});
});
