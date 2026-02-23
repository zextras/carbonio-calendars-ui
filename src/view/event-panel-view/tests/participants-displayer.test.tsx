/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';

import { PREFS_DEFAULTS } from '../../../constants';
import { PARTICIPATION_STATUS } from '../../../constants/api';
import * as ParticipantDisplayerAction from '../../../store/actions/participant-displayer-actions';
import { reducers } from '../../../store/redux';
import { DisplayedParticipant } from '../participants-displayer';
import * as shell from '@test-mocks/@zextras/carbonio-shell-ui';
import { setupTest } from '@test-setup';
import defaultSettings from '@test-utils/settings/default-settings';

shell.getUserSettings.mockImplementation(() => ({
	...defaultSettings,
	prefs: {
		...defaultSettings.prefs,
		zimbraPrefUseTimeZoneListInCalendar: 'TRUE',
		zimbraPrefCalendarDefaultApptDuration: '60m',
		zimbraPrefCalendarApptReminderWarningTime: '5',
		zimbraPrefDefaultCalendarId: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID
	}
}));

describe('participants displayer', () => {
	test('copy email to clipboard', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const clipboardCopySpy = vi.spyOn(ParticipantDisplayerAction, 'copyEmailToClipboard');
		const { user } = setupTest(
			<DisplayedParticipant
				participant={{
					name: 'test',
					email: 'test@test.it',
					isOptional: false,
					response: PARTICIPATION_STATUS.ACCEPTED
				}}
			/>,
			{ store }
		);

		expect(screen.getByTestId('DisplayedParticipant')).toBeInTheDocument();
		expect(screen.getByTestId('icon: Copy')).toBeInTheDocument();

		await user.click(screen.getByTestId('icon: Copy'));

		expect(clipboardCopySpy).toHaveBeenCalledTimes(1);
		expect(screen.getByText('snackbar.email_copied_to_clipboard')).toBeInTheDocument();
	});

	test('send E-mail', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const sendEmailSpy = vi.spyOn(ParticipantDisplayerAction, 'sendMsg');
		const { user } = setupTest(
			<DisplayedParticipant
				participant={{
					name: 'test',
					email: 'test@test.it',
					isOptional: false,
					response: PARTICIPATION_STATUS.ACCEPTED
				}}
			/>,
			{ store }
		);

		expect(screen.getByTestId('DisplayedParticipant')).toBeInTheDocument();
		expect(screen.getByTestId('icon: EmailOutline')).toBeInTheDocument();
		await user.click(screen.getByTestId('icon: EmailOutline'));
		expect(sendEmailSpy).toHaveBeenCalledTimes(1);
	});
});
