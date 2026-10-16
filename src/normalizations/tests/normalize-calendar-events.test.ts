/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import mockedData from '../../test/generators';
import { ExceptionReference } from '../../types/store/appointments';
import { isOccurrenceOfSeries } from '../../utils/event';
import { normalizeCalendarEvent } from '../normalize-calendar-events';

describe('normalizeCalendarEvent', () => {
	describe('exception of a recurring series', () => {
		// the server sends recur=false on exceptions, while the appointment itself is recurring
		const appointment = mockedData.getAppointment({
			appointment: { inviteId: '100-99', recur: true, hasEx: true }
		});
		const exception = {
			...appointment.inst[0],
			recur: false,
			ex: true,
			inviteId: '100-101'
		} as ExceptionReference;
		const calendar = mockedData.calendars.getCalendar({ id: appointment.l });

		it('uses the exception invite as inviteId and keeps the series invite as seriesInviteId', () => {
			const event = normalizeCalendarEvent({ calendar, appointment, instance: exception });

			expect(event.resource.inviteId).toBe('100-101');
			expect(event.resource.seriesInviteId).toBe('100-99');
		});

		it('is still an occurrence of the series', () => {
			const event = normalizeCalendarEvent({ calendar, appointment, instance: exception });

			expect(event.resource.isRecurrent).toBe(false);
			expect(event.resource.isException).toBe(true);
			expect(isOccurrenceOfSeries(event.resource)).toBe(true);
		});
	});
});
