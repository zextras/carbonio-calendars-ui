/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { formatInviteChangesText, parseInviteChangesFromText } from '../invite-changes-text';
import type { InviteChanges } from '../../types/invite-changes';

describe('formatInviteChangesText / parseInviteChangesFromText', () => {
	it('returns an empty string when there are no changes', () => {
		expect(formatInviteChangesText({})).toBe('');
	});

	it('returns undefined when the text has no changes block', () => {
		expect(parseInviteChangesFromText('just a regular message, nothing special')).toBeUndefined();
	});

	it('returns undefined for empty/undefined input', () => {
		expect(parseInviteChangesFromText(undefined)).toBeUndefined();
		expect(parseInviteChangesFromText('')).toBeUndefined();
	});

	it('round-trips a message change, including multi-line text', () => {
		const changes: InviteChanges = {
			message: { before: 'line1\nline2', after: 'new line1\n\nnew line2' }
		};
		const formatted = formatInviteChangesText(changes);
		expect(parseInviteChangesFromText(formatted)).toEqual(changes);
	});

	it('round-trips a date/time change', () => {
		const changes: InviteChanges = {
			dateTime: {
				before: 'Tuesday, August 04, 2026, 11:00 – 11:30 AM',
				after: 'Wednesday, August 05, 2026, 09:00 – 09:30 AM'
			}
		};
		const formatted = formatInviteChangesText(changes);
		expect(parseInviteChangesFromText(formatted)).toEqual(changes);
	});

	it('round-trips added and removed participants with display names', () => {
		const changes: InviteChanges = {
			participants: {
				added: [
					{ a: 'new1@test.com', d: 'New One' },
					{ a: 'new2@test.com', d: 'New Two' }
				],
				removed: [{ a: 'old@test.com', d: 'Old Person' }]
			}
		};
		const formatted = formatInviteChangesText(changes);
		expect(parseInviteChangesFromText(formatted)).toEqual(changes);
	});

	it('round-trips participants without a display name', () => {
		const changes: InviteChanges = {
			participants: {
				added: [{ a: 'noname@test.com' }],
				removed: []
			}
		};
		const formatted = formatInviteChangesText(changes);
		expect(parseInviteChangesFromText(formatted)).toEqual(changes);
	});

	it('round-trips only added participants (removed omitted entirely)', () => {
		const changes: InviteChanges = {
			participants: { added: [{ a: 'new@test.com', d: 'New' }], removed: [] }
		};
		const formatted = formatInviteChangesText(changes);
		expect(formatted).not.toContain('Participants removed:');
		expect(parseInviteChangesFromText(formatted)).toEqual(changes);
	});

	it('round-trips a combination of message, date/time, and participant changes', () => {
		const changes: InviteChanges = {
			message: { before: 'old', after: 'new' },
			dateTime: { before: 'before-label', after: 'after-label' },
			participants: {
				added: [{ a: 'added@test.com', d: 'Added' }],
				removed: [{ a: 'removed@test.com', d: 'Removed' }]
			}
		};
		const formatted = formatInviteChangesText(changes);
		expect(parseInviteChangesFromText(formatted)).toEqual(changes);
	});

	it('produces a human-readable block embeddable inside the existing invite text', () => {
		const changes: InviteChanges = { message: { before: 'old', after: 'new' } };
		const formatted = formatInviteChangesText(changes);
		expect(formatted).toContain('What changed:');
		expect(formatted).toContain('Message:');
	});

	it('still parses correctly when embedded inside surrounding boilerplate text', () => {
		const changes: InviteChanges = {
			participants: { added: [{ a: 'a@test.com', d: 'A' }], removed: [] }
		};
		const formatted = formatInviteChangesText(changes);
		const wrapped = `Subject: test\nOrganizer: Someone\n\nInvitees: a@test.com\n${formatted}\n\nActual user message here`;
		expect(parseInviteChangesFromText(wrapped)).toEqual(changes);
	});
});
