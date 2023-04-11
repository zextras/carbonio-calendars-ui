/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { reducers } from '../../store/redux';
import { ShareCalendarModal } from './share-calendar-modal';

describe('share-calendar-modal', () => {
	// share with
	test('share with has 2 options, internal is selected by default, confirm button is disabled', async () => {
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
		).toBeInTheDocument();

		await user.click(screen.getByText(/label\.share_with/i));

		const dropdownInternalOption = within(screen.getByTestId('dropdown-popper-list')).getByText(
			/share\.options\.share_calendar_with\.internal_users_groups/i
		);

		const dropdownPublicOption = within(screen.getByTestId('dropdown-popper-list')).getByText(
			/share\.options\.share_calendar_with\.public/i
		);

		const confirmButton = screen.getByRole('button', {
			name: /action\.share_calendar/i
		});

		expect(dropdownInternalOption).toBeInTheDocument();
		expect(dropdownPublicOption).toBeInTheDocument();
		expect(confirmButton).toBeDisabled();
	});
	test('when share with internals is not selected, other fields are not rendered, confirm button is enabled', async () => {
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

		await user.click(screen.getByText(/label\.share_with/i));

		const dropdownPublicOption = within(screen.getByTestId('dropdown-popper-list')).getByText(
			/share\.options\.share_calendar_with\.public/i
		);

		await user.click(dropdownPublicOption);

		const chipInput = screen.queryByRole('textbox', {
			name: /share\.placeholder\.recipients_address/i
		});
		const privateCheckbox = screen.queryByText(/share\.label\.allow_to_see_private_appt/i);
		const roleSelector = screen.queryByText(/label\.role/i);
		const notificationCheckbox = screen.queryByText(/share\.label\.send_notification/i);
		const standardMessage = screen.queryByRole('textbox', {
			name: /share\.placeholder\.standard_message/i
		});
		const shareNotes = screen.queryByText(/share\.note\.share_note/i);
		const confirmButton = screen.getByText(/action\.share_calendar/i);

		expect(confirmButton).toBeEnabled();
		expect(chipInput).not.toBeInTheDocument();
		expect(privateCheckbox).not.toBeInTheDocument();
		expect(roleSelector).not.toBeInTheDocument();
		expect(notificationCheckbox).not.toBeInTheDocument();
		expect(standardMessage).not.toBeInTheDocument();
		expect(shareNotes).not.toBeInTheDocument();
	});
	test('when share with internals is selected, other fields are rendered', () => {
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
			name: /share\.placeholder\.recipients_address/i
		});
		const privateCheckbox = screen.getByText(/share\.label\.allow_to_see_private_appt/i);
		const roleSelector = screen.getByText(/label\.role/i);
		const notificationCheckbox = screen.getByText(/share\.label\.send_notification/i);
		const standardMessage = screen.getByRole('textbox', {
			name: /share\.placeholder\.standard_message/i
		});
		const shareNotes = screen.getByText(/share\.note\.share_note/i);
		expect(chipInput).toBeInTheDocument();
		expect(privateCheckbox).toBeInTheDocument();
		expect(roleSelector).toBeInTheDocument();
		expect(notificationCheckbox).toBeInTheDocument();
		expect(standardMessage).toBeInTheDocument();
		expect(shareNotes).toBeInTheDocument();
	});
	// chipInput
	test('chipInput is empty by default, confirm button is disabled', () => {
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
			name: /share\.placeholder\.recipients_address/i
		});

		const confirmButton = screen.getByRole('button', {
			name: /action\.share_calendar/i
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
			name: /share\.placeholder\.recipients_address/i
		});
		const confirmButton = screen.getByRole('button', {
			name: /action\.share_calendar/i
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

		const viewerRoleOption = within(screen.getByTestId('dropdown-popper-list')).getByText(
			/share\.options\.share_calendar_role\.viewer/i
		);

		const noPermissionRoleOption = within(screen.getByTestId('dropdown-popper-list')).getByText(
			/share\.options\.share_calendar_role\.none/i
		);

		const adminRoleOption = within(screen.getByTestId('dropdown-popper-list')).getByText(
			/share\.options\.share_calendar_role\.admin/i
		);

		const managerRoleOption = within(screen.getByTestId('dropdown-popper-list')).getByText(
			/share\.options\.share_calendar_role\.manager/i
		);

		expect(noPermissionRoleOption).toBeInTheDocument();
		expect(viewerRoleOption).toBeInTheDocument();
		expect(adminRoleOption).toBeInTheDocument();
		expect(managerRoleOption).toBeInTheDocument();
	});
	test('send notification for the share is checked by default', () => {
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
	test('when send notification is checked the message field is enabled and empty', () => {
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
			name: /share\.placeholder\.standard_message/i
		});

		expect(standardMessage).toBeEnabled();
		expect(standardMessage).toHaveValue('');
	});
	test('when send notification is unchecked the message field is disabled', async () => {
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
			name: /share\.placeholder\.standard_message/i
		});

		expect(standardMessage).toBeDisabled();
	});
});
