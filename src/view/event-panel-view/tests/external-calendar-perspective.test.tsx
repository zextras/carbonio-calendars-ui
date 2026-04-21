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

	test('ParticipantsDisplayerSmall uses owner perspective for external calendars', () => {
		vi.mocked(useFolder).mockReturnValue({
			id: 'ext-cal',
			f: '#y',
			url: 'https://a/1.ics'
		} as never);
		vi.mocked(utilities.isIcsOrCaldavExternalFolder).mockReturnValue(true);

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

	test('ParticipantsDisplayerSmall replaces logged-in attendee name with You for multiple attendees', () => {
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
						NE: [
							{ name: 'Me', email: 'me@example.com' },
							{ name: 'Alice', email: 'alice@example.com' },
							{ name: 'Bob', email: 'bob@example.com' }
						]
					} as never
				}
			/>
		);

		expect(screen.getByText(/You/i)).toBeVisible();
		expect(screen.getByText('participants.Not_answered')).toBeVisible();
	});

	test('ParticipantsDisplayerSmall hides attendee rows for delegated calendar owner perspective', () => {
		vi.mocked(useFolder).mockReturnValue({ id: 'int-cal', f: '#' } as never);

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
			/>
		);

		expect(screen.queryByText('participants.Not_answered')).not.toBeInTheDocument();
		expect(screen.queryByText('participants.Invited_Visitor')).not.toBeInTheDocument();
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

	test('ParticipantsDisplayerSmall uses owner perspective for CalDAV calendars', () => {
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
			/>
		);

		expect(screen.getByText('participants.Invited_Visitor')).toBeVisible();
		expect(screen.queryByText('participants.Not_answered')).not.toBeInTheDocument();
	});
});
