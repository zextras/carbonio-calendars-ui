/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import { t } from '@zextras/carbonio-shell-ui';
import React from 'react';
import * as shell from '../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import defaultSettings from '../../carbonio-ui-commons/test/mocks/settings/default-settings';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { PREFS_DEFAULTS } from '../../constants';
import * as ParticipantDisplayerAction from '../../store/actions/participant-displayer-actions';
import { reducers } from '../../store/redux';
import { DisplayedParticipant } from '../../view/event-panel-view/participants-displayer';

jest.setTimeout(20000);

shell.getUserSettings.mockImplementation(() => ({
	prefs: {
		zimbraPrefTimeZoneId: 'Europe/Berlin',
		zimbraPrefCalendarDefaultApptDuration: '60m',
		zimbraPrefCalendarApptReminderWarningTime: '5',
		zimbraPrefDefaultCalendarId: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID
	},
	props: [...defaultSettings.props],
	attrs: {
		...defaultSettings.attrs
	}
}));

describe('participants displayer', () => {
	test('copy email to clipboard', async () => {
		const module = { createSnackbar: jest.fn() };
		shell.getBridgedFunctions.mockImplementation(() => module);
		const store = configureStore({ reducer: combineReducers(reducers) });
		const snackbarSpy = jest.spyOn(module, 'createSnackbar');
		const clipboardCopySpy = jest.spyOn(ParticipantDisplayerAction, 'copyEmailToClipboard');
		const { user } = setupTest(
			<DisplayedParticipant
				participant={{
					name: 'test',
					email: 'test@test.it',
					isOptional: false,
					response: 'AC'
				}}
			/>,
			{ store }
		);

		expect(screen.getByTestId('DisplayedParticipant')).toBeInTheDocument();
		expect(screen.getByTestId('icon: Copy')).toBeInTheDocument();
		await user.click(screen.getByTestId('icon: Copy'));
		expect(clipboardCopySpy).toHaveBeenCalledTimes(1);
		expect(snackbarSpy).toHaveBeenCalledTimes(1);
		expect(snackbarSpy).toHaveBeenCalledWith({
			key: `clipboard-copy-success`,
			replace: true,
			type: 'success',
			hideButton: true,
			label: t('snackbar.email_copied_to_clipboard', 'Email copied to clipboard.'),
			autoHideTimeout: 3000
		});
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
					response: 'AC'
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
