/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useInviteChanges } from './use-invite-changes';
import { formatInviteChangesText } from '../../../commons/invite-changes-text';
import { ROOM_DIVIDER } from '../../../constants';
import { setupHook } from '@test-setup';

const buildMailMsg = (desc?: unknown): any => ({
	invite: [{ comp: [{ desc }] }]
});

const buildMailMsgWithParts = (parts: unknown): any => ({
	invite: [{ comp: [{}] }],
	parts
});

describe('useInviteChanges', () => {
	it('returns undefined when there is no invite component at all', () => {
		const { result } = setupHook(useInviteChanges, { initialProps: [{}] });
		expect(result.current).toBeUndefined();
	});

	it('returns undefined when there is no description', () => {
		const { result } = setupHook(useInviteChanges, {
			initialProps: [buildMailMsg(undefined)]
		});
		expect(result.current).toBeUndefined();
	});

	it('returns undefined when the description has no changes block', () => {
		const { result } = setupHook(useInviteChanges, {
			initialProps: [buildMailMsg([{ _content: 'Subject: test\n\nJust a regular message' }])]
		});
		expect(result.current).toBeUndefined();
	});

	it('parses a changes block embedded in a description given as an array of {_content}', () => {
		const changes = { message: { before: 'old', after: 'new' } };
		const desc = [
			{
				_content: `Subject: test\n\n${formatInviteChangesText(changes)}\n${ROOM_DIVIDER}\nHello!`
			}
		];
		const { result } = setupHook(useInviteChanges, {
			initialProps: [buildMailMsg(desc)]
		});
		expect(result.current).toEqual(changes);
	});

	it('parses a changes block embedded in a description given as a plain string', () => {
		const changes = {
			participants: {
				added: [{ a: 'a@test.com', d: 'A' }],
				removed: [{ a: 'b@test.com', d: 'B' }]
			}
		};
		const desc = `Subject: test\n\n${formatInviteChangesText(changes)}\n\nHello!`;
		const { result } = setupHook(useInviteChanges, {
			initialProps: [buildMailMsg(desc)]
		});
		expect(result.current).toEqual(changes);
	});

	it('parses a full combination of message, date/time, and participant changes', () => {
		const changes = {
			message: { before: 'old text', after: 'new text\nwith a second line' },
			dateTime: { before: 'before-label', after: 'after-label' },
			participants: {
				added: [{ a: 'added@test.com', d: 'Added' }],
				removed: [{ a: 'removed@test.com', d: 'Removed' }]
			}
		};
		const desc = [
			{
				_content: `Subject: test\n\n${formatInviteChangesText(changes)}\n${ROOM_DIVIDER}\nActual message body`
			}
		];
		const { result } = setupHook(useInviteChanges, {
			initialProps: [buildMailMsg(desc)]
		});
		expect(result.current).toEqual(changes);
	});

	describe('when the invite component has no desc (a GetMsg-fetched invitation email)', () => {
		it('falls back to the plain text MIME part', () => {
			const changes = { message: { before: 'old', after: 'new' } };
			const mailMsg = buildMailMsgWithParts([
				{
					contentType: 'multipart/alternative',
					parts: [
						{ contentType: 'text/html', content: '<p>Hello!</p>' },
						{
							contentType: 'text/plain',
							content: `Subject: test\n\n${formatInviteChangesText(changes)}\n${ROOM_DIVIDER}\nHello!`
						}
					]
				}
			]);
			const { result } = setupHook(useInviteChanges, { initialProps: [mailMsg] });
			expect(result.current).toEqual(changes);
		});

		it('returns undefined when the MIME parts have no changes block either', () => {
			const mailMsg = buildMailMsgWithParts([
				{ contentType: 'text/plain', content: 'Subject: test\n\nJust a regular message' }
			]);
			const { result } = setupHook(useInviteChanges, { initialProps: [mailMsg] });
			expect(result.current).toBeUndefined();
		});

		it('returns undefined when there are no parts at all', () => {
			const mailMsg = buildMailMsgWithParts(undefined);
			const { result } = setupHook(useInviteChanges, { initialProps: [mailMsg] });
			expect(result.current).toBeUndefined();
		});
	});
});
