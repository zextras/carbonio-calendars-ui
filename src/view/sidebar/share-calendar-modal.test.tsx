/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ShareCalendarModal } from './share-calendar-modal';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { reducers } from '../../store/redux';

const dropdownID = 'dropdown-popper-list';

describe('the share calendar modal is composed by', () => {
	describe('the modal header. It is composed by', () => {
		test.todo('the title "Share" followed by the calendar name');
		test.todo('the close button, on click will call the modal onclose');
	});
	describe('the modal body. It is composed by', () => {
		describe('"share with" selector which allow the user to specify the share type', () => {
			test.todo('has the label "Share with"');
			describe('has two options.', () => {
				test.todo('public');
				test('internal. It is selected by default', async () => {
					const closeFn = jest.fn();
					const grant = [
						{
							zid: '1',
							gt: 'usr',
							perm: 'r'
						} as const
					];
					const store = configureStore({ reducer: combineReducers(reducers) });
					const { user } = setupTest(
						<ShareCalendarModal
							folderName={'testName'}
							folderId={'testId1'}
							closeFn={closeFn}
							grant={grant}
						/>,
						{ store }
					);

					expect(
						screen.getByText(/share\.options\.share_calendar_with\.internal_users_groups/i)
					).toBeVisible();

					await user.click(screen.getByText(/share with/i));

					const dropdownInternalOption = within(screen.getByTestId(dropdownID)).getByText(
						/share\.options\.share_calendar_with\.internal_users_groups/i
					);

					const dropdownPublicOption = within(screen.getByTestId(dropdownID)).getByText(
						/share\.options\.share_calendar_with\.public/i
					);

					const confirmButton = screen.getByRole('button', {
						name: /Share Calendar/i
					});

					expect(dropdownInternalOption).toBeInTheDocument();
					expect(dropdownPublicOption).toBeInTheDocument();
					expect(confirmButton).toBeDisabled();
				});
			});
		});
		describe('when internal is selected there are also the following fields', () => {
			test.todo('the "recipients e-mail addresses" input');
			test.todo('the field to enable users to see private appointments');
			test.todo('the role selector to assign to the shared user');
			test.todo('the field to send a notification to the shared user');
			describe('the field to add a message to the invitation', () => {
				test.todo('has the label "add a note to standard message"');
				test('this field is checked by default', async () => {
					const closeFn = jest.fn();
					const grant = [
						{
							zid: '1',
							gt: 'usr',
							perm: 'r'
						} as const
					];
					const store = configureStore({ reducer: combineReducers(reducers) });
					setupTest(
						<ShareCalendarModal
							folderName={'testName'}
							folderId={'testId1'}
							closeFn={closeFn}
							grant={grant}
						/>,
						{ store }
					);

					const sendNotificationCheckbox = within(
						screen.getByTestId('sendNotificationCheckboxContainer')
					).getByTestId('icon: CheckmarkSquare');

					expect(sendNotificationCheckbox).toBeInTheDocument();
				});
				test('if send notification is checked this field is enabled and empty', async () => {
					const closeFn = jest.fn();
					const grant = [
						{
							zid: '1',
							gt: 'usr',
							perm: 'r'
						} as const
					];
					const store = configureStore({ reducer: combineReducers(reducers) });
					setupTest(
						<ShareCalendarModal
							folderName={'testName'}
							folderId={'testId1'}
							closeFn={closeFn}
							grant={grant}
						/>,
						{ store }
					);

					const sendNotificationCheckbox = within(
						screen.getByTestId('sendNotificationCheckboxContainer')
					).getByTestId('icon: CheckmarkSquare');

					expect(sendNotificationCheckbox).toBeInTheDocument();

					const standardMessage = screen.getByRole('textbox', {
						name: /Add a note to standard message/i
					});

					expect(standardMessage).toBeEnabled();
					expect(standardMessage).toHaveValue('');
				});
				test('if send notification is unchecked this field is disabled', async () => {
					const closeFn = jest.fn();
					const grant = [
						{
							zid: '1',
							gt: 'usr',
							perm: 'r'
						} as const
					];
					const store = configureStore({ reducer: combineReducers(reducers) });
					const { user } = setupTest(
						<ShareCalendarModal
							folderName={'testName'}
							folderId={'testId1'}
							closeFn={closeFn}
							grant={grant}
						/>,
						{ store }
					);

					const sendNotificationCheckbox = within(
						screen.getByTestId('sendNotificationCheckboxContainer')
					).getByTestId('icon: CheckmarkSquare');

					expect(sendNotificationCheckbox).toBeInTheDocument();
					await waitFor(() => {
						user.click(sendNotificationCheckbox);
					});

					const standardMessage = screen.getByRole('textbox', {
						name: /Add a note to standard message/i
					});

					expect(standardMessage).toBeDisabled();
				});
			});
			test.todo('an information note about the share message');
		});
	});
	describe('the modal footer with the "share calendar" button', () => {
		test('when share publicly is selected, other fields are not rendered, confirm button is enabled', async () => {
			const closeFn = jest.fn();
			const grant = [
				{
					zid: '1',
					gt: 'usr',
					perm: 'r'
				} as const
			];
			const store = configureStore({ reducer: combineReducers(reducers) });
			const { user } = setupTest(
				<ShareCalendarModal
					folderName={'testName'}
					folderId={'testId1'}
					closeFn={closeFn}
					grant={grant}
				/>,
				{ store }
			);

			await waitFor(() => {
				user.click(screen.getByText(/share with/i));
			});

			const dropdownPublicOption = within(screen.getByTestId(dropdownID)).getByText(
				/share\.options\.share_calendar_with\.public/i
			);

			await waitFor(() => {
				user.click(dropdownPublicOption);
			});

			const chipInput = screen.queryByRole('textbox', {
				name: /Recipients e-mail addresses/i
			});
			const privateCheckbox = screen.queryByText(/share\.label\.allow_to_see_private_appt/i);
			const roleSelector = screen.queryByText(/label\.role/i);
			const notificationCheckbox = screen.queryByText(/share\.label\.send_notification/i);
			const standardMessage = screen.queryByRole('textbox', {
				name: /Add a note to standard message/i
			});
			const shareNotes = screen.queryByText(/share\.note\.share_note/i);
			const confirmButton = screen.getByText(/Share Calendar/i);

			expect(confirmButton).toBeEnabled();
			expect(chipInput).not.toBeInTheDocument();
			expect(privateCheckbox).not.toBeInTheDocument();
			expect(roleSelector).not.toBeInTheDocument();
			expect(notificationCheckbox).not.toBeInTheDocument();
			expect(standardMessage).not.toBeInTheDocument();
			expect(shareNotes).not.toBeInTheDocument();
		});
	});
	test('when share with internals is selected, other fields are rendered', async () => {
		const closeFn = jest.fn();
		const grant = [
			{
				zid: '1',
				gt: 'usr',
				perm: 'r'
			} as const
		];
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupTest(
			<ShareCalendarModal
				folderName={'testName'}
				folderId={'testId1'}
				closeFn={closeFn}
				grant={grant}
			/>,
			{ store }
		);

		const chipInput = screen.getByRole('textbox', {
			name: /Recipients e-mail addresses/i
		});
		const privateCheckbox = screen.getByText(
			/allow user\(s\) to see private appointments’ detail/i
		);
		const roleSelector = screen.getByText('Role');
		const notificationCheckbox = screen.getByText(/send notification about this share/i);
		const standardMessage = screen.getByRole('textbox', {
			name: /Add a note to standard message/i
		});
		const shareNotes = screen.getByText(/note:/i);
		expect(chipInput).toBeInTheDocument();
		expect(privateCheckbox).toBeInTheDocument();
		expect(roleSelector).toBeInTheDocument();
		expect(notificationCheckbox).toBeInTheDocument();
		expect(standardMessage).toBeInTheDocument();
		expect(shareNotes).toBeInTheDocument();
	});
	test('chipInput is empty by default, confirm button is disabled', async () => {
		const closeFn = jest.fn();
		const grant = [
			{
				zid: '1',
				gt: 'usr',
				perm: 'r'
			} as const
		];
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupTest(
			<ShareCalendarModal
				folderName={'testName'}
				folderId={'testId1'}
				closeFn={closeFn}
				grant={grant}
			/>,
			{ store }
		);
		const chipInput = screen.getByRole('textbox', {
			name: /Recipients e-mail addresses/i
		});

		const confirmButton = screen.getByRole('button', {
			name: /Share Calendar/i
		});

		expect(chipInput).toHaveValue('');
		expect(confirmButton).toBeDisabled();
	});
	// this corner case is currently not testable as integration components can't be tested and the fallback component does not cover this case
	test.todo('when chips inside chipInput have errors, the confirm button is disabled');
	test('when at least a chip is inserted without errors, the confirm button is enabled', async () => {
		const closeFn = jest.fn();
		const grant = [
			{
				zid: '1',
				gt: 'usr',
				perm: 'r'
			} as const
		];
		const store = configureStore({ reducer: combineReducers(reducers) });
		const { user } = setupTest(
			<ShareCalendarModal
				folderName={'testName'}
				folderId={'testId1'}
				closeFn={closeFn}
				grant={grant}
			/>,
			{ store }
		);
		const chipInput = screen.getByRole('textbox', {
			name: /Recipients e-mail addresses/i
		});
		const confirmButton = screen.getByRole('button', {
			name: /Share Calendar/i
		});
		if (chipInput) {
			await user.type(chipInput, 'ale');
			await user.tab();
		}
		expect(screen.getByText('ale')).toBeInTheDocument();
		expect(confirmButton).toBeEnabled();
	});
	test('allow users to see my private appointments is not checked by default', () => {
		const closeFn = jest.fn();
		const grant = [
			{
				zid: '1',
				gt: 'usr',
				perm: 'r'
			} as const
		];
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupTest(
			<ShareCalendarModal
				folderName={'testName'}
				folderId={'testId1'}
				closeFn={closeFn}
				grant={grant}
			/>,
			{ store }
		);

		const uncheckedPrivate = within(screen.getByTestId('privateCheckboxContainer')).getByTestId(
			'icon: Square'
		);

		expect(uncheckedPrivate).toBeInTheDocument();
	});
	test('allow users to see my private appointments has also an info icon with tooltip', async () => {
		const closeFn = jest.fn();
		const grant = [
			{
				zid: '1',
				gt: 'usr',
				perm: 'r'
			} as const
		];
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupTest(
			<ShareCalendarModal
				folderName={'testName'}
				folderId={'testId1'}
				closeFn={closeFn}
				grant={grant}
			/>,
			{ store }
		);
		const infoPrivateCheckbox = screen.getByTestId('icon: InfoOutline');

		expect(infoPrivateCheckbox).toBeInTheDocument();

		userEvent.hover(infoPrivateCheckbox);

		const tooltipTextElement = await screen.findByText(/When sharing a calendar/i);

		expect(tooltipTextElement).toBeVisible();
	});
	test('allow users to see my private appointments is checked on click', async () => {
		const closeFn = jest.fn();
		const grant = [
			{
				zid: '1',
				gt: 'usr',
				perm: 'r'
			} as const
		];
		const store = configureStore({ reducer: combineReducers(reducers) });
		const { user } = setupTest(
			<ShareCalendarModal
				folderName={'testName'}
				folderId={'testId1'}
				closeFn={closeFn}
				grant={grant}
			/>,
			{ store }
		);

		const uncheckedPrivate = within(screen.getByTestId('privateCheckboxContainer')).getByTestId(
			'icon: Square'
		);

		await waitFor(() => {
			user.click(uncheckedPrivate);
		});

		const checkedPrivate = within(screen.getByTestId('privateCheckboxContainer')).getByTestId(
			'icon: CheckmarkSquare'
		);

		expect(checkedPrivate).toBeInTheDocument();
	});
	test('role field has 4 options, viewer role is set by default ', async () => {
		const closeFn = jest.fn();
		const grant = [
			{
				zid: '1',
				gt: 'usr',
				perm: 'r'
			} as const
		];
		const store = configureStore({ reducer: combineReducers(reducers) });
		const { user } = setupTest(
			<ShareCalendarModal
				folderName={'testName'}
				folderId={'testId1'}
				closeFn={closeFn}
				grant={grant}
			/>,
			{ store }
		);

		const roleLabel = screen.getByText(/share\.options\.share_calendar_role\.viewer/i);

		expect(roleLabel).toBeInTheDocument();

		await user.click(roleLabel);

		const viewerRoleOption = within(screen.getByTestId(dropdownID)).getByText(
			/share\.options\.share_calendar_role\.viewer/i
		);

		const noPermissionRoleOption = within(screen.getByTestId(dropdownID)).getByText(
			/share\.options\.share_calendar_role\.none/i
		);

		const adminRoleOption = within(screen.getByTestId(dropdownID)).getByText(
			/share\.options\.share_calendar_role\.admin/i
		);

		const managerRoleOption = within(screen.getByTestId(dropdownID)).getByText(
			/share\.options\.share_calendar_role\.manager/i
		);

		expect(noPermissionRoleOption).toBeInTheDocument();
		expect(viewerRoleOption).toBeInTheDocument();
		expect(adminRoleOption).toBeInTheDocument();
		expect(managerRoleOption).toBeInTheDocument();
	});
});
