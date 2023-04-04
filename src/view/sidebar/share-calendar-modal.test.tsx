/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import React from 'react';
import { screen, within } from '@testing-library/react';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { reducers } from '../../store/redux';
import { ShareCalendarModal } from './share-calendar-modal';

describe('share-calendar-modal', () => {
	// share with
	test('share with has 2 options, internal is selected by default', async () => {
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
		expect(dropdownInternalOption).toBeInTheDocument();
		expect(dropdownPublicOption).toBeInTheDocument();
	});
	test.todo('when share with internals is selected, other fields are visible');
	test.todo('when share with internals is not selected, other fields are  not visible');
	test.todo('when share publicly is selected, the confirm button is enabled');
	// chipInput
	test.todo('chipInput is empty by default');
	test.todo('when chips inside chipInput have errors, the confirm button is disabled');
	test.todo('when a chip is not inserted, the confirm button is disabled');
	test.todo('when at least a chip is inserted without errors, the confirm button is enabled');
	test.todo('when at least a chip is inserted with errors, the confirm button is disabled');
	// private permission
	test.todo('allow users to see my private appointments is not checked by default');
	test.todo('clicking on private checkbox will check it');
	// role select
	test.todo('role field has 4 options');
	test.todo('reading role is selected by default');
	// send notification checkbox
	test.todo('send notification for the share is checked by default');
	test.todo('when send notification is checked the message field is enabled');
	test.todo('when send notification is unchecked the message field is disabled');
	test.todo('message field for the notification is empty by default');
});
