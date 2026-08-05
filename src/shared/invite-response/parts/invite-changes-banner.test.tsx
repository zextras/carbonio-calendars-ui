/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';

import { InviteChangesBanner } from './invite-changes-banner';
import type { InviteChanges } from '../../../types/invite-changes';
import { setupTest } from '@test-setup';

describe('InviteChangesBanner', () => {
	it('renders nothing when there are no changes at all', () => {
		setupTest(<InviteChangesBanner changes={{}} />);
		expect(screen.queryByTestId('invite-changes-banner')).not.toBeInTheDocument();
	});

	describe('compact case', () => {
		const changes: InviteChanges = {
			message: { before: 'old text', after: 'new text' },
			dateTime: {
				before: 'Wednesday, December 31, 2025, 09:00 – 10:00 AM',
				after: 'Thursday, January 01, 2026, 09:00 – 10:00 AM'
			},
			participants: {
				added: [{ a: 'maria@test.com', d: 'Maria Rossi' }],
				removed: [{ a: 'paolo@test.com', d: 'Paolo Grande' }]
			}
		};

		it('shows the banner header', () => {
			setupTest(<InviteChangesBanner changes={changes} />);
			expect(screen.getByText('This invitation was updated')).toBeVisible();
		});

		it('does not show a header Hide/Show toggle', () => {
			setupTest(<InviteChangesBanner changes={changes} />);
			expect(screen.queryByTestId('invite-changes-toggle')).not.toBeInTheDocument();
		});

		it('shows the message change inline', () => {
			setupTest(<InviteChangesBanner changes={changes} />);
			expect(screen.getByText('old text → new text')).toBeVisible();
		});

		it('shows a placeholder for an empty message side instead of a blank string', () => {
			setupTest(<InviteChangesBanner changes={{ message: { before: '', after: 'aasd' } }} />);
			expect(screen.getByText('(no message) → aasd')).toBeVisible();
		});

		it('shows the pre-formatted date/time change joined by an arrow', () => {
			setupTest(<InviteChangesBanner changes={changes} />);
			expect(
				screen.getByText(
					'Wednesday, December 31, 2025, 09:00 – 10:00 AM → Thursday, January 01, 2026, 09:00 – 10:00 AM'
				)
			).toBeVisible();
		});

		it('shows the participants change inline with +/- prefixes', () => {
			setupTest(<InviteChangesBanner changes={changes} />);
			expect(screen.getByText('+ Maria Rossi, - Paolo Grande')).toBeVisible();
		});

		it('does not show expand toggles for message or participants', () => {
			setupTest(<InviteChangesBanner changes={changes} />);
			expect(screen.queryByTestId('invite-changes-message-toggle')).not.toBeInTheDocument();
			expect(screen.queryByTestId('invite-changes-participants-toggle')).not.toBeInTheDocument();
		});
	});

	describe('detailed message case', () => {
		const longBefore = 'a'.repeat(60);
		const longAfter = 'b'.repeat(60);
		const changes: InviteChanges = {
			message: { before: longBefore, after: longAfter }
		};

		it('shows a summary and a Compare full text toggle instead of the raw text', () => {
			setupTest(<InviteChangesBanner changes={changes} />);
			expect(screen.getByText('updated')).toBeVisible();
			expect(screen.getByTestId('invite-changes-message-toggle')).toBeVisible();
			expect(screen.queryByText(`${longBefore} → ${longAfter}`)).not.toBeInTheDocument();
		});

		it('reveals the full before/after text after clicking the toggle', async () => {
			const { user } = setupTest(<InviteChangesBanner changes={changes} />);

			await user.click(screen.getByTestId('invite-changes-message-toggle'));

			expect(screen.getByText(`Before: ${longBefore}`)).toBeVisible();
			expect(screen.getByText(`After: ${longAfter}`)).toBeVisible();
		});

		it('shows a header Hide/Show toggle since the content is detailed', () => {
			setupTest(<InviteChangesBanner changes={changes} />);
			expect(screen.getByTestId('invite-changes-toggle')).toBeVisible();
		});

		it('hides the whole body when the header toggle is clicked', async () => {
			const { user } = setupTest(<InviteChangesBanner changes={changes} />);

			expect(screen.getByText('updated')).toBeVisible();

			await user.click(screen.getByTestId('invite-changes-toggle'));

			expect(screen.queryByText('updated')).not.toBeInTheDocument();
		});
	});

	describe('detailed participants case', () => {
		const changes: InviteChanges = {
			participants: {
				added: [
					{ a: 'a1@test.com', d: 'Attendee One' },
					{ a: 'a2@test.com', d: 'Attendee Two' },
					{ a: 'a3@test.com', d: 'Attendee Three' }
				],
				removed: [{ a: 'r1@test.com', d: 'Removed One' }]
			}
		};

		it('shows a count summary and a View names toggle instead of the raw list', () => {
			setupTest(<InviteChangesBanner changes={changes} />);
			expect(screen.getByText('3 added, 1 removed')).toBeVisible();
			expect(screen.getByTestId('invite-changes-participants-toggle')).toBeVisible();
		});

		it('reveals participant chips after clicking View names', async () => {
			const { user } = setupTest(<InviteChangesBanner changes={changes} />);

			await user.click(screen.getByTestId('invite-changes-participants-toggle'));

			expect(screen.getByText('Attendee One')).toBeVisible();
			expect(screen.getByText('Attendee Two')).toBeVisible();
			expect(screen.getByText('Attendee Three')).toBeVisible();
			expect(screen.getByText('Removed One')).toBeVisible();
		});
	});
});
