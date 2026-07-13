/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { useFolder } from '@zextras/carbonio-ui-commons';

import { OrganizerPart } from '../organizer-part';
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
		isIcsOrCaldavExternalFolder: vi.fn()
	};
});

const LOGGED_USER = 'logged-user@test.com';
const SHARED_ACCOUNT = 'shared-account@test.com';
const DELEGATE = 'delegate@test.com';

const sharedCalendar = { id: 'shared-cal', f: '#', owner: SHARED_ACCOUNT };
const ownCalendar = { id: 'own-cal', f: '#' };

const buildInvite = (organizer: Record<string, unknown>, isOrganizer = false): unknown => ({
	ciFolder: 'cal',
	isOrganizer,
	organizer,
	attendees: [{ a: LOGGED_USER }]
});

describe('organizer part', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(utilities.isIcsOrCaldavExternalFolder).mockReturnValue(false);
		shell.useUserAccount.mockReturnValue({
			name: LOGGED_USER,
			displayName: 'Me'
		} as never);
	});

	describe('when the appointment is created on behalf of the organizer', () => {
		test('the logged user delegate is shown as the organizer of the shared calendar', () => {
			vi.mocked(useFolder).mockReturnValue(sharedCalendar as never);
			const organizer = { a: SHARED_ACCOUNT, d: 'Shared Account', sentBy: LOGGED_USER };

			setupTest(
				<OrganizerPart
					invite={buildInvite(organizer) as never}
					organizer={organizer as never}
					calendarOwner={SHARED_ACCOUNT}
				/>
			);

			expect(screen.getByText(/You/)).toBeVisible();
			expect(screen.getByText(/are the organizer/)).toBeVisible();
			expect(screen.getByTestId('OnBehalfOf')).toHaveTextContent(SHARED_ACCOUNT);
		});

		test('another delegate is shown as the creator, with the organizer as the account it acts for', () => {
			vi.mocked(useFolder).mockReturnValue(ownCalendar as never);
			const organizer = { a: SHARED_ACCOUNT, d: 'Shared Account', sentBy: DELEGATE };

			setupTest(
				<OrganizerPart invite={buildInvite(organizer) as never} organizer={organizer as never} />
			);

			// the delegate is both the subject of the sentence and the address of the chip
			expect(screen.getAllByText(DELEGATE)).not.toHaveLength(0);
			expect(screen.getByText(/invited you/)).toBeVisible();
			expect(screen.getByTestId('OnBehalfOf')).toHaveTextContent(SHARED_ACCOUNT);
		});

		test('the chip holds the delegate address, not the organizer one', () => {
			vi.mocked(useFolder).mockReturnValue(ownCalendar as never);
			const organizer = { a: SHARED_ACCOUNT, d: 'Shared Account', sentBy: DELEGATE };

			setupTest(
				<OrganizerPart invite={buildInvite(organizer) as never} organizer={organizer as never} />
			);

			expect(screen.getByTestId('Chip')).toHaveTextContent(DELEGATE);
			expect(screen.getByTestId('Chip')).not.toHaveTextContent(SHARED_ACCOUNT);
		});
	});

	describe('when the appointment is not created on behalf of the organizer', () => {
		test('no "on behalf of" is shown and the organizer keeps being the subject', () => {
			vi.mocked(useFolder).mockReturnValue(ownCalendar as never);
			const organizer = { a: SHARED_ACCOUNT, d: 'Shared Account' };

			setupTest(
				<OrganizerPart invite={buildInvite(organizer) as never} organizer={organizer as never} />
			);

			expect(screen.getByText('Shared Account')).toBeVisible();
			expect(screen.getByText(/invited you/)).toBeVisible();
			expect(screen.queryByTestId('OnBehalfOf')).not.toBeInTheDocument();
		});

		test('a sentBy equal to the organizer is not treated as a delegation', () => {
			vi.mocked(useFolder).mockReturnValue(ownCalendar as never);
			const organizer = { a: SHARED_ACCOUNT, d: 'Shared Account', sentBy: SHARED_ACCOUNT };

			setupTest(
				<OrganizerPart invite={buildInvite(organizer) as never} organizer={organizer as never} />
			);

			expect(screen.getByText('Shared Account')).toBeVisible();
			expect(screen.queryByTestId('OnBehalfOf')).not.toBeInTheDocument();
		});

		test('the logged user organizer keeps seeing itself as the organizer', () => {
			vi.mocked(useFolder).mockReturnValue(ownCalendar as never);
			const organizer = { a: LOGGED_USER, d: 'Me' };

			setupTest(
				<OrganizerPart
					invite={buildInvite(organizer, true) as never}
					organizer={organizer as never}
				/>
			);

			expect(screen.getByText(/are the organizer/)).toBeVisible();
			expect(screen.queryByTestId('OnBehalfOf')).not.toBeInTheDocument();
		});
	});
});
