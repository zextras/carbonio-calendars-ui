/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, waitFor } from '@testing-library/react';
import { map } from 'lodash';
import moment from 'moment';

import { useAttendeesAvailability } from './use-attendees-availability';
import { setupHook } from '../carbonio-ui-commons/test/test-setup';
import * as handler from '../soap/get-free-busy-request';
import mockedData from '../test/generators';

describe('use attendees availability', () => {
	describe('no user interaction - pre-populated editor', () => {
		test('if there are no participants the request is not sent to the server', () => {
			const spy = jest.spyOn(handler, 'getFreeBusyRequest');

			setupHook(useAttendeesAvailability, {
				initialProps: [moment().valueOf(), []]
			});

			expect(spy).not.toHaveBeenCalled();

			spy.mockClear();
		});
		test('if there is at least one participant the request is sent to the server once', async () => {
			const attendees = mockedData.editor.getRandomAttendees({ length: 1 });
			const spy = jest
				.spyOn(handler, 'getFreeBusyRequest')
				.mockReturnValueOnce(Promise.resolve({ usr: [{ id: attendees[0].email }] }));

			const uid = map(attendees, (attendee) => attendee.email).join(',');

			const rangeStart = moment().startOf('day').valueOf();
			const rangeEnd = moment().endOf('day').valueOf();

			setupHook(useAttendeesAvailability, {
				initialProps: [rangeStart, attendees]
			});

			await waitFor(() => {
				expect(spy).toHaveBeenCalled();
			});

			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy).toHaveBeenCalledWith({ s: rangeStart, e: rangeEnd, uid });

			spy.mockClear();
		});
		test('if there are multiple participants the request is sent to the server once, containing all the participants', async () => {
			const attendees = mockedData.editor.getRandomAttendees({ length: 2 });
			const spy = jest
				.spyOn(handler, 'getFreeBusyRequest')
				.mockReturnValue(
					Promise.resolve({ usr: [{ id: attendees[0].email }, { id: attendees[1].email }] })
				);

			const uid = map(attendees, (attendee) => attendee.email).join(',');

			const rangeStart = moment().startOf('day').valueOf();
			const rangeEnd = moment().endOf('day').valueOf();

			setupHook(useAttendeesAvailability, {
				initialProps: [rangeStart, attendees]
			});

			await waitFor(() => {
				expect(spy).toHaveBeenCalled();
			});
			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy).toHaveBeenCalledWith({ s: rangeStart, e: rangeEnd, uid });

			spy.mockClear();
		});
		test('if on rerender start, end, attendees does not change, only the first request is sent', async () => {
			const attendees = mockedData.editor.getRandomAttendees({ length: 1 });
			const spy = jest
				.spyOn(handler, 'getFreeBusyRequest')
				.mockReturnValue(Promise.resolve({ usr: [{ id: attendees[0].email }] }));

			const uid = map(attendees, (attendee) => attendee.email).join(',');

			const rangeStart = moment().startOf('day').valueOf();
			const rangeEnd = moment().endOf('day').valueOf();

			const { rerender } = setupHook(useAttendeesAvailability, {
				initialProps: [rangeStart, attendees]
			});

			rerender();
			await act(async () => {
				await expect(spy).toHaveBeenCalled();
			});
			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy).toHaveBeenCalledWith({ s: rangeStart, e: rangeEnd, uid });

			spy.mockClear();
		});
	});
	describe('user interaction - filling editor', () => {
		test('removing an attendee will not send the request', async () => {
			const attendees = mockedData.editor.getRandomAttendees({ length: 2 });
			const uid = map(attendees, (attendee) => attendee.email).join(',');
			const spy = jest
				.spyOn(handler, 'getFreeBusyRequest')
				.mockReturnValueOnce(
					Promise.resolve({ usr: [{ id: attendees[0].email }, { id: attendees[1].email }] })
				);

			const rangeStart = moment().startOf('day').valueOf();
			const rangeEnd = moment().endOf('day').valueOf();

			const { rerender } = setupHook(useAttendeesAvailability, {
				initialProps: [rangeStart, attendees]
			});

			await waitFor(() => {
				expect(spy).toHaveBeenCalled();
			});
			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy).toHaveBeenCalledWith({ s: rangeStart, e: rangeEnd, uid });

			spy.mockClear();

			rerender([rangeStart, [attendees[0]]]);

			await waitFor(() => {
				expect(spy).not.toHaveBeenCalled();
			});
		});
		test('adding back a removed attendee will not send the request', async () => {
			const attendees = mockedData.editor.getRandomAttendees({ length: 2 });
			const uid = map(attendees, (attendee) => attendee.email).join(',');
			const spy = jest
				.spyOn(handler, 'getFreeBusyRequest')
				.mockReturnValueOnce(
					Promise.resolve({ usr: [{ id: attendees[0].email }, { id: attendees[1].email }] })
				);

			const rangeStart = moment().startOf('day').valueOf();
			const rangeEnd = moment().endOf('day').valueOf();

			const { rerender } = setupHook(useAttendeesAvailability, {
				initialProps: [rangeStart, attendees]
			});

			await waitFor(() => {
				expect(spy).toHaveBeenCalled();
			});
			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy).toHaveBeenCalledWith({ s: rangeStart, e: rangeEnd, uid });

			spy.mockClear();

			// removing attendee
			rerender([rangeStart, [attendees[0]]]);

			// add attendee back
			rerender([rangeStart, attendees]);

			await waitFor(() => {
				expect(spy).not.toHaveBeenCalled();
			});
		});
		test('adding a new attendee will send a request only for the new attendee for the start date', async () => {
			const allAttendees = mockedData.editor.getRandomAttendees({ length: 2 });
			const previousAttendees = [allAttendees[0]];
			const previousuid = map(previousAttendees, (attendee) => attendee.email).join(',');
			const spy = jest
				.spyOn(handler, 'getFreeBusyRequest')
				.mockReturnValueOnce(Promise.resolve({ usr: [{ id: allAttendees[0].email }] }))
				.mockReturnValueOnce(Promise.resolve({ usr: [{ id: allAttendees[1].email }] }));

			const rangeStart = moment().startOf('day').valueOf();
			const rangeEnd = moment().endOf('day').valueOf();

			const { rerender } = setupHook(useAttendeesAvailability, {
				initialProps: [rangeStart, previousAttendees]
			});

			await waitFor(() => {
				expect(spy).toHaveBeenCalled();
			});

			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy).toHaveBeenCalledWith({ s: rangeStart, e: rangeEnd, uid: previousuid });

			const nextAttendees = [allAttendees[1]];
			const nextuid = map(nextAttendees, (attendee) => attendee.email).join(',');

			rerender([rangeStart, allAttendees]);

			await waitFor(() => {
				expect(spy).toHaveBeenCalledTimes(2);
			});
			await waitFor(() => {
				expect(spy).toHaveBeenCalledWith({ s: rangeStart, e: rangeEnd, uid: nextuid });
			});

			spy.mockClear();
		});
		describe('When user changes start date and this', () => {
			test('occurs a day before the old start date a new request is sent', async () => {
				const attendees = mockedData.editor.getRandomAttendees({ length: 2 });

				const spy = jest
					.spyOn(handler, 'getFreeBusyRequest')
					.mockReturnValueOnce(
						Promise.resolve({ usr: [{ id: attendees[0].email }, { id: attendees[1].email }] })
					);

				const uid = map(attendees, (attendee) => attendee.email).join(',');

				const rangeStart = moment().startOf('day').valueOf();
				const rangeEnd = moment().endOf('day').valueOf();

				const { rerender } = setupHook(useAttendeesAvailability, {
					initialProps: [rangeStart, attendees]
				});

				await waitFor(() => {
					expect(spy).toHaveBeenCalled();
				});
				expect(spy).toHaveBeenCalledTimes(1);
				expect(spy).toHaveBeenCalledWith({ s: rangeStart, e: rangeEnd, uid });

				const newStart = rangeStart - 86500000;
				const newStartDay = moment(newStart).startOf('day').valueOf();
				const newEndDay = moment(newStart).endOf('day').valueOf();

				rerender([newStart, attendees]);

				await waitFor(() => {
					expect(spy).toHaveBeenCalledTimes(2);
				});
				expect(spy).toHaveBeenCalledWith({ s: newStartDay, e: newEndDay, uid });

				spy.mockClear();
			});
			test('occurs after the old start date and before the end date a new request is not sent', async () => {
				const attendees = mockedData.editor.getRandomAttendees({ length: 2 });

				const spy = jest
					.spyOn(handler, 'getFreeBusyRequest')
					.mockReturnValueOnce(
						Promise.resolve({ usr: [{ id: attendees[0].email }, { id: attendees[1].email }] })
					);

				const uid = map(attendees, (attendee) => attendee.email).join(',');

				const rangeStart = moment().startOf('day').valueOf();
				const rangeEnd = moment().endOf('day').valueOf();

				const { rerender } = setupHook(useAttendeesAvailability, {
					initialProps: [rangeStart, attendees]
				});

				await waitFor(() => {
					expect(spy).toHaveBeenCalled();
				});
				expect(spy).toHaveBeenCalledTimes(1);
				expect(spy).toHaveBeenCalledWith({ s: rangeStart, e: rangeEnd, uid });

				const newStart = rangeStart + 43200000;

				rerender([newStart, attendees]);
				expect(spy).toHaveBeenCalledTimes(1);
				spy.mockClear();
			});
			test('occurs after the old end date a new request is sent with the new requested start date', async () => {
				const attendees = mockedData.editor.getRandomAttendees({ length: 1 });

				const spy = jest
					.spyOn(handler, 'getFreeBusyRequest')
					.mockReturnValueOnce(Promise.resolve({ usr: [{ id: attendees[0].email }] }));

				const uid = map(attendees, (attendee) => attendee.email).join(',');

				const rangeStart = moment().startOf('day').valueOf();
				const rangeEnd = moment().endOf('day').valueOf();

				const { rerender } = setupHook(useAttendeesAvailability, {
					initialProps: [rangeStart, attendees]
				});

				await waitFor(() => {
					expect(spy).toHaveBeenCalled();
				});
				expect(spy).toHaveBeenCalledTimes(1);
				expect(spy).toHaveBeenCalledWith({ s: rangeStart, e: rangeEnd, uid });

				const newStart = rangeStart + 172800000;
				const newStartDay = moment(newStart).startOf('day').valueOf();
				const newEndDay = moment(newStart).endOf('day').valueOf();

				rerender([newStart, attendees]);
				await waitFor(() => {
					expect(spy).toHaveBeenCalledTimes(2);
				});
				expect(spy).toHaveBeenCalledWith({ s: newStartDay, e: newEndDay, uid });
				spy.mockClear();
			});
			describe('is been already requested', () => {
				test('for the attendee a new request is not sent', async () => {
					const attendees = mockedData.editor.getRandomAttendees({ length: 1 });

					const spy = jest
						.spyOn(handler, 'getFreeBusyRequest')
						.mockReturnValueOnce(Promise.resolve({ usr: [{ id: attendees[0].email }] }));

					const uid = map(attendees, (attendee) => attendee.email).join(',');

					const rangeStart = moment().startOf('day').valueOf();
					const rangeEnd = moment().endOf('day').valueOf();

					const { rerender } = setupHook(useAttendeesAvailability, {
						initialProps: [rangeStart, attendees]
					});

					await waitFor(() => {
						expect(spy).toHaveBeenCalled();
					});
					expect(spy).toHaveBeenCalledTimes(1);
					expect(spy).toHaveBeenCalledWith({ s: rangeStart, e: rangeEnd, uid });

					rerender([rangeStart, attendees]);
					spy.mockClear();

					rerender([rangeStart, attendees]);
					await waitFor(() => {
						expect(spy).not.toHaveBeenCalled();
					});
				});
				test('for all the attendees a new request is not sent', async () => {
					const attendees = mockedData.editor.getRandomAttendees({ length: 2 });

					const spy = jest
						.spyOn(handler, 'getFreeBusyRequest')
						.mockReturnValueOnce(
							Promise.resolve({ usr: [{ id: attendees[0].email }, { id: attendees[1].email }] })
						);

					const uid = map(attendees, (attendee) => attendee.email).join(',');

					const rangeStart = moment().startOf('day').valueOf();
					const rangeEnd = moment().endOf('day').valueOf();

					const { rerender } = setupHook(useAttendeesAvailability, {
						initialProps: [rangeStart, attendees]
					});

					await waitFor(() => {
						expect(spy).toHaveBeenCalled();
					});
					expect(spy).toHaveBeenCalledTimes(1);
					expect(spy).toHaveBeenCalledWith({ s: rangeStart, e: rangeEnd, uid });

					spy.mockClear();
					rerender([rangeStart, attendees]);

					await waitFor(() => {
						expect(spy).not.toHaveBeenCalled();
					});
				});
				test('just for one of the two attendees a new request is sent only for the missing one', async () => {
					const attendees = mockedData.editor.getRandomAttendees({ length: 2 });

					const spy = jest
						.spyOn(handler, 'getFreeBusyRequest')
						.mockReturnValueOnce(Promise.resolve({ usr: [{ id: attendees[0].email }] }))
						.mockReturnValueOnce(Promise.resolve({ usr: [{ id: attendees[1].email }] }));

					const rangeStart = moment().startOf('day').valueOf();
					const rangeEnd = moment().endOf('day').valueOf();

					const { rerender } = setupHook(useAttendeesAvailability, {
						initialProps: [rangeStart, [attendees[0]]]
					});

					await waitFor(() => {
						expect(spy).toHaveBeenCalled();
					});
					expect(spy).toHaveBeenCalledTimes(1);
					expect(spy).toHaveBeenCalledWith({ s: rangeStart, e: rangeEnd, uid: attendees[0].email });
					spy.mockClear();

					rerender([rangeStart, attendees]);

					await waitFor(() => {
						expect(spy).toHaveBeenCalled();
					});
					expect(spy).toHaveBeenCalledTimes(1);
					expect(spy).toHaveBeenCalledWith({ s: rangeStart, e: rangeEnd, uid: attendees[1].email });
				});
			});
		});
	});
});
