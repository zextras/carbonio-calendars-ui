/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { endOfDay, startOfDay } from 'date-fns';

import { inviteToEvent } from './use-invite-to-event';
import type { Invite } from '../types/store/invite';

const BASE_INVITE: Invite = {
	apptId: '101',
	id: '101-1',
	ciFolder: '10',
	attendees: [],
	parent: '10',
	flags: '',
	parts: {} as Invite['parts'],
	alarmValue: undefined,
	alarmString: '',
	class: 'PUB',
	compNum: 0,
	date: 0,
	textDescription: [],
	htmlDescription: [],
	end: { d: '20260415T180000' },
	freeBusy: 'B',
	freeBusyActualStatus: 'B',
	fragment: 'test fragment',
	isOrganizer: true,
	location: 'Rome',
	name: 'Team meeting',
	noBlob: false,
	organizer: { a: 'organizer@example.com', d: 'Organizer', url: '' },
	recurrenceRule: undefined,
	isRespRequested: false,
	start: { d: '20260415T100000' },
	sequenceNumber: 0,
	status: 'CONF',
	transparency: 'O',
	uid: 'uid-123',
	url: '',
	isException: false,
	tagNamesList: '',
	participants: {} as Invite['participants'],
	meta: {},
	allDay: false,
	neverSent: false,
	locationUrl: undefined
};

// 2026-04-15 10:00:00 local time parsed from ICS
const START_ICS_DATE = new Date(2026, 3, 15, 10, 0, 0);
// 2026-04-15 18:00:00 local time parsed from ICS
const END_ICS_DATE = new Date(2026, 3, 15, 18, 0, 0);

describe('inviteToEvent', () => {
	describe('non-allDay event', () => {
		it('uses start.u unix timestamp for start when present', () => {
			const ts = START_ICS_DATE.getTime();
			const invite: Invite = { ...BASE_INVITE, start: { d: '20260415T100000', u: ts } };
			const result = inviteToEvent(invite);
			expect(result.start).toEqual(new Date(ts));
		});

		it('falls back to parsing start.d ICS string when start.u is absent', () => {
			const invite: Invite = { ...BASE_INVITE, start: { d: '20260415T100000' } };
			const result = inviteToEvent(invite);
			expect(result.start).toEqual(START_ICS_DATE);
		});

		it('uses end.u unix timestamp for end when present', () => {
			const ts = END_ICS_DATE.getTime();
			const invite: Invite = { ...BASE_INVITE, end: { d: '20260415T180000', u: ts } };
			const result = inviteToEvent(invite);
			expect(result.end).toEqual(new Date(ts));
		});

		it('falls back to parsing end.d ICS string when end.u is absent', () => {
			const invite: Invite = { ...BASE_INVITE, end: { d: '20260415T180000' } };
			const result = inviteToEvent(invite);
			expect(result.end).toEqual(END_ICS_DATE);
		});

		it('defaults start/end to epoch when d is empty and u is absent', () => {
			// d='' is falsy — treated the same as absent
			const invite: Invite = {
				...BASE_INVITE,
				start: { d: '' } as Invite['start'],
				end: { d: '' } as Invite['end']
			};
			const result = inviteToEvent(invite);
			expect(result.start).toEqual(new Date(0));
			expect(result.end).toEqual(new Date(0));
		});
	});

	describe('allDay event', () => {
		it('returns startOfDay for start and endOfDay for end', () => {
			const invite: Invite = {
				...BASE_INVITE,
				allDay: true,
				start: { d: '20260415T100000' },
				end: { d: '20260415T180000' }
			};
			const result = inviteToEvent(invite);
			expect(result.start).toEqual(startOfDay(START_ICS_DATE));
			expect(result.end).toEqual(endOfDay(END_ICS_DATE));
		});

		it('uses u timestamp as base for startOfDay when start.u is present', () => {
			const ts = START_ICS_DATE.getTime();
			const invite: Invite = {
				...BASE_INVITE,
				allDay: true,
				start: { d: '20260415T100000', u: ts },
				end: { d: '20260415T180000' }
			};
			const result = inviteToEvent(invite);
			expect(result.start).toEqual(startOfDay(new Date(ts)));
		});
	});

	describe('resource fields', () => {
		it('maps invite fields to resource correctly', () => {
			const result = inviteToEvent(BASE_INVITE);
			expect(result.resource).toMatchObject({
				id: BASE_INVITE.apptId,
				inviteId: BASE_INVITE.id,
				ridZ: '',
				calendar: { id: BASE_INVITE.parent },
				iAmOrganizer: true,
				iAmVisitor: false,
				status: BASE_INVITE.status,
				location: BASE_INVITE.location,
				fragment: BASE_INVITE.fragment,
				uid: BASE_INVITE.uid
			});
		});

		it('sets allDay from invite', () => {
			expect(inviteToEvent({ ...BASE_INVITE, allDay: true }).allDay).toBe(true);
			expect(inviteToEvent({ ...BASE_INVITE, allDay: false }).allDay).toBe(false);
			expect(inviteToEvent({ ...BASE_INVITE, allDay: undefined }).allDay).toBe(false);
		});

		it('sets title from invite.name', () => {
			const result = inviteToEvent(BASE_INVITE);
			expect(result.title).toBe(BASE_INVITE.name);
		});
	});
});
