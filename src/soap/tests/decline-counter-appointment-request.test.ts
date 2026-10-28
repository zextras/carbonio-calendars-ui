/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { JSNS, t } from '@zextras/carbonio-shell-ui';

import { createSoapAPIInterceptor } from '../../__test__/mocks/network/msw/create-api-interceptor';
import { generateSoapErrorResponseBody } from '../../test/generators/utils';
import {
	CounterInviteComponent,
	declineCounterAppointmentRequest
} from '../decline-counter-appointment-request';

const tz = 'Europe/Rome';
const start = new Date('2024-01-30T09:00:00.000Z').getTime();
const end = new Date('2024-01-30T09:30:00.000Z').getTime();

const getComponent = (context?: Partial<CounterInviteComponent>): CounterInviteComponent => ({
	uid: faker.string.uuid(),
	seq: 2,
	allDay: false,
	s: [{ d: '20240130T100000', tz }],
	e: [{ d: '20240130T103000', tz }],
	or: { a: faker.internet.email() },
	...context
});

const getArguments = (
	context?: Partial<Parameters<typeof declineCounterAppointmentRequest>[0]>
): Parameters<typeof declineCounterAppointmentRequest>[0] => ({
	title: faker.lorem.words(3),
	fragment: faker.lorem.sentence(),
	to: [{ address: faker.internet.email(), fullName: faker.person.fullName() }],
	comp: getComponent(),
	start,
	end,
	...context
});

describe('declineCounterAppointmentRequest', () => {
	it('returns fulfilled response when no Fault', async () => {
		const response = { jsns: JSNS.mail };
		createSoapAPIInterceptor('DeclineCounterAppointment', response);

		const result = await declineCounterAppointmentRequest(getArguments());

		expect(result).toEqual(response);
	});

	it('returns rejected response when Fault is present', async () => {
		const faultResponse = generateSoapErrorResponseBody();
		createSoapAPIInterceptor('DeclineCounterAppointment', faultResponse);

		const result = await declineCounterAppointmentRequest(getArguments());

		expect(result).toEqual({ ...faultResponse.Fault, error: true });
	});

	it('should address the message to the attendee who proposed the new time', async () => {
		const to = [{ address: faker.internet.email(), fullName: faker.person.fullName() }];
		const apiInterceptor = createSoapAPIInterceptor<{
			m: { e: Array<{ a: string; p: string; t: string }> };
		}>('DeclineCounterAppointment');

		await declineCounterAppointmentRequest(getArguments({ to }));

		expect((await apiInterceptor).m.e).toEqual([{ a: to[0].address, p: to[0].fullName, t: 't' }]);
	});

	it('should send the proposed times and the identity of the appointment being declined', async () => {
		const comp = getComponent();
		const title = faker.lorem.words(3);
		const apiInterceptor = createSoapAPIInterceptor<{
			m: { inv: { comp: Array<Record<string, unknown>> } };
		}>('DeclineCounterAppointment');

		await declineCounterAppointmentRequest(getArguments({ comp, title }));

		expect((await apiInterceptor).m.inv.comp[0]).toEqual({
			method: 'DECLINECOUNTER',
			name: title,
			uid: comp.uid,
			seq: comp.seq,
			allDay: '0',
			s: comp.s?.[0],
			e: comp.e?.[0],
			or: { a: comp.or?.a }
		});
	});

	it('should send the recurrence id of the instance when the proposal targets one', async () => {
		const exceptId = [{ d: '20240207T090000', tz }];
		const apiInterceptor = createSoapAPIInterceptor<{
			m: { inv: { comp: Array<{ exceptId: unknown }> } };
		}>('DeclineCounterAppointment');

		await declineCounterAppointmentRequest(getArguments({ comp: getComponent({ exceptId }) }));

		expect((await apiInterceptor).m.inv.comp[0].exceptId).toEqual(exceptId);
	});

	it('should build the message subject using the translated "proposal declined" label and the appointment title', async () => {
		const title = faker.lorem.words(3);
		const apiInterceptor = createSoapAPIInterceptor<{ m: { su: string } }>(
			'DeclineCounterAppointment'
		);

		await declineCounterAppointmentRequest(getArguments({ title }));

		expect((await apiInterceptor).m.su).toEqual(
			`${t('label.proposal_declined', 'Proposal declined')}: ${title}`
		);
	});

	it('should include the translated labels and the proposal message in both message parts', async () => {
		const title = faker.lorem.words(3);
		const fragment = faker.lorem.sentence();
		const apiInterceptor = createSoapAPIInterceptor<{
			m: { mp: { mp: Array<{ ct?: string; content: string }> } };
		}>('DeclineCounterAppointment');

		await declineCounterAppointmentRequest(getArguments({ title, fragment }));

		const { mp } = (await apiInterceptor).m.mp;
		const htmlPart = mp.find((part) => part.ct === 'text/html');
		const plainTextPart = mp.find((part) => part.ct === 'text/plain');

		[htmlPart, plainTextPart].forEach((part) => {
			expect(part?.content).toContain(t('label.proposal_declined', 'Proposal declined'));
			expect(part?.content).toContain(`${t('label.subject', 'Subject')}: ${title}`);
			expect(part?.content).toContain(t('label.time', 'Time'));
			expect(part?.content).toContain(fragment);
		});
	});

	it('should render an all day proposal without a time range', async () => {
		const apiInterceptor = createSoapAPIInterceptor<{
			m: { mp: { mp: Array<{ ct?: string; content: string }> } };
		}>('DeclineCounterAppointment');

		await declineCounterAppointmentRequest(
			getArguments({
				comp: getComponent({ allDay: true, s: [{ d: '20240130', tz }] })
			})
		);

		const plainTextPart = (await apiInterceptor).m.mp.mp.find((part) => part.ct === 'text/plain');

		expect(plainTextPart?.content).toContain('Tuesday, 30 January, 2024');
		expect(plainTextPart?.content).not.toContain('GMT');
	});
});
