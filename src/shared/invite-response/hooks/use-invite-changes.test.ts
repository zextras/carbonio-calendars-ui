/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useInviteChanges } from './use-invite-changes';
import { setupHook } from '@test-setup';

const buildMailMsg = (xprop?: unknown): any => ({
	invite: [{ comp: [{ xprop }] }]
});

describe('useInviteChanges', () => {
	it('returns undefined when there is no xprop at all', () => {
		const { result } = setupHook(useInviteChanges, {
			initialProps: [buildMailMsg(undefined)]
		});
		expect(result.current).toBeUndefined();
	});

	it('returns undefined when the X-CRB-CHANGES xprop is missing', () => {
		const { result } = setupHook(useInviteChanges, {
			initialProps: [buildMailMsg([{ name: 'X-CRB-MEETING-ROOM', value: 'X-CRB-MEETING-ROOM' }])]
		});
		expect(result.current).toBeUndefined();
	});

	it('returns undefined when the xprop value is malformed JSON', () => {
		const { result } = setupHook(useInviteChanges, {
			initialProps: [buildMailMsg([{ name: 'X-CRB-CHANGES', value: '{not valid json' }])]
		});
		expect(result.current).toBeUndefined();
	});

	it('parses a valid X-CRB-CHANGES xprop into the InviteChanges object', () => {
		const changes = { message: { before: 'old', after: 'new' } };
		const { result } = setupHook(useInviteChanges, {
			initialProps: [buildMailMsg([{ name: 'X-CRB-CHANGES', value: JSON.stringify(changes) }])]
		});
		expect(result.current).toEqual(changes);
	});

	it('finds the changes xprop alongside other unrelated xprops', () => {
		const changes = { participants: { added: [{ a: 'a@test.com' }], removed: [] } };
		const { result } = setupHook(useInviteChanges, {
			initialProps: [
				buildMailMsg([
					{ name: 'X-CRB-MEETING-ROOM', value: 'X-CRB-MEETING-ROOM' },
					{ name: 'X-CRB-CHANGES', value: JSON.stringify(changes) }
				])
			]
		});
		expect(result.current).toEqual(changes);
	});

	describe('when the value is still iCalendar-TEXT-escaped', () => {
		// RFC 5545 TEXT escaping: \\ -> \, \, -> ,, \; -> ;
		const icsEscape = (value: string): string =>
			value.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;');

		it('still parses a JSON value escaped with backslash-comma sequences', () => {
			const changes = {
				participants: {
					added: [{ a: 'a@test.com', d: 'A, B' }],
					removed: []
				}
			};
			const { result } = setupHook(useInviteChanges, {
				initialProps: [
					buildMailMsg([{ name: 'X-CRB-CHANGES', value: icsEscape(JSON.stringify(changes)) }])
				]
			});
			expect(result.current).toEqual(changes);
		});

		it('still parses when the newline escape arrives with a single backslash instead of doubled', () => {
			// The JSON string's own "\n" escape is 2 chars (backslash, n). If the
			// server's ICS encoder doesn't double the pre-existing backslash, the
			// value reaches us as a single "\n" — indistinguishable from an
			// RFC 5545-encoded literal newline, so unescapeIcsText decodes it to a
			// real newline. That real newline must still be recoverable by JSON.parse.
			const rawValue = '{"message":{"before":"line1\\nline2"\\,"after":"new"}}';
			const { result } = setupHook(useInviteChanges, {
				initialProps: [buildMailMsg([{ name: 'X-CRB-CHANGES', value: rawValue }])]
			});
			expect(result.current).toEqual({ message: { before: 'line1\nline2', after: 'new' } });
		});

		it('parses the exact escaped value produced by a real invitation email', () => {
			const rawValue =
				'{"message":{"before":"\\\\""\\,"after":"asd"}\\,"participants":{"added":[{"a":"user106@dt2-dev1-srv1.demo.zextras.io"\\,"d":"User 106"}]\\,"removed":[]}}';
			const { result } = setupHook(useInviteChanges, {
				initialProps: [buildMailMsg([{ name: 'X-CRB-CHANGES', value: rawValue }])]
			});
			expect(result.current).toEqual({
				message: { before: '"', after: 'asd' },
				participants: {
					added: [{ a: 'user106@dt2-dev1-srv1.demo.zextras.io', d: 'User 106' }],
					removed: []
				}
			});
		});
	});

	describe('when the server appends stray trailing characters after the JSON object', () => {
		it('recovers by extracting the balanced JSON object', () => {
			const changes = { message: { before: 'old', after: 'new' } };
			const { result } = setupHook(useInviteChanges, {
				initialProps: [
					buildMailMsg([{ name: 'X-CRB-CHANGES', value: `${JSON.stringify(changes)}"` }])
				]
			});
			expect(result.current).toEqual(changes);
		});

		it('parses the exact value observed in a real GetMsg SOAP response', () => {
			const rawValue =
				'{"message":{"before":"\\"","after":"asd"},"participants":{"added":[{"a":"user106@dt2-dev1-srv1.demo.zextras.io","d":"User 106"}],"removed":[]}}"';
			const { result } = setupHook(useInviteChanges, {
				initialProps: [buildMailMsg([{ name: 'X-CRB-CHANGES', value: rawValue }])]
			});
			expect(result.current).toEqual({
				message: { before: '"', after: 'asd' },
				participants: {
					added: [{ a: 'user106@dt2-dev1-srv1.demo.zextras.io', d: 'User 106' }],
					removed: []
				}
			});
		});
	});
});
