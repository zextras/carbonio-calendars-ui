/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import * as shell from '@zextras/carbonio-ui-commons';
import defaultSettings from '@zextras/carbonio-ui-commons';

import { PREFS_DEFAULTS } from '../../../constants';
import { PARTICIPATION_STATUS } from '../../../constants/api';
import * as ParticipantDisplayerAction from '../../../store/actions/participant-displayer-actions';
import { reducers } from '../../../store/redux';
import { DisplayedParticipant } from '../participants-displayer';
import { setupTest } from '@test-setup';

jest.setTimeout(20000);

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
		const clipboardCopySpy = jest.spyOn(ParticipantDisplayerAction, 'copyEmailToClipboard');
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
		const sendEmailSpy = jest.spyOn(ParticipantDisplayerAction, 'sendMsg');
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
