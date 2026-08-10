/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { act, screen, within } from '@testing-library/react';

import { InviteChangesBanner } from './invite-changes-banner';
import type { InviteChanges } from '../../../types/invite-changes';
import { setupTest } from '@test-setup';

const sectionOrder = (): (string | null)[] =>
	screen.getAllByTestId(/^invite-changes-section-/).map((el) => el.getAttribute('data-testid'));

describe('InviteChangesBanner', () => {
	it('renders nothing when there are no changes at all', () => {
		setupTest(<InviteChangesBanner changes={{}} />);
		expect(screen.queryByTestId('invite-changes-banner')).not.toBeInTheDocument();
	});

	describe('compact case', () => {
		const changes: InviteChanges = {
			message: { before: 'old text', after: 'new text' },
			dateTime: {
				before: 'Dec 31, 2025, 09:00 – 10:00 AM',
				after: 'Jan 01, 2026, 09:00 – 10:00 AM',
				beforeAllDay: false,
				afterAllDay: false
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

		it('never shows the show more/less toggle with 3 sections or fewer', () => {
			setupTest(<InviteChangesBanner changes={changes} />);
			expect(screen.queryByTestId('invite-changes-banner-toggle')).not.toBeInTheDocument();
		});

		it('shows the participants section before the message section', () => {
			setupTest(<InviteChangesBanner changes={changes} />);
			expect(sectionOrder()).toEqual([
				'invite-changes-section-participants',
				'invite-changes-section-dateTime',
				'invite-changes-section-message'
			]);
		});

		it('shows the message change inline, quoted', () => {
			setupTest(<InviteChangesBanner changes={changes} />);
			expect(screen.getByText('"old text" → "new text"')).toBeVisible();
		});

		it('shows a message added from scratch with a + marker instead of an arrow from a blank string', () => {
			setupTest(<InviteChangesBanner changes={{ message: { before: '', after: 'aasd' } }} />);
			expect(screen.getByText('+ "aasd"')).toBeVisible();
		});

		it('shows the pre-formatted date/time change joined by an arrow, next to a clock icon', () => {
			setupTest(<InviteChangesBanner changes={changes} />);
			expect(
				screen.getByText('Dec 31, 2025, 09:00 – 10:00 AM → Jan 01, 2026, 09:00 – 10:00 AM')
			).toBeVisible();
			expect(screen.getByTestId('icon: ClockOutline')).toBeVisible();
		});

		it('shows the participants change inline with +/- prefixes, next to a people icon', () => {
			setupTest(<InviteChangesBanner changes={changes} />);
			expect(screen.getByText('+ Maria Rossi, - Paolo Grande')).toBeVisible();
			expect(screen.getByTestId('icon: PeopleOutline')).toBeVisible();
		});

		it('does not show expand toggles for message or participants', () => {
			setupTest(<InviteChangesBanner changes={changes} />);
			expect(screen.queryByTestId('invite-changes-message-toggle')).not.toBeInTheDocument();
			expect(screen.queryByTestId('invite-changes-participants-toggle')).not.toBeInTheDocument();
		});
	});

	describe('new simple fields', () => {
		it('shows a title change, quoted, with a text label (not an icon)', () => {
			setupTest(
				<InviteChangesBanner changes={{ title: { before: 'Old title', after: 'New title' } }} />
			);
			expect(screen.getByText('"Old title" → "New title"')).toBeVisible();
			expect(screen.getByText('Title:')).toBeVisible();
		});

		it('shows a location change, quoted, next to a pin icon', () => {
			setupTest(
				<InviteChangesBanner changes={{ location: { before: 'Room A', after: 'Room B' } }} />
			);
			expect(screen.getByText('"Room A" → "Room B"')).toBeVisible();
			expect(screen.getByTestId('icon: PinOutline')).toBeVisible();
		});

		it('shows a location added from scratch with a + marker and quotes, no arrow', () => {
			setupTest(<InviteChangesBanner changes={{ location: { before: '', after: 'casa' } }} />);
			expect(screen.getByText('+ "casa"')).toBeVisible();
		});

		it('shows a location removed entirely with a - marker and quotes, no arrow', () => {
			setupTest(<InviteChangesBanner changes={{ location: { before: 'casa', after: '' } }} />);
			expect(screen.getByText('- "casa"')).toBeVisible();
		});

		it('shows added/removed meeting rooms inline with +/- prefixes, next to a building icon', () => {
			setupTest(
				<InviteChangesBanner
					changes={{
						meetingRooms: {
							added: [{ a: 'room@test.com', d: 'Room A' }],
							removed: [{ a: 'room2@test.com', d: 'Room B' }]
						}
					}}
				/>
			);
			expect(screen.getByText('+ Room A, - Room B')).toBeVisible();
			expect(screen.getByTestId('icon: BuildingOutline')).toBeVisible();
		});

		it('shows added/removed equipment inline with +/- prefixes, next to a briefcase icon', () => {
			setupTest(
				<InviteChangesBanner
					changes={{
						equipment: {
							added: [{ a: 'projector@test.com', d: 'Projector' }],
							removed: [{ a: 'laptop@test.com', d: 'Laptop' }]
						}
					}}
				/>
			);
			expect(screen.getByText('+ Projector, - Laptop')).toBeVisible();
			expect(screen.getByTestId('icon: BriefcaseOutline')).toBeVisible();
		});

		it('shows a virtual room link change, unquoted, next to a video icon', () => {
			setupTest(
				<InviteChangesBanner
					changes={{
						virtualRoom: { before: 'https://old.example.com', after: 'https://new.example.com' }
					}}
				/>
			);
			expect(screen.getByText('https://old.example.com → https://new.example.com')).toBeVisible();
			expect(screen.getByTestId('icon: VideoOutline')).toBeVisible();
		});

		it('appends ", All day" to the updated side of the date/time row when the event became all day', () => {
			setupTest(
				<InviteChangesBanner
					changes={{
						dateTime: {
							before: 'before-label',
							after: 'after-label',
							beforeAllDay: false,
							afterAllDay: true
						}
					}}
				/>
			);
			expect(screen.getByText('before-label → after-label, All day')).toBeVisible();
			expect(screen.getByTestId('icon: ClockOutline')).toBeVisible();
		});

		it('appends ", All day" to the previous side of the date/time row when the event stopped being all day', () => {
			setupTest(
				<InviteChangesBanner
					changes={{
						dateTime: {
							before: 'before-label',
							after: 'after-label',
							beforeAllDay: true,
							afterAllDay: false
						}
					}}
				/>
			);
			expect(screen.getByText('before-label, All day → after-label')).toBeVisible();
		});
	});

	describe('detailed message case', () => {
		const longBefore = 'a'.repeat(60);
		const longAfter = 'b'.repeat(60);
		const changes: InviteChanges = {
			message: { before: longBefore, after: longAfter }
		};

		it('shows the summary next to a message icon, and a View details toggle instead of the raw text', () => {
			setupTest(<InviteChangesBanner changes={changes} />);
			expect(screen.getByTestId('icon: MessageSquareOutline')).toBeVisible();
			expect(screen.getByText('updated')).toBeVisible();
			expect(screen.getByTestId('invite-changes-message-toggle')).toBeVisible();
			expect(screen.getByText('View details')).toBeVisible();
			expect(screen.queryByText(`${longBefore} → ${longAfter}`)).not.toBeInTheDocument();
		});

		it('drops the summary and reveals the full before/after text after clicking the toggle', async () => {
			const { user } = setupTest(<InviteChangesBanner changes={changes} />);

			await user.click(screen.getByTestId('invite-changes-message-toggle'));

			expect(screen.queryByText('updated')).not.toBeInTheDocument();
			expect(screen.getByText('Hide details')).toBeVisible();

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

		it('shows a people icon, a count summary, and a View details toggle instead of the raw list', () => {
			setupTest(<InviteChangesBanner changes={changes} />);
			expect(screen.getByTestId('icon: PeopleOutline')).toBeVisible();
			expect(screen.getByText('3 added, 1 removed')).toBeVisible();
			expect(screen.getByTestId('invite-changes-participants-toggle')).toBeVisible();
			expect(screen.getByText('View details')).toBeVisible();
		});

		it('drops the summary and reveals names on the same row (no chips) after clicking the toggle', async () => {
			const { user } = setupTest(<InviteChangesBanner changes={changes} />);

			await user.click(screen.getByTestId('invite-changes-participants-toggle'));

			expect(screen.queryByText('3 added, 1 removed')).not.toBeInTheDocument();
			expect(screen.getByText('Hide details')).toBeVisible();
			// same row as the marker and the toggle, not a separate block below it
			const row = within(screen.getByTestId('invite-changes-participants-toggle-content'));
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

	describe('detailed simple field case', () => {
		const longBefore = 'a'.repeat(60);
		const longAfter = 'b'.repeat(60);

		it('collapses a long title change behind a View details toggle, quoted when expanded', async () => {
			const { user } = setupTest(
				<InviteChangesBanner changes={{ title: { before: longBefore, after: longAfter } }} />
			);

			expect(screen.getByText('Title:')).toBeVisible();
			expect(screen.getByText('updated')).toBeVisible();
			expect(screen.queryByText(`${longBefore} → ${longAfter}`)).not.toBeInTheDocument();

			await user.click(screen.getByTestId('invite-changes-title-toggle'));

			const previousRow = within(screen.getByTestId('invite-changes-title-previous'));
			expect(previousRow.getByText('Previous:')).toBeVisible();
			expect(previousRow.getByText(`"${longBefore}"`)).toBeVisible();

			const updatedRow = within(screen.getByTestId('invite-changes-title-updated'));
			expect(updatedRow.getByText('Updated:')).toBeVisible();
			expect(updatedRow.getByText(`"${longAfter}"`)).toBeVisible();
		});

		it('collapses a long location added from scratch behind a toggle, with a + marker before the quote when expanded', async () => {
			const longValue = 'a'.repeat(90);
			const { user } = setupTest(
				<InviteChangesBanner changes={{ location: { before: '', after: longValue } }} />
			);

			expect(screen.queryByTestId('invite-changes-location-previous')).not.toBeInTheDocument();

			await user.click(screen.getByTestId('invite-changes-location-toggle'));

			expect(screen.queryByTestId('invite-changes-location-previous')).not.toBeInTheDocument();
			const updatedRow = within(screen.getByTestId('invite-changes-location-updated'));
			expect(updatedRow.getByText('Updated:')).toBeVisible();
			expect(updatedRow.getByText(`+ "${longValue}"`)).toBeVisible();
		});

		it('collapses a long location removed entirely behind a toggle, with a - marker before the quote when expanded', async () => {
			const longValue = 'a'.repeat(90);
			const { user } = setupTest(
				<InviteChangesBanner changes={{ location: { before: longValue, after: '' } }} />
			);

			await user.click(screen.getByTestId('invite-changes-location-toggle'));

			expect(screen.queryByTestId('invite-changes-location-updated')).not.toBeInTheDocument();
			const previousRow = within(screen.getByTestId('invite-changes-location-previous'));
			expect(previousRow.getByText('Previous:')).toBeVisible();
			expect(previousRow.getByText(`- "${longValue}"`)).toBeVisible();
		});

		it('collapses a long virtual room change behind a toggle, unquoted when expanded', async () => {
			const before = `https://example.com/${'a'.repeat(60)}`;
			const after = `https://example.com/${'b'.repeat(60)}`;
			const { user } = setupTest(
				<InviteChangesBanner changes={{ virtualRoom: { before, after } }} />
			);

			await user.click(screen.getByTestId('invite-changes-virtualroom-toggle'));

			const previousRow = within(screen.getByTestId('invite-changes-virtualroom-previous'));
			expect(previousRow.getByText('Previous:')).toBeVisible();
			expect(previousRow.getByText(before)).toBeVisible();

			const updatedRow = within(screen.getByTestId('invite-changes-virtualroom-updated'));
			expect(updatedRow.getByText('Updated:')).toBeVisible();
			expect(updatedRow.getByText(after)).toBeVisible();
		});

		it('collapses a long date/time change behind a toggle, keeping the all-day suffix on the updated side', async () => {
			const { user } = setupTest(
				<InviteChangesBanner
					changes={{
						dateTime: {
							before: longBefore,
							after: longAfter,
							beforeAllDay: false,
							afterAllDay: true
						}
					}}
				/>
			);

			await user.click(screen.getByTestId('invite-changes-datetime-toggle'));

			const updatedRow = within(screen.getByTestId('invite-changes-datetime-updated'));
			expect(updatedRow.getByText('Updated:')).toBeVisible();
			expect(updatedRow.getByText(`${longAfter}, All day`)).toBeVisible();
		});
	});

	describe('detailed meeting rooms / equipment case', () => {
		const meetingRooms: InviteChanges['meetingRooms'] = {
			added: [
				{ a: 'r1@test.com', d: 'Room One' },
				{ a: 'r2@test.com', d: 'Room Two' },
				{ a: 'r3@test.com', d: 'Room Three' }
			],
			removed: [{ a: 'r4@test.com', d: 'Room Four' }]
		};
		const equipment: InviteChanges['equipment'] = {
			added: [
				{ a: 'e1@test.com', d: 'Projector' },
				{ a: 'e2@test.com', d: 'Laptop' },
				{ a: 'e3@test.com', d: 'Webcam' }
			],
			removed: [{ a: 'e4@test.com', d: 'Whiteboard' }]
		};

		it('shows a count summary and a toggle instead of the raw list for meeting rooms', () => {
			setupTest(<InviteChangesBanner changes={{ meetingRooms }} />);
			expect(screen.getByTestId('icon: BuildingOutline')).toBeVisible();
			expect(screen.getByText('3 added, 1 removed')).toBeVisible();
			expect(screen.getByTestId('invite-changes-meetingrooms-toggle')).toBeVisible();
		});

		it('reveals the full meeting rooms list on the same row after clicking the toggle', async () => {
			const { user } = setupTest(<InviteChangesBanner changes={{ meetingRooms }} />);

			await user.click(screen.getByTestId('invite-changes-meetingrooms-toggle'));

			const row = within(screen.getByTestId('invite-changes-meetingrooms-toggle-content'));
			expect(row.getByText('+ Room One, + Room Two, + Room Three, - Room Four')).toBeVisible();
		});

		it('shows a count summary and a toggle instead of the raw list for equipment', () => {
			setupTest(<InviteChangesBanner changes={{ equipment }} />);
			expect(screen.getByTestId('icon: BriefcaseOutline')).toBeVisible();
			expect(screen.getByText('3 added, 1 removed')).toBeVisible();
			expect(screen.getByTestId('invite-changes-equipment-toggle')).toBeVisible();
		});

		it('reveals the full equipment list on the same row after clicking the toggle', async () => {
			const { user } = setupTest(<InviteChangesBanner changes={{ equipment }} />);

			await user.click(screen.getByTestId('invite-changes-equipment-toggle'));

			const row = within(screen.getByTestId('invite-changes-equipment-toggle-content'));
			expect(row.getByText('+ Projector, + Laptop, + Webcam, - Whiteboard')).toBeVisible();
		});
	});

	describe('show more / show less', () => {
		const allFieldsChanges: InviteChanges = {
			title: { before: 'Old title', after: 'New title' },
			location: { before: 'Room A', after: 'Room B' },
			virtualRoom: { before: 'https://old.example.com', after: 'https://new.example.com' },
			meetingRooms: { added: [{ a: 'room@test.com', d: 'Room A' }], removed: [] },
			equipment: { added: [{ a: 'projector@test.com', d: 'Projector' }], removed: [] },
			participants: { added: [{ a: 'added@test.com', d: 'Added' }], removed: [] },
			dateTime: {
				before: 'before-label',
				after: 'after-label',
				beforeAllDay: false,
				afterAllDay: true
			},
			message: { before: 'old', after: 'new' }
		};

		it('shows only the first 3 sections (title counts as one of them) when collapsed', () => {
			setupTest(<InviteChangesBanner changes={allFieldsChanges} />);
			expect(sectionOrder()).toEqual([
				'invite-changes-section-title',
				'invite-changes-section-location',
				'invite-changes-section-virtualRoom'
			]);
		});

		it('shows a Show more toggle when there are more than 3 sections', () => {
			setupTest(<InviteChangesBanner changes={allFieldsChanges} />);
			expect(screen.getByText('Show more')).toBeVisible();
		});

		it('reveals every remaining section, in display order, after clicking Show more', async () => {
			const { user } = setupTest(<InviteChangesBanner changes={allFieldsChanges} />);

			await user.click(screen.getByTestId('invite-changes-banner-toggle'));

			expect(sectionOrder()).toEqual([
				'invite-changes-section-title',
				'invite-changes-section-location',
				'invite-changes-section-virtualRoom',
				'invite-changes-section-meetingRooms',
				'invite-changes-section-equipment',
				'invite-changes-section-participants',
				'invite-changes-section-dateTime',
				'invite-changes-section-message'
			]);
			expect(screen.getByText('Show less')).toBeVisible();
		});

		it('collapses back to the first 3 sections after clicking Show less', async () => {
			const { user } = setupTest(<InviteChangesBanner changes={allFieldsChanges} />);

			await user.click(screen.getByTestId('invite-changes-banner-toggle'));
			await user.click(screen.getByTestId('invite-changes-banner-toggle'));

			expect(sectionOrder()).toEqual([
				'invite-changes-section-title',
				'invite-changes-section-location',
				'invite-changes-section-virtualRoom'
			]);
			expect(screen.getByText('Show more')).toBeVisible();
		});

		it('does not show the show more/less toggle with exactly 3 sections', () => {
			setupTest(
				<InviteChangesBanner
					changes={{
						title: { before: 'Old title', after: 'New title' },
						location: { before: 'Room A', after: 'Room B' },
						virtualRoom: { before: 'https://old.example.com', after: 'https://new.example.com' }
					}}
				/>
			);
			expect(screen.queryByTestId('invite-changes-banner-toggle')).not.toBeInTheDocument();
		});
	});

	describe('icon tooltips', () => {
		const allFieldsChanges: InviteChanges = {
			location: { before: 'Room A', after: 'Room B' },
			virtualRoom: { before: 'https://old.example.com', after: 'https://new.example.com' },
			meetingRooms: {
				added: [{ a: 'room@test.com', d: 'Room A' }],
				removed: []
			},
			equipment: {
				added: [{ a: 'projector@test.com', d: 'Projector' }],
				removed: []
			},
			participants: {
				added: [{ a: 'maria@test.com', d: 'Maria Rossi' }],
				removed: []
			},
			dateTime: {
				before: 'Dec 31, 2025, 09:00 – 10:00 AM',
				after: 'Jan 01, 2026, 09:00 – 10:00 AM',
				beforeAllDay: false,
				afterAllDay: false
			},
			message: { before: 'old text', after: 'new text' }
		};

		const hoverAndFindTooltip = async (
			user: ReturnType<typeof setupTest>['user'],
			iconTestId: string,
			label: string
		): Promise<void> => {
			const showMoreToggle = screen.queryByTestId('invite-changes-banner-toggle');
			if (showMoreToggle) {
				await user.click(showMoreToggle);
			}
			await user.hover(screen.getByTestId(iconTestId));
			act(() => {
				vi.advanceTimersByTime(3000);
			});
			expect(await screen.findByText(label)).toBeVisible();
		};

		it('shows a "Location" tooltip on hovering the pin icon', async () => {
			const { user } = setupTest(<InviteChangesBanner changes={allFieldsChanges} />);
			await hoverAndFindTooltip(user, 'icon: PinOutline', 'Location');
		});

		it('shows a "Virtual room" tooltip on hovering the video icon', async () => {
			const { user } = setupTest(<InviteChangesBanner changes={allFieldsChanges} />);
			await hoverAndFindTooltip(user, 'icon: VideoOutline', 'Virtual room');
		});

		it('shows a "MeetingRooms" tooltip on hovering the building icon', async () => {
			const { user } = setupTest(<InviteChangesBanner changes={allFieldsChanges} />);
			await hoverAndFindTooltip(user, 'icon: BuildingOutline', 'MeetingRooms');
		});

		it('shows an "Equipment" tooltip on hovering the briefcase icon', async () => {
			const { user } = setupTest(<InviteChangesBanner changes={allFieldsChanges} />);
			await hoverAndFindTooltip(user, 'icon: BriefcaseOutline', 'Equipment');
		});

		it('shows a "Participants" tooltip on hovering the people icon', async () => {
			const { user } = setupTest(<InviteChangesBanner changes={allFieldsChanges} />);
			await hoverAndFindTooltip(user, 'icon: PeopleOutline', 'Participants');
		});

		it('shows a "Date and time" tooltip on hovering the clock icon', async () => {
			const { user } = setupTest(<InviteChangesBanner changes={allFieldsChanges} />);
			await hoverAndFindTooltip(user, 'icon: ClockOutline', 'Date and time');
		});

		it('shows a "Message" tooltip on hovering the message icon', async () => {
			const { user } = setupTest(<InviteChangesBanner changes={allFieldsChanges} />);
			await hoverAndFindTooltip(user, 'icon: MessageSquareOutline', 'Message');
		});

		it('shows a "Date and time" tooltip on hovering the clock icon for an all-day-only change', async () => {
			const { user } = setupTest(
				<InviteChangesBanner
					changes={{
						dateTime: {
							before: 'before-label',
							after: 'after-label',
							beforeAllDay: false,
							afterAllDay: true
						}
					}}
				/>
			);
			await hoverAndFindTooltip(user, 'icon: ClockOutline', 'Date and time');
		});
	});
});
