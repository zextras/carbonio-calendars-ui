/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { buildMessagePart } from './move-appointment-to-trash';
import mockedData from '../../test/generators';
import { setupTMock } from '../../utils/tests';

const tz = 'Europe/Rome';

describe('move appointment to trash', () => {
	describe('build message part', () => {
		test('if the date of the instance is valued, the date will be the instance one', async () => {
			const t = setupTMock();
			const fullInvite = mockedData.getInvite({
				context: {
					start: { d: '20240318T093000', tz, u: 1710750600000 },
					end: { d: '20240318T100000', tz, u: 1710752400000 },
					name: 'test'
				}
			});
			const inst = { d: '20240321T093000', tz };

			const result = buildMessagePart({
				t,
				fullInvite,
				inst
			});

			expect(result).toStrictEqual(
				expect.objectContaining({
					mp: expect.arrayContaining([
						expect.objectContaining({
							content: expect.stringMatching(
								/instance, Thursday, March 21, 2024, 9:30\u2009–\u200910:00\u202fAM/i
							)
						})
					])
				})
			);
		});
		test('if the date of the instance is not valued, the date will be the event one', async () => {
			const t = setupTMock();
			const fullInvite = mockedData.getInvite({
				context: {
					start: { d: '20240318T093000', tz, u: 1710750600000 },
					end: { d: '20240318T100000', tz, u: 1710752400000 },
					name: 'test'
				}
			});

			const result = buildMessagePart({
				t,
				fullInvite
			});

			expect(result).toStrictEqual(
				expect.objectContaining({
					mp: expect.arrayContaining([
						expect.objectContaining({
							content: expect.stringMatching(
								/instance, Monday, March 18, 2024, 9:30\u2009–\u200910:00\u202fAM/i
							)
						})
					])
				})
			);
		});
		test('if the date of the instance is all day, the date will have all day at the end', async () => {
			const t = setupTMock();
			const fullInvite = mockedData.getInvite({
				context: {
					allDay: true,
					start: { d: '20240318' },
					end: { d: '20240318' },
					name: 'test'
				}
			});

			const inst = { d: '20240321', tz: undefined };

			const result = buildMessagePart({
				t,
				fullInvite,
				inst
			});

			expect(result).toStrictEqual(
				expect.objectContaining({
					mp: expect.arrayContaining([
						expect.objectContaining({
							content: expect.stringMatching(/instance, Thursday, March 21, 2024 - All day/i)
						})
					])
				})
			);
		});
		test('if the date of the instance has a different timezone from local, creation timezone will be used', async () => {
			const t = setupTMock();
			const currentTz = 'Asia/Kolkata';
			const fullInvite = mockedData.getInvite({
				context: {
					start: { d: '20240611T083000', tz: currentTz, u: 1718074800000 },
					end: { d: '20240611T090000', tz: currentTz, u: 1718076600000 },
					name: 'test'
				}
			});
			const inst = { d: '20240615T083000', tz: currentTz };

			const result = buildMessagePart({
				t,
				fullInvite,
				inst
			});

			expect(result).toStrictEqual(
				expect.objectContaining({
					mp: expect.arrayContaining([
						expect.objectContaining({
							content: expect.stringMatching(
								/instance, Saturday, June 15, 2024, 8:30\u2009–\u20099:00\u202fAM GMT\+5:30/i
							)
						})
					])
				})
			);
		});
		test('if the date of the appointment has a different timezone from local, creation timezone will be used', async () => {
			const t = setupTMock();
			const currentTz = 'Asia/Kolkata';
			const fullInvite = mockedData.getInvite({
				context: {
					start: { d: '20240615T083000', tz: currentTz, u: 1718074800000 },
					end: { d: '20240615T090000', tz: currentTz, u: 1718076600000 },
					tz: currentTz,
					name: 'test'
				}
			});

			const result = buildMessagePart({
				t,
				fullInvite
			});

			expect(result).toStrictEqual(
				expect.objectContaining({
					mp: expect.arrayContaining([
						expect.objectContaining({
							content: expect.stringMatching(
								/instance, Saturday, June 15, 2024, 8:30\u2009–\u20099:00\u202fAM GMT\+5:30/i
							)
						})
					])
				})
			);
		});
		test('if the date of the instance has the same timezone as the local, local timezone will be used', async () => {
			const t = setupTMock();
			const localTimezone = 'Europe/Berlin';
			const fullInvite = mockedData.getInvite({
				context: {
					start: { d: '20240611T083000', tz: localTimezone, u: 1718074800000 },
					end: { d: '20240611T090000', tz: localTimezone, u: 1718076600000 },
					name: 'test'
				}
			});
			const inst = { d: '20240615T083000', tz: localTimezone };

			const result = buildMessagePart({
				t,
				fullInvite,
				inst
			});

			expect(result).toStrictEqual(
				expect.objectContaining({
					mp: expect.arrayContaining([
						expect.objectContaining({
							content: expect.stringMatching(
								/instance, Saturday, June 15, 2024, 8:30\u2009–\u20099:00\u202fAM GMT\+2/i
							)
						})
					])
				})
			);
		});
		test('if the date of the appointment has the same timezone as the local, local timezone will be used', async () => {
			const t = setupTMock();
			const localTimezone = 'Europe/Berlin';
			const fullInvite = mockedData.getInvite({
				context: {
					tz: localTimezone,
					start: { d: '20240615T083000', tz: localTimezone, u: 1718074800000 },
					end: { d: '20240615T090000', tz: localTimezone, u: 1718076600000 },
					name: 'test'
				}
			});

			const result = buildMessagePart({
				t,
				fullInvite
			});

			expect(result).toStrictEqual(
				expect.objectContaining({
					mp: expect.arrayContaining([
						expect.objectContaining({
							content: expect.stringMatching(
								/instance, Saturday, June 15, 2024, 8:30\u2009–\u20099:00\u202fAM GMT\+2/i
							)
						})
					])
				})
			);
		});
		test('if the date of the instance has no timezone, local timezone will be used', async () => {
			const t = setupTMock();
			const fullInvite = mockedData.getInvite({
				context: {
					start: { d: '20240611T083000', u: 1718074800000 },
					end: { d: '20240611T090000', u: 1718076600000 },
					name: 'test'
				}
			});
			const inst = { d: '20240615T083000', tz: undefined };

			const result = buildMessagePart({
				t,
				fullInvite,
				inst
			});

			expect(result).toStrictEqual(
				expect.objectContaining({
					mp: expect.arrayContaining([
						expect.objectContaining({
							content: expect.stringMatching(
								/instance, Saturday, June 15, 2024, 8:30\u2009–\u20099:00\u202fAM GMT\+2/i
							)
						})
					])
				})
			);
		});
		test('if the date of the event is all day, the date will have all day at the end', async () => {
			const t = setupTMock();
			const fullInvite = mockedData.getInvite({
				context: {
					allDay: true,
					start: { d: '20240318' },
					end: { d: '20240318' },
					name: 'test'
				}
			});

			const result = buildMessagePart({
				t,
				fullInvite
			});

			expect(result).toStrictEqual(
				expect.objectContaining({
					mp: expect.arrayContaining([
						expect.objectContaining({
							content: expect.stringMatching(/instance, Monday, March 18, 2024 - All day/i)
						})
					])
				})
			);
		});
		test('if the message does not have rich text, it will return plain content', async () => {
			const t = setupTMock();
			const fullInvite = mockedData.getInvite({
				context: {
					htmlDescription: undefined,
					start: { d: '20240318T093000', tz, u: 1710750600000 },
					end: { d: '20240318T100000', tz, u: 1710752400000 },
					name: 'test'
				}
			});
			const inst = { d: '20240321T093000', tz };

			const result = buildMessagePart({
				t,
				fullInvite,
				inst
			});

			expect(result.mp).toHaveLength(1);
			expect(result.mp).toStrictEqual([expect.objectContaining({ ct: 'text/plain' })]);
		});
		test('if the message has rich text, it will return html content', async () => {
			const t = setupTMock();
			const fullInvite = mockedData.getInvite({
				context: {
					start: { d: '20240318T093000', tz, u: 1710750600000 },
					end: { d: '20240318T100000', tz, u: 1710752400000 },
					name: 'test'
				}
			});
			const inst = { d: '20240321T093000', tz };

			const result = buildMessagePart({
				t,
				fullInvite,
				inst
			});

			expect(result.mp).toHaveLength(2);
			expect(result.mp).toStrictEqual([
				expect.anything(),
				expect.objectContaining({ ct: 'text/html' })
			]);
		});
	});
});
