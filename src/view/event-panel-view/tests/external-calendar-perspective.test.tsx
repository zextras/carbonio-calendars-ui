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
import { PARTICIPATION_STATUS } from 'constants/api';
import * as utilities from 'commons/utilities';

vi.mock('@zextras/carbonio-ui-commons', async () => {
	const actual = await vi.importActual('@zextras/carbonio-ui-commons');
	return {
		...actual,
		useFolder: vi.fn()
	};
});

vi.mock('commons/utilities', async () => {
	const actual = await vi.importActual('commons/utilities');
	return {
		...actual,
		isCaldavChild: vi.fn(),
		isIcsOrCaldavExternalFolder: vi.fn()
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
		vi.mocked(utilities.isIcsOrCaldavExternalFolder).mockReturnValue(false);
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
		vi.mocked(utilities.isIcsOrCaldavExternalFolder).mockReturnValue(true);

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
		vi.mocked(utilities.isIcsOrCaldavExternalFolder).mockReturnValue(true);

		setupTest(
			<OrganizerPart
				invite={{ ...baseInvite, attendees: [{ a: 'me@example.com' }] } as never}
				organizer={organizer as never}
			/>
		);

		expect(screen.getByText(/invited you/i)).toBeVisible();
	});

	test('ParticipantsDisplayerSmall shows a simplified list (no status breakdown) for a non-editor viewer of an external calendar', () => {
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
				canSeeResponseStatus={false}
			/>
		);

		expect(screen.getByText('participants.Invited_Visitor')).toBeVisible();
		expect(screen.queryByText('participants.Not_answered')).not.toBeInTheDocument();
	});

	test('ParticipantsDisplayerSmall hides the response-status breakdown for a plain (non-editor) attendee', () => {
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
				canSeeResponseStatus={false}
			/>
		);

		expect(screen.getByText('participants.Invited_Visitor')).toBeVisible();
		expect(screen.queryByText('participants.Not_answered')).not.toBeInTheDocument();
	});

	test('ParticipantsDisplayerSmall shows the organizer/editor the full response-status breakdown', () => {
		setupTest(
			<ParticipantsDisplayerSmall
				event={
					{
						resource: {
							iAmOrganizer: true,
							calendar: { id: 'int-cal' }
						}
					} as never
				}
				participants={
					{
						NE: [{ name: 'Default User', email: 'default@example.com' }]
					} as never
				}
				canSeeResponseStatus
			/>
		);

		expect(screen.getByText('participants.Not_answered')).toBeVisible();
		expect(screen.queryByText('participants.Invited_Visitor')).not.toBeInTheDocument();
	});

	test('ParticipantsDisplayerSmall shows a self-response status line for the logged-in attendee among multiple invitees, without leaking anyone else’s status', () => {
		setupTest(
			<ParticipantsDisplayerSmall
				event={
					{
						resource: {
							iAmOrganizer: false,
							calendar: { id: 'int-cal' },
							participationStatus: PARTICIPATION_STATUS.NEED_ACTION
						}
					} as never
				}
				participants={
					{
						NE: [
							{ name: 'Me', email: 'me@example.com' },
							{ name: 'Alice', email: 'alice@example.com' },
							{ name: 'Bob', email: 'bob@example.com' }
						]
					} as never
				}
				canSeeResponseStatus={false}
			/>
		);

		expect(screen.getByTestId('SelfResponseStatusText')).toBeVisible();
		expect(screen.getByText('message.you_did_not_answer')).toBeVisible();
		expect(screen.queryByText('participants.Not_answered')).not.toBeInTheDocument();
	});

	test('ParticipantsDisplayerSmall does not show a self-response status line when the logged-in user is not an invitee', () => {
		setupTest(
			<ParticipantsDisplayerSmall
				event={
					{
						resource: {
							iAmOrganizer: false,
							calendar: { id: 'int-cal', owner: 'shared-owner@example.com' }
						}
					} as never
				}
				participants={
					{
						NE: [{ name: 'Default User', email: 'default@example.com' }]
					} as never
				}
				canSeeResponseStatus={false}
			/>
		);

		expect(screen.queryByTestId('SelfResponseStatusText')).not.toBeInTheDocument();
		expect(screen.getByText('participants.Invited_Visitor')).toBeVisible();
		expect(screen.queryByText('participants.Not_answered')).not.toBeInTheDocument();
	});

	test('OrganizerPart does not show "invited you" for CalDAV calendar when logged user is not attendee', () => {
		// CalDAV calendars are children of a datasource root folder
		// The child itself doesn't have dsId/dsType, but its parent does
		vi.mocked(useFolder).mockReturnValue({
			id: 'caldav-cal',
			parent: 'caldav-ds-1',
			l: 'caldav-ds-1'
		} as never);
		vi.mocked(utilities.isCaldavChild).mockReturnValue(true);
		vi.mocked(utilities.isIcsOrCaldavExternalFolder).mockReturnValue(true);

		setupTest(
			<OrganizerPart
				invite={
					{
						...baseInvite,
						ciFolder: 'caldav-cal',
						attendees: [{ a: 'someone@example.com' }]
					} as never
				}
				organizer={organizer as never}
			/>
		);

		expect(screen.queryByText(/invited you/i)).not.toBeInTheDocument();
		expect(screen.getByText(/is the organizer/i)).toBeVisible();
	});

	test('OrganizerPart keeps attendee wording for CalDAV calendar when logged user is attendee', () => {
		// CalDAV calendars are children of a datasource root folder
		// The child itself doesn't have dsId/dsType, but its parent does
		vi.mocked(useFolder).mockReturnValue({
			id: 'caldav-cal',
			parent: 'caldav-ds-1',
			l: 'caldav-ds-1'
		} as never);
		vi.mocked(utilities.isCaldavChild).mockReturnValue(true);
		vi.mocked(utilities.isIcsOrCaldavExternalFolder).mockReturnValue(true);

		setupTest(
			<OrganizerPart
				invite={
					{ ...baseInvite, ciFolder: 'caldav-cal', attendees: [{ a: 'me@example.com' }] } as never
				}
				organizer={organizer as never}
			/>
		);

		expect(screen.getByText(/invited you/i)).toBeVisible();
	});

	test('ParticipantsDisplayerSmall shows a simplified list for a non-editor viewer of a CalDAV calendar', () => {
		setupTest(
			<ParticipantsDisplayerSmall
				event={
					{
						resource: {
							iAmOrganizer: false,
							calendar: { id: 'caldav-cal' }
						}
					} as never
				}
				participants={
					{
						NE: [{ name: 'Default User', email: 'default@example.com' }]
					} as never
				}
				canSeeResponseStatus={false}
			/>
		);

		expect(screen.getByText('participants.Invited_Visitor')).toBeVisible();
		expect(screen.queryByText('participants.Not_answered')).not.toBeInTheDocument();
	});
});
