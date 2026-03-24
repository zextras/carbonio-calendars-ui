/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { useFolder } from '@zextras/carbonio-ui-commons';

import { OrganizerPart } from '../organizer-part';
import { ParticipantsDisplayerSmall } from '../participants-displayer-small';
import * as shell from '@test-mocks/@zextras/carbonio-shell-ui';
import { screen, setupTest } from '@test-setup';

vi.mock('@zextras/carbonio-ui-commons', async () => {
	const actual = await vi.importActual('@zextras/carbonio-ui-commons');
	return {
		...actual,
		useFolder: vi.fn()
	};
});

const organizer = { a: 'owner@example.com', d: 'Calendar Owner' };

const baseInvite = {
	ciFolder: 'ext-cal',
	isOrganizer: false,
	organizer
};

describe('external calendar perspective', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		shell.useUserAccount.mockReturnValue({
			name: 'me@example.com',
			displayName: 'Me'
		} as never);
	});

	test('OrganizerPart does not show "invited you" for external calendar when logged user is not attendee', () => {
		vi.mocked(useFolder).mockReturnValue({
			id: 'ext-cal',
			f: '#y',
			url: 'https://a/1.ics'
		} as never);

		setupTest(
			<OrganizerPart
				invite={{ ...baseInvite, attendees: [{ a: 'someone@example.com' }] } as never}
				organizer={organizer as never}
			/>
		);

		expect(screen.queryByText(/invited you/i)).not.toBeInTheDocument();
		expect(screen.getByText(/is the organizer/i)).toBeVisible();
	});

	test('OrganizerPart keeps attendee wording for external calendar when logged user is attendee', () => {
		vi.mocked(useFolder).mockReturnValue({
			id: 'ext-cal',
			f: '#y',
			url: 'https://a/1.ics'
		} as never);

		setupTest(
			<OrganizerPart
				invite={{ ...baseInvite, attendees: [{ a: 'me@example.com' }] } as never}
				organizer={organizer as never}
			/>
		);

		expect(screen.getByText(/invited you/i)).toBeVisible();
	});

	test('ParticipantsDisplayerSmall uses owner perspective for external calendars', () => {
		vi.mocked(useFolder).mockReturnValue({
			id: 'ext-cal',
			f: '#y',
			url: 'https://a/1.ics'
		} as never);

		setupTest(
			<ParticipantsDisplayerSmall
				event={
					{
						resource: {
							iAmOrganizer: false,
							calendar: { id: 'ext-cal' }
						}
					} as never
				}
				participants={
					{
						NE: [{ name: 'Default User', email: 'default@example.com' }]
					} as never
				}
			/>
		);

		expect(screen.getByText('participants.Invited_Visitor')).toBeVisible();
		expect(screen.queryByText('participants.Not_answered')).not.toBeInTheDocument();
	});

	test('ParticipantsDisplayerSmall keeps attendee perspective for non-external calendars', () => {
		vi.mocked(useFolder).mockReturnValue({ id: 'int-cal', f: '#' } as never);

		setupTest(
			<ParticipantsDisplayerSmall
				event={
					{
						resource: {
							iAmOrganizer: false,
							calendar: { id: 'int-cal' }
						}
					} as never
				}
				participants={
					{
						NE: [{ name: 'Default User', email: 'default@example.com' }]
					} as never
				}
			/>
		);

		expect(screen.getByText('participants.Not_answered')).toBeVisible();
	});
});
