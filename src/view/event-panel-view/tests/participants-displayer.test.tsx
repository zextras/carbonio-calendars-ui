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
import { DisplayedParticipant, ParticipantsDisplayer } from '../participants-displayer';
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

describe('ParticipantsDisplayer - response status visibility (CO-4136)', () => {
	const participants = {
		AC: [{ name: 'Alice', email: 'alice@example.com', isOptional: false }],
		NE: [{ name: 'Bob', email: 'bob@example.com', isOptional: false }]
	};

	beforeEach(() => {
		shell.useUserAccount.mockReturnValue({
			name: 'me@example.com',
			displayName: 'Me'
		} as never);
	});

	test('shows the full response-status breakdown to an organizer/editor', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupTest(
			<ParticipantsDisplayer
				participants={participants as never}
				event={{ resource: { calendar: {}, participationStatus: undefined } } as never}
				canSeeResponseStatus
			/>,
			{ store }
		);

		expect(screen.getByText('PARTICIPANTS.AC_WITH_COUNT')).toBeVisible();
		expect(screen.getByText('PARTICIPANTS.NE_WITH_COUNT')).toBeVisible();
		expect(screen.queryByTestId('SelfResponseStatusText')).not.toBeInTheDocument();
	});

	test('hides the response-status breakdown from a non-editor attendee and shows a flat list instead', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupTest(
			<ParticipantsDisplayer
				participants={participants as never}
				event={
					{
						resource: { calendar: {}, participationStatus: PARTICIPATION_STATUS.NEED_ACTION }
					} as never
				}
				canSeeResponseStatus={false}
			/>,
			{ store }
		);

		expect(screen.queryByText('PARTICIPANTS.AC_WITH_COUNT')).not.toBeInTheDocument();
		expect(screen.queryByText('PARTICIPANTS.NE_WITH_COUNT')).not.toBeInTheDocument();
		expect(screen.getByText('PARTICIPANTS.PARTICIPANTS_WITH_COUNT')).toBeVisible();
		expect(screen.getByText('alice@example.com')).toBeVisible();
		expect(screen.getByText('bob@example.com')).toBeVisible();
		// "Me" isn't among these participants, so there's nothing to self-report.
		expect(screen.queryByTestId('SelfResponseStatusText')).not.toBeInTheDocument();
	});

	test('still shows the logged-in attendee their own response status, without leaking others’', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const participantsWithSelf = {
			...participants,
			NE: [...participants.NE, { name: 'Me', email: 'me@example.com', isOptional: false }]
		};
		setupTest(
			<ParticipantsDisplayer
				participants={participantsWithSelf as never}
				event={
					{
						resource: { calendar: {}, participationStatus: PARTICIPATION_STATUS.ACCEPTED }
					} as never
				}
				canSeeResponseStatus={false}
			/>,
			{ store }
		);

		expect(screen.getByTestId('SelfResponseStatusText')).toBeVisible();
		expect(screen.getByText('message.you_accepted')).toBeVisible();
		expect(screen.queryByText('PARTICIPANTS.NE_WITH_COUNT')).not.toBeInTheDocument();
	});
});
