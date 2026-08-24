/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';

import { PARTICIPATION_STATUS } from '../../../constants/api';
import { reducers } from '../../../store/redux';
import { ParticipantsPart } from '../participants-part';
import * as shell from '@test-mocks/@zextras/carbonio-shell-ui';
import { setupTest } from '@test-setup';

const organizer = { a: 'organizer@example.com', d: 'Organizer Name' };

const baseInvite = {
	ciFolder: 'cal-1',
	isOrganizer: false,
	organizer,
	attendees: [{ a: 'organizer@example.com' }, { a: 'attendee@example.com' }],
	participants: {
		AC: [{ name: 'Alice', email: 'alice@example.com', isOptional: false }],
		NE: [{ name: 'Bob', email: 'bob@example.com', isOptional: false }]
	}
};

const baseEvent = {
	resource: {
		calendar: { id: 'cal-1' },
		organizer: { email: 'organizer@example.com' },
		freeBusy: 'B',
		participationStatus: PARTICIPATION_STATUS.NEED_ACTION
	},
	haveWriteAccess: true
};

describe('ParticipantsPart - response status visibility (CO-4136)', () => {
	beforeEach(() => {
		shell.useUserAccount.mockReturnValue({
			name: 'attendee@example.com',
			displayName: 'Attendee'
		} as never);
	});

	test('shows the full response-status breakdown to the organizer', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupTest(
			<ParticipantsPart
				invite={baseInvite as never}
				event={{ ...baseEvent, resource: { ...baseEvent.resource, iAmOrganizer: true } } as never}
				organizer={organizer as never}
				participants={baseInvite.participants as never}
			/>,
			{ store }
		);

		expect(screen.getByText('PARTICIPANTS.AC_WITH_COUNT')).toBeVisible();
		expect(screen.getByText('PARTICIPANTS.NE_WITH_COUNT')).toBeVisible();
	});

	test('hides the response-status breakdown from a plain (non-editor) attendee', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupTest(
			<ParticipantsPart
				invite={baseInvite as never}
				event={{ ...baseEvent, resource: { ...baseEvent.resource, iAmOrganizer: false } } as never}
				organizer={organizer as never}
				participants={baseInvite.participants as never}
			/>,
			{ store }
		);

		expect(screen.queryByText('PARTICIPANTS.AC_WITH_COUNT')).not.toBeInTheDocument();
		expect(screen.queryByText('PARTICIPANTS.NE_WITH_COUNT')).not.toBeInTheDocument();
		expect(screen.getByText('PARTICIPANTS.ATTENDEES_WITH_COUNT')).toBeVisible();
	});

	test('returns null when there is no organizer', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const { container } = setupTest(
			<ParticipantsPart
				invite={baseInvite as never}
				event={baseEvent as never}
				organizer={undefined as never}
				participants={baseInvite.participants as never}
			/>,
			{ store }
		);

		expect(container).toBeEmptyDOMElement();
	});
});
