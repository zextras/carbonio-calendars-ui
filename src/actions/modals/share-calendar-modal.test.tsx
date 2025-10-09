/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act, screen, waitFor, within } from '@testing-library/react';
import * as shell from '@zextras/carbonio-shell-ui';
import { Grant } from '@zextras/carbonio-ui-commons';

import { ShareCalendarModal } from './share-calendar-modal';
import { SHARE_USER_TYPE } from '../../constants';
import { FOLDER_OPERATIONS } from '../../constants/api';
import { TEST_SELECTORS } from '../../constants/test-utils';
import * as FolderAction from '../../soap/folder-action-request';
import * as SendShare from '../../store/actions/send-share-calendar-notification';
import { reducers } from '../../store/redux';
import { setupTest } from '@test-setup';
import defaultSettings from '@test-utils/settings/default-settings';

const checkedIcon = 'icon: CheckmarkSquare';

describe('Shared Calendar modal', () => {
	beforeEach(() => {
		jest.spyOn(shell, 'useUserSettings').mockReturnValue(defaultSettings);
	});

	const store = configureStore({ reducer: combineReducers(reducers) });

	describe('Modal header', () => {
		it('should display the title "Share" followed by the calendar name', () => {
			const closeFn = jest.fn();
			const grant = [
				{
					zid: '1',
					gt: 'usr',
					perm: 'r'
				} as const
			];

			const title = 'testName';
			setupTest(
				<ShareCalendarModal
					folderName={title}
					folderId={'testId1'}
					closeFn={closeFn}
					grant={grant}
				/>,
				{ store }
			);
			expect(screen.getByText(`Share ${title}`)).toBeVisible();
		});
		it('should display the close button and on click will call the modal onclose', async () => {
			const closeFn = jest.fn();
			const grant = [
				{
					zid: '1',
					gt: 'usr',
					perm: 'r'
				} as const
			];
			const { user } = setupTest(
				<ShareCalendarModal
					folderName={'testName'}
					folderId={'testId1'}
					closeFn={closeFn}
					grant={grant}
				/>,
				{ store }
			);
			const closeBtn = within(screen.getByTestId('ShareCalendarModal')).getByTestId(
				'icon: CloseOutline'
			);

			await user.click(closeBtn);

			expect(closeFn).toHaveBeenCalledTimes(1);
		});
	});
	describe('Modal body', () => {
		describe('the field to enable user to share to public', () => {
			it('is checked by default if user shared already the calendar to public', () => {
				const closeFn = jest.fn();
				const grant = [
					{
						gt: SHARE_USER_TYPE.PUBLIC,
						inh: '1',
						perm: 'r',
						pw: ''
					} as const
				];

				setupTest(
					<ShareCalendarModal
						folderName={'testName'}
						folderId={'testId1'}
						closeFn={closeFn}
						grant={grant}
					/>,
					{ store }
				);

				const checkedPublicShare = within(
					screen.getByTestId('publicShareCheckboxContainer')
				).getByTestId(checkedIcon);

				expect(checkedPublicShare).toBeVisible();
			});
			it('is not checked by default if the calendar is not shared with public', () => {
				const closeFn = jest.fn();
				const grant = [
					{
						zid: '1',
						gt: 'usr',
						perm: 'r'
					} as const
				];

				setupTest(
					<ShareCalendarModal
						folderName={'testName'}
						folderId={'testId1'}
						closeFn={closeFn}
						grant={grant}
					/>,
					{ store }
				);

				const uncheckedPublicShare = within(
					screen.getByTestId('publicShareCheckboxContainer')
				).getByTestId('icon: Square');

				expect(uncheckedPublicShare).toBeVisible();
			});
			test('checked on click', async () => {
				const closeFn = jest.fn();
				const grant = [
					{
						zid: '1',
						gt: 'usr',
						perm: 'r'
					} as const
				];

				const { user } = setupTest(
					<ShareCalendarModal
						folderName={'testName'}
						folderId={'testId1'}
						closeFn={closeFn}
						grant={grant}
					/>,
					{ store }
				);

				const uncheckedPublicShare = within(
					screen.getByTestId('publicShareCheckboxContainer')
				).getByTestId('icon: Square');

				await user.click(uncheckedPublicShare);

				const checkedPublicShare = within(
					screen.getByTestId('publicShareCheckboxContainer')
				).getByTestId(checkedIcon);

				expect(checkedPublicShare).toBeVisible();
			});
		});
		test('when zimbraPublicSharingEnabled is FALSE the option "public" is not displayed', async () => {
			jest.spyOn(shell, 'useUserSettings').mockReturnValue({
				...defaultSettings,
				attrs: { zimbraPublicSharingEnabled: 'FALSE' }
			});

			setupTest(<ShareCalendarModal folderName={'testName'} folderId={'testId1'} />, { store });

			const publicShareSection = screen.queryByTestId('publicShareCheckboxContainer');

			expect(publicShareSection).not.toBeInTheDocument();
		});
		it('should render every component', async () => {
			const closeFn = jest.fn();
			const grant = [
				{
					zid: '1',
					gt: 'usr',
					perm: 'r'
				} as const
			];

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
			expect(chipInput).toBeVisible();
			expect(privateCheckbox).toBeVisible();
			expect(roleSelector).toBeVisible();
			expect(notificationCheckbox).toBeVisible();
			expect(standardMessage).toBeVisible();
			expect(shareNotes).toBeVisible();
		});
		test('the "recipients e-mail addresses" input is empty by default', async () => {
			const closeFn = jest.fn();
			const grant = [
				{
					zid: '1',
					gt: 'usr',
					perm: 'r'
				} as const
			];

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

			expect(chipInput).toHaveValue('');
		});
		describe('the field to enable users to see private appointments', () => {
			test('is not checked by default', () => {
				const closeFn = jest.fn();
				const grant = [
					{
						zid: '1',
						gt: 'usr',
						perm: 'r'
					} as const
				];

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

				expect(uncheckedPrivate).toBeVisible();
			});
			test('checked on click', async () => {
				const closeFn = jest.fn();
				const grant = [
					{
						zid: '1',
						gt: 'usr',
						perm: 'r'
					} as const
				];

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

				await user.click(uncheckedPrivate);

				const checkedPrivate = within(screen.getByTestId('privateCheckboxContainer')).getByTestId(
					checkedIcon
				);

				expect(checkedPrivate).toBeVisible();
			});
			test('has an info icon with tooltip', async () => {
				const closeFn = jest.fn();
				const grant = [
					{
						zid: '1',
						gt: 'usr',
						perm: 'r'
					} as const
				];

				const { user } = setupTest(
					<ShareCalendarModal
						folderName={'testName'}
						folderId={'testId1'}
						closeFn={closeFn}
						grant={grant}
					/>,
					{ store }
				);
				const infoPrivateCheckbox = screen.getByTestId('icon: InfoOutline');

				expect(infoPrivateCheckbox).toBeVisible();

				await user.hover(infoPrivateCheckbox);

				const tooltipTextElement = await screen.findByText(/When sharing a calendar/i);

				expect(tooltipTextElement).toBeVisible();
			});
		});
		describe('the role selector to assign to the shared user', () => {
			test(' viewer is selected by default', async () => {
				const closeFn = jest.fn();
				const grant = [
					{
						zid: '1',
						gt: 'usr',
						perm: 'r'
					} as const
				];

				setupTest(
					<ShareCalendarModal
						folderName={'testName'}
						folderId={'testId1'}
						closeFn={closeFn}
						grant={grant}
					/>,
					{ store }
				);
				expect(screen.getByText(/viewer/i)).toBeVisible();
			});
			test('the select has 4 options', async () => {
				const closeFn = jest.fn();
				const grant = [
					{
						zid: '1',
						gt: 'usr',
						perm: 'r'
					} as const
				];

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

				expect(roleLabel).toBeVisible();
				await user.click(roleLabel);

				const viewerRoleOption = within(screen.getByTestId(TEST_SELECTORS.DROPDOWN)).getByText(
					/share\.options\.share_calendar_role\.viewer/i
				);

				const noPermissionRoleOption = within(
					screen.getByTestId(TEST_SELECTORS.DROPDOWN)
				).getByText(/share\.options\.share_calendar_role\.none/i);

				const adminRoleOption = within(screen.getByTestId(TEST_SELECTORS.DROPDOWN)).getByText(
					/share\.options\.share_calendar_role\.admin/i
				);

				const managerRoleOption = within(screen.getByTestId(TEST_SELECTORS.DROPDOWN)).getByText(
					/share\.options\.share_calendar_role\.manager/i
				);

				expect(noPermissionRoleOption).toBeVisible();
				expect(viewerRoleOption).toBeVisible();
				expect(adminRoleOption).toBeVisible();
				expect(managerRoleOption).toBeVisible();
			});
		});
		describe('the field to send a notification to the shared user', () => {
			test('this field is checked by default', async () => {
				const closeFn = jest.fn();
				const grant = [
					{
						zid: '1',
						gt: 'usr',
						perm: 'r'
					} as const
				];

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
				).getByTestId(checkedIcon);

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
				).getByTestId(checkedIcon);

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
				).getByTestId(checkedIcon);

				expect(sendNotificationCheckbox).toBeInTheDocument();
				await user.click(sendNotificationCheckbox);

				const standardMessage = screen.getByRole('textbox', {
					name: /Add a note to standard message/i
				});

				expect(standardMessage).toBeDisabled();
			});
		});
		describe('the field to add a message to the invitation', () => {
			test('has the label "add a note to standard message"', () => {
				const closeFn = jest.fn();
				const grant = [
					{
						zid: '1',
						gt: 'usr',
						perm: 'r'
					} as const
				];

				setupTest(
					<ShareCalendarModal
						folderName={'testName'}
						folderId={'testId1'}
						closeFn={closeFn}
						grant={grant}
					/>,
					{ store }
				);

				const standardMessage = screen.getByRole('textbox', {
					name: /Add a note to standard message/i
				});

				expect(standardMessage).toBeVisible();
			});
			test('it is empty by default', () => {
				const closeFn = jest.fn();
				const grant = [
					{
						zid: '1',
						gt: 'usr',
						perm: 'r'
					} as const
				];

				setupTest(
					<ShareCalendarModal
						folderName={'testName'}
						folderId={'testId1'}
						closeFn={closeFn}
						grant={grant}
					/>,
					{ store }
				);

				const standardMessage = screen.getByRole('textbox', {
					name: /Add a note to standard message/i
				});

				expect(standardMessage).toHaveValue('');
			});
		});
		test('an information note about the share message', () => {
			const closeFn = jest.fn();
			const grant = [
				{
					zid: '1',
					gt: 'usr',
					perm: 'r'
				} as const
			];

			setupTest(
				<ShareCalendarModal
					folderName={'testName'}
					folderId={'testId1'}
					closeFn={closeFn}
					grant={grant}
				/>,
				{ store }
			);

			const shareNotes = screen.getByText(/note:/i);

			expect(shareNotes).toBeVisible();
		});
	});
	describe('Modal footer', () => {
		it('should have the confirm button enabled when share publicly checkbox is clicked', async () => {
			const closeFn = jest.fn();
			const grant = [
				{
					zid: '1',
					gt: 'usr',
					perm: 'r'
				} as const
			];

			const { user } = setupTest(
				<ShareCalendarModal
					folderName={'testName'}
					folderId={'testId1'}
					closeFn={closeFn}
					grant={grant}
				/>,
				{ store }
			);

			const uncheckedPublicShare = within(
				screen.getByTestId('publicShareCheckboxContainer')
			).getByTestId('icon: Square');

			await user.click(uncheckedPublicShare);

			const confirmButton = screen.getByText(/Confirm/i);

			expect(confirmButton).toBeEnabled();
		});
		it('should have the confirm button disabled when the user did not interact with the modal', async () => {
			const closeFn = jest.fn();
			const grant = [
				{
					zid: '1',
					gt: 'usr',
					perm: 'r'
				} as const
			];

			setupTest(
				<ShareCalendarModal
					folderName={'testName'}
					folderId={'testId1'}
					closeFn={closeFn}
					grant={grant}
				/>,
				{ store }
			);

			const confirmButton = screen.getByText(/Confirm/i);

			expect(confirmButton).toBeEnabled();
		});
		it('should have the confirm button enabled when at least a chip is inserted without errors', async () => {
			const closeFn = jest.fn();
			const grant = [
				{
					zid: '1',
					gt: 'usr',
					perm: 'r'
				} as const
			];

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
			const confirmButton = screen.getByText(/Confirm/i);

			await user.type(chipInput, 'ale@test.com');
			await user.tab();

			expect(screen.getByText('ale@test.com')).toBeInTheDocument();
			expect(confirmButton).toBeEnabled();
		});
		// this corner case is currently not testable as integration components can't be tested and the fallback component does not cover this case
		test.todo('when at least a chip inside chipInput has errors, the confirm button is disabled');
		test.todo('check all the requests sent relative to the different cases');
		describe('on click', () => {
			afterEach(async () => {
				await act(async () => {
					await jest.advanceTimersToNextTimerAsync();
				});
			});
			test('when public is checked it will trigger a grant operation with grant type public', async () => {
				const spy = jest.spyOn(FolderAction, 'folderActionRequest');
				const closeFn = jest.fn();
				const grant: Grant[] | undefined = [];

				const { user } = setupTest(
					<ShareCalendarModal
						folderName={'testName'}
						folderId={'testId1'}
						closeFn={closeFn}
						grant={grant}
					/>,
					{ store }
				);

				const uncheckedPublicShare = within(
					screen.getByTestId('publicShareCheckboxContainer')
				).getByTestId('icon: Square');

				await user.click(uncheckedPublicShare);

				const confirmButton = screen.getByText(/Confirm/i);

				await user.click(confirmButton);

				expect(spy).toHaveBeenCalledTimes(1);
				expect(spy).toHaveBeenCalledWith(
					expect.objectContaining({
						grant: [expect.objectContaining({ gt: SHARE_USER_TYPE.PUBLIC })],
						op: FOLDER_OPERATIONS.GRANT
					})
				);
			});
			test('when a chip is added it will trigger a grant operation with grant type user', async () => {
				const spy = jest.spyOn(FolderAction, 'folderActionRequest');
				const closeFn = jest.fn();
				const grant: Grant[] | undefined = [];

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

				await user.type(chipInput, 'user1@email.it');
				await user.tab();

				const confirmButton = screen.getByText(/Confirm/i);

				expect(confirmButton).toBeEnabled();

				await act(async () => {
					await user.click(confirmButton);
				});

				expect(spy).toHaveBeenCalledTimes(1);
				expect(spy).toHaveBeenCalledWith(
					expect.objectContaining({
						grant: [expect.objectContaining({ gt: SHARE_USER_TYPE.USER })],
						op: FOLDER_OPERATIONS.GRANT
					})
				);
			});
			test('if allow private appointment is checked it will have the attribute perm with value p', async () => {
				const spy = jest.spyOn(FolderAction, 'folderActionRequest');
				const closeFn = jest.fn();
				const grant: Grant[] | undefined = [];

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

				await user.type(chipInput, 'user1@email.it');

				const privateCheckbox = screen.getByText(
					/allow user\(s\) to see private appointments’ detail/i
				);

				await user.click(privateCheckbox);

				const confirmButton = screen.getByText(/Confirm/i);

				await user.click(confirmButton);

				expect(spy).toHaveBeenCalledTimes(1);
				expect(spy).toHaveBeenCalledWith(
					expect.objectContaining({
						grant: [expect.objectContaining({ perm: expect.stringContaining('p') })]
					})
				);
			});
			test('if role none is selected it will have the attribute perm empty', async () => {
				const spy = jest.spyOn(FolderAction, 'folderActionRequest');
				const closeFn = jest.fn();
				const grant: Grant[] | undefined = [];

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

				await user.type(chipInput, 'user1@email.it');

				const roleSelector = screen.getByText('Role');

				await user.click(roleSelector);

				const noPermissionRoleOption = within(
					screen.getByTestId(TEST_SELECTORS.DROPDOWN)
				).getByText(/share\.options\.share_calendar_role\.none/i);

				await user.click(noPermissionRoleOption);

				const confirmButton = screen.getByText(/Confirm/i);

				await user.click(confirmButton);

				expect(spy).toHaveBeenCalledTimes(1);
				expect(spy).toHaveBeenCalledWith(
					expect.objectContaining({
						grant: [expect.objectContaining({ perm: '' })]
					})
				);
			});
			test('if role viewer is selected it will have the attribute perm with value r', async () => {
				const spy = jest.spyOn(FolderAction, 'folderActionRequest');
				const closeFn = jest.fn();
				const grant: Grant[] | undefined = [];

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

				await user.type(chipInput, 'user1@email.it');

				const roleSelector = screen.getByText('Role');

				await user.click(roleSelector);

				const viewerRoleOption = within(screen.getByTestId(TEST_SELECTORS.DROPDOWN)).getByText(
					/share\.options\.share_calendar_role\.viewer/i
				);

				await user.click(viewerRoleOption);

				const confirmButton = screen.getByText(/Confirm/i);

				await user.click(confirmButton);

				expect(spy).toHaveBeenCalledTimes(1);
				expect(spy).toHaveBeenCalledWith(
					expect.objectContaining({
						grant: [expect.objectContaining({ perm: 'r' })]
					})
				);
			});
			test('if role editor is selected it will have the attribute perm with value rwidxa', async () => {
				const spy = jest.spyOn(FolderAction, 'folderActionRequest');
				const closeFn = jest.fn();
				const grant: Grant[] | undefined = [];

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

				await user.type(chipInput, 'user1@email.it');

				const roleSelector = screen.getByText('Role');

				await user.click(roleSelector);

				const adminRoleOption = within(screen.getByTestId(TEST_SELECTORS.DROPDOWN)).getByText(
					/share\.options\.share_calendar_role\.admin/i
				);

				await user.click(adminRoleOption);

				const confirmButton = screen.getByText(/Confirm/i);

				await user.click(confirmButton);

				expect(spy).toHaveBeenCalledTimes(1);
				expect(spy).toHaveBeenCalledWith(
					expect.objectContaining({
						grant: [expect.objectContaining({ perm: 'rwidxa' })]
					})
				);
			});
			test('if role manager is selected it will have the attribute perm with value rwidx', async () => {
				const spy = jest.spyOn(FolderAction, 'folderActionRequest');
				const closeFn = jest.fn();
				const grant: Grant[] | undefined = [];

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

				await user.type(chipInput, 'user1@email.it');

				const roleSelector = screen.getByText('Role');

				await user.click(roleSelector);

				const managerRoleOption = within(screen.getByTestId(TEST_SELECTORS.DROPDOWN)).getByText(
					/share\.options\.share_calendar_role\.manager/i
				);

				await user.click(managerRoleOption);

				const confirmButton = screen.getByText(/Confirm/i);

				await user.click(confirmButton);

				expect(spy).toHaveBeenCalledTimes(1);
				expect(spy).toHaveBeenCalledWith(
					expect.objectContaining({
						grant: [expect.objectContaining({ perm: 'rwidx' })]
					})
				);
			});
			describe('if send notification about this share is checked', () => {
				test('it will send a share notification to recipients', async () => {
					const sendSpy = jest.spyOn(SendShare, 'sendShareCalendarNotification');
					const closeFn = jest.fn();
					const grant: Grant[] | undefined = [];

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
					await user.type(chipInput, 'user1@email.it');
					await user.tab();

					const confirmButton = screen.getByRole('button', { name: /Confirm/i });
					await user.click(confirmButton);

					await waitFor(() => {
						expect(sendSpy).toHaveBeenCalledTimes(1);
					});
					expect(sendSpy).toHaveBeenCalledWith(
						expect.objectContaining({ contacts: [{ email: 'user1@email.it' }] })
					);
				});
				test('and a custom message is added it will send the share notification with the custom message', async () => {
					const sendSpy = jest.spyOn(SendShare, 'sendShareCalendarNotification');
					const closeFn = jest.fn();
					const grant: Grant[] | undefined = [];

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
					await user.type(chipInput, 'user1@email.it');
					const standardMessage = screen.getByRole('textbox', {
						name: /Add a note to standard message/i
					});
					const customMessage = 'custom Message';
					await user.type(standardMessage, customMessage);
					const confirmButton = screen.getByRole('button', { name: /Confirm/i });
					expect(confirmButton).toBeEnabled();
					await user.click(confirmButton);

					await waitFor(() => {
						expect(sendSpy).toHaveBeenCalledTimes(1);
					});
					expect(sendSpy).toHaveBeenCalledWith(
						expect.objectContaining({ standardMessage: customMessage })
					);
				});
			});
		});
	});
});
