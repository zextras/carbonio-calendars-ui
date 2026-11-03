/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { buildPrintModel, formatParticipant, htmlToText, sanitizeText } from './print-model';
import { PARTICIPANT_ROLE, PARTICIPATION_STATUS } from 'constants/api';
import mockedData from 'test/generators';
import { Attendee } from 'types/store/invite';

const attendee = (a: string, d: string, role: Attendee['role']): Attendee => ({
	a,
	d,
	role,
	ptst: PARTICIPATION_STATUS.NEED_ACTION,
	rsvp: true,
	url: ''
});

describe('sanitizeText', () => {
	it('normalizes line endings and keeps tabs and line feeds', () => {
		expect(sanitizeText('a\r\nb\rc\td\ne')).toBe('a\nb\nc\td\ne');
	});

	it('removes C0 and C1 control characters', () => {
		expect(sanitizeText('a\u0000b\u0007c\u001bd\u007fe\u0085f\u009fg')).toBe('abcdefg');
	});

	it('returns an empty string for missing values', () => {
		expect(sanitizeText(undefined)).toBe('');
		expect(sanitizeText(null)).toBe('');
	});
});

describe('htmlToText', () => {
	it('keeps only the text, never the markup', () => {
		expect(htmlToText('<p>Hello <b>team</b></p><img src="https://evil.example/x.png">')).toBe(
			'Hello team'
		);
	});

	it('drops scripts, styles and head content', () => {
		const html =
			'<html><head><title>T</title><style>p{color:red}</style></head>' +
			'<body><script>window.pwned = true</script><p>Notes</p></body></html>';
		expect(htmlToText(html)).toBe('Notes');
	});

	it('does not run any script or event handler of the description', () => {
		const pwned = vi.fn();
		Object.assign(window, { pwned });
		htmlToText('<img src="x" onerror="window.pwned()"><svg onload="window.pwned()"></svg>');
		expect(pwned).not.toHaveBeenCalled();
	});

	it('turns line breaks and blocks into new lines', () => {
		expect(htmlToText('one<br>two<div>three</div><p>four</p>')).toBe('one\ntwo\nthree\nfour');
	});

	it('returns an empty string without html', () => {
		expect(htmlToText(undefined)).toBe('');
	});
});

describe('formatParticipant', () => {
	it.each([
		['Mario', 'mario@example.com', 'Mario <mario@example.com>'],
		['', 'mario@example.com', 'mario@example.com'],
		['mario@example.com', 'mario@example.com', 'mario@example.com'],
		['Mario', undefined, 'Mario'],
		[undefined, undefined, '']
	])('formats %s / %s as %s', (name, email, expected) => {
		expect(formatParticipant(name, email)).toBe(expected);
	});
});

describe('buildPrintModel', () => {
	it('uses the dates of the clicked occurrence, not the series ones of the invite', () => {
		const occurrence = (day: string): ReturnType<typeof mockedData.getEvent> =>
			mockedData.getEvent({
				start: new Date(`2026-11-${day}T09:00:00Z`),
				end: new Date(`2026-11-${day}T10:00:00Z`)
			});
		const seriesInvite = (day: string): ReturnType<typeof mockedData.getInvite> =>
			mockedData.getInvite({ context: { start: { d: `202611${day}T100000`, tz: 'Europe/Rome' } } });
		const when = (
			event: ReturnType<typeof occurrence>,
			invite: ReturnType<typeof seriesInvite>
		): string | undefined =>
			buildPrintModel({ event, invite }).fields.find((field) => field.label === 'label.when')
				?.value;

		expect(when(occurrence('13'), seriesInvite('10'))).not.toBe(
			when(occurrence('14'), seriesInvite('10'))
		);
		expect(when(occurrence('13'), seriesInvite('10'))).toBe(
			when(occurrence('13'), seriesInvite('03'))
		);
	});

	it('lists title, location, calendar, organizer, attendees and the plain description', () => {
		const event = mockedData.getEvent({ resource: { calendar: { name: 'Work' } } });
		const invite = mockedData.getInvite({
			context: {
				name: 'Sprint review',
				location: 'Room Blu',
				organizer: { a: 'org@example.com', d: 'Org Name', url: '' },
				attendees: [
					attendee('req@example.com', 'Req', PARTICIPANT_ROLE.REQUIRED),
					attendee('opt@example.com', 'Opt', PARTICIPANT_ROLE.OPTIONAL)
				],
				textDescription: [{ _content: 'Agenda\r\nitem' }],
				htmlDescription: [{ _content: '<p>ignored</p>' }]
			}
		});

		const model = buildPrintModel({ event, invite });

		expect(model.title).toBe('Sprint review');
		expect(model.fields).toEqual(
			expect.arrayContaining([
				{ label: 'label.location', value: 'Room Blu' },
				{ label: 'label.calendar', value: 'Work' },
				{ label: 'message.organizer', value: 'Org Name <org@example.com>' }
			])
		);
		expect(model.attendees.values).toEqual([
			'Req <req@example.com>',
			'Opt <opt@example.com> (label.optional)'
		]);
		expect(model.description).toBe('Agenda\nitem');
	});

	it('falls back to the html description as plain text', () => {
		const invite = mockedData.getInvite({
			context: {
				textDescription: [],
				htmlDescription: [{ _content: '<p>From <i>html</i></p><script>alert(1)</script>' }]
			}
		});

		const model = buildPrintModel({ event: mockedData.getEvent(), invite });

		expect(model.description).toBe('From html');
	});

	it('leaves out fields without a value', () => {
		const event = mockedData.getEvent({ resource: { location: '' } });
		const invite = mockedData.getInvite({ context: { location: '' } });

		const model = buildPrintModel({ event, invite });

		expect(model.fields.map((field) => field.label)).not.toContain('label.location');
	});

	it.each([
		['PRI', 'label.private'],
		['PUB', 'label.no_subject']
	] as const)('uses a fallback title for a %s appointment without subject', (cls, expected) => {
		const event = mockedData.getEvent({ title: '', resource: { class: cls } });
		const invite = mockedData.getInvite({ context: { name: '', class: cls } });

		expect(buildPrintModel({ event, invite }).title).toBe(expected);
	});
});
