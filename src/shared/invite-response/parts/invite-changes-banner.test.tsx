/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen, within } from '@testing-library/react';

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

		it('never shows a toggle for the whole banner', () => {
			setupTest(<InviteChangesBanner changes={changes} />);
			expect(screen.queryByTestId('invite-changes-toggle')).not.toBeInTheDocument();
		});

		it('shows the participants field before the message field', () => {
			setupTest(<InviteChangesBanner changes={changes} />);
			const labels = screen.getAllByText(/^(Participants|Message):$/).map((el) => el.textContent);
			expect(labels).toEqual(['Participants:', 'Message:']);
		});

		it('renders every field in the same order as the editor', () => {
			const allFieldsChanges: InviteChanges = {
				title: { before: 'Old title', after: 'New title' },
				location: { before: 'Room A', after: 'Room B' },
				resources: {
					added: [{ a: 'room@test.com', d: 'Room A' }],
					removed: []
				},
				virtualRoom: { before: 'https://old.example.com', after: 'https://new.example.com' },
				participants: {
					added: [{ a: 'added@test.com', d: 'Added' }],
					removed: []
				},
				dateTime: { before: 'before-label', after: 'after-label' },
				allDay: { before: false, after: true },
				message: { before: 'old', after: 'new' }
			};
			setupTest(<InviteChangesBanner changes={allFieldsChanges} />);
			const labels = screen
				.getAllByText(/^(Title|Location|Resources|Virtual room|Participants|Date & Time|Message):$/)
				.map((el) => el.textContent);
			expect(labels).toEqual([
				'Title:',
				'Location:',
				'Resources:',
				'Virtual room:',
				'Participants:',
				'Date & Time:',
				'Message:'
			]);
		});

		it('shows the message change inline, quoted', () => {
			setupTest(<InviteChangesBanner changes={changes} />);
			expect(screen.getByText('"old text" → "new text"')).toBeVisible();
		});

		it('shows a quoted placeholder for an empty message side instead of a blank string', () => {
			setupTest(<InviteChangesBanner changes={{ message: { before: '', after: 'aasd' } }} />);
			expect(screen.getByText('"(no message)" → "aasd"')).toBeVisible();
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

	describe('new simple fields', () => {
		it('shows a title change', () => {
			setupTest(
				<InviteChangesBanner changes={{ title: { before: 'Old title', after: 'New title' } }} />
			);
			expect(screen.getByText('Old title → New title')).toBeVisible();
		});

		it('shows a location change', () => {
			setupTest(
				<InviteChangesBanner changes={{ location: { before: 'Room A', after: 'Room B' } }} />
			);
			expect(screen.getByText('Room A → Room B')).toBeVisible();
		});

		it('shows added/removed resources inline with +/- prefixes, no chips', () => {
			setupTest(
				<InviteChangesBanner
					changes={{
						resources: {
							added: [{ a: 'room@test.com', d: 'Room A' }],
							removed: [{ a: 'projector@test.com', d: 'Projector' }]
						}
					}}
				/>
			);
			expect(screen.getByText('+ Room A, - Projector')).toBeVisible();
		});

		it('shows a virtual room link change', () => {
			setupTest(
				<InviteChangesBanner
					changes={{
						virtualRoom: { before: 'https://old.example.com', after: 'https://new.example.com' }
					}}
				/>
			);
			expect(screen.getByText('https://old.example.com → https://new.example.com')).toBeVisible();
		});

		it('appends "all day" to the Date & Time row when the event became all day', () => {
			setupTest(
				<InviteChangesBanner
					changes={{
						dateTime: { before: 'before-label', after: 'after-label' },
						allDay: { before: false, after: true }
					}}
				/>
			);
			expect(screen.getByText('before-label → after-label - all day')).toBeVisible();
		});

		it('appends "not all day" to the Date & Time row when the event stopped being all day', () => {
			setupTest(
				<InviteChangesBanner
					changes={{
						dateTime: { before: 'before-label', after: 'after-label' },
						allDay: { before: true, after: false }
					}}
				/>
			);
			expect(screen.getByText('before-label → after-label - not all day')).toBeVisible();
		});

		it('shows just "all day" with no dash on the Date & Time row when only all-day changed', () => {
			setupTest(<InviteChangesBanner changes={{ allDay: { before: false, after: true } }} />);
			expect(screen.getByText('Date & Time:')).toBeVisible();
			expect(screen.getByText('all day')).toBeVisible();
		});
	});

	describe('detailed message case', () => {
		const longBefore = 'a'.repeat(60);
		const longAfter = 'b'.repeat(60);
		const changes: InviteChanges = {
			message: { before: longBefore, after: longAfter }
		};

		it('shows the label and the summary as separate text nodes, and a Compare full text toggle instead of the raw text', () => {
			setupTest(<InviteChangesBanner changes={changes} />);
			expect(screen.getByText('Message:')).toBeVisible();
			expect(screen.getByText('updated')).toBeVisible();
			expect(screen.getByTestId('invite-changes-message-toggle')).toBeVisible();
			expect(screen.queryByText(`${longBefore} → ${longAfter}`)).not.toBeInTheDocument();
		});

		it('drops the summary and reveals the full before/after text after clicking the toggle', async () => {
			const { user } = setupTest(<InviteChangesBanner changes={changes} />);

			await user.click(screen.getByTestId('invite-changes-message-toggle'));

			expect(screen.queryByText('Message:')).not.toBeInTheDocument();
			expect(screen.queryByText('updated')).not.toBeInTheDocument();
			expect(screen.getByText('Message')).toBeVisible();

			// Previous and Updated are on separate rows, each with a bold label
			// and the text wrapped in quotes
			const previousRow = within(screen.getByTestId('invite-changes-message-previous'));
			expect(previousRow.getByText('Previous:')).toBeVisible();
			expect(previousRow.getByText(`"${longBefore}"`)).toBeVisible();

			const updatedRow = within(screen.getByTestId('invite-changes-message-updated'));
			expect(updatedRow.getByText('Updated:')).toBeVisible();
			expect(updatedRow.getByText(`"${longAfter}"`)).toBeVisible();
		});

		it('shows a downward chevron when collapsed and an upward one after expanding', async () => {
			const { user } = setupTest(<InviteChangesBanner changes={changes} />);

			const toggle = screen.getByTestId('invite-changes-message-toggle');
			expect(within(toggle).getByTestId('icon: ChevronDownOutline')).toBeVisible();

			await user.click(toggle);

			expect(within(toggle).getByTestId('icon: ChevronUpOutline')).toBeVisible();
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

		it('shows a bold label, a regular-weight count summary, and a View names toggle instead of the raw list', () => {
			setupTest(<InviteChangesBanner changes={changes} />);
			expect(screen.getByText('Participants:')).toBeVisible();
			expect(screen.getByText('3 added, 1 removed')).toBeVisible();
			expect(screen.getByTestId('invite-changes-participants-toggle')).toBeVisible();
		});

		it('drops the summary and reveals names on the same row (no chips) after clicking View names', async () => {
			const { user } = setupTest(<InviteChangesBanner changes={changes} />);

			await user.click(screen.getByTestId('invite-changes-participants-toggle'));

			expect(screen.queryByText('3 added, 1 removed')).not.toBeInTheDocument();
			// same row as the label and the toggle, not a separate block below it
			const row = within(screen.getByTestId('invite-changes-participants-toggle-content'));
			expect(row.getByText('Participants:')).toBeVisible();
			expect(
				row.getByText('+ Attendee One, + Attendee Two, + Attendee Three, - Removed One')
			).toBeVisible();
		});

		it('shows a downward chevron when collapsed and an upward one after expanding', async () => {
			const { user } = setupTest(<InviteChangesBanner changes={changes} />);

			const toggle = screen.getByTestId('invite-changes-participants-toggle');
			expect(within(toggle).getByTestId('icon: ChevronDownOutline')).toBeVisible();

			await user.click(toggle);

			expect(within(toggle).getByTestId('icon: ChevronUpOutline')).toBeVisible();
		});
	});
});
