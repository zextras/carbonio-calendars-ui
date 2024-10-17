/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { act } from '@testing-library/react';

import { populateFoldersStore } from '../../../carbonio-ui-commons/test/mocks/store/folders';
import { screen, setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { TEST_SELECTORS } from '../../../constants/test-utils';
import calendarGenerators from '../../../test/generators/calendar';
import { CreateGroupModal } from '../create-group-modal';

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
				const targetCalendar = calendarGenerators.getCalendar({ name: 'Awesome' });
				populateFoldersStore({ view: 'appointment', customFolders: [targetCalendar] });

				const { user } = setupTest(<CreateGroupModal onClose={jest.fn()} />);
				const input = screen.getByRole('textbox', { name: 'Add Calendars' });

				await user.type(input, targetCalendar.name);
				await act(async () => user.click(screen.getByText(targetCalendar.name)));

				await user.click(
					screen.getByRoleWithIcon('button', { icon: TEST_SELECTORS.ICONS.addCalendar })
				);

				expect(screen.getByText(targetCalendar.name)).toBeVisible();
			});

			it.todo('should render an updated list of calendars when a new calendar is added');

			it.todo('should render an updated list of calendars when a calendar is removed');
		});
	});

	describe('confirm button', () => {
		it.todo('should render the button with the correct label');

		it.todo('should be disabled when the group name is empty');

		it.todo('should be enabled when the group name is not empty');

		it.todo('should call the API with the proper parameters when clicked');

		it.todo('should render a success snackbar when the API call is successful');

		it.todo('should call the onClose callback when the API call is successful');

		it.todo('should render an error snackbar when the API call is unsuccessful');

		it.todo('should not call the onClose callback when the API call is unsuccessful');
	});
});
