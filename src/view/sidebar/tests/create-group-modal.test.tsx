/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen, setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { TEST_SELECTORS } from '../../../constants/test-utils';
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

		describe('calendars input', () => {
			it('should render an input field with the correct placeholder', () => {
				setupTest(<CreateGroupModal onClose={jest.fn()} />);

				expect(screen.getByRole('textbox', { name: 'Add Calendars' })).toBeVisible();
			});

			it.todo(
				'when a calendar is selected, its chip, with the name and the color of the calendar, should be added to the input field'
			);

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

		describe('calendars list', () => {
			it.todo('should render a default empty list of calendars');

			it.todo('should render the list of all the newly added calendars');

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
