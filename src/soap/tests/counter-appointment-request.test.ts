/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { JSNS, t } from '@zextras/carbonio-shell-ui';

import { generateFolder } from '../../__test__/mocks/folders/folders-generator';
import { createSoapAPIInterceptor } from '../../__test__/mocks/network/msw/create-api-interceptor';
import { generateEditor } from '../../commons/editor-generator';
import { reducers } from '../../store/redux';
import mockedData from '../../test/generators';
import { generateSoapErrorResponseBody } from '../../test/generators/utils';
import { counterAppointmentRequest } from '../counter-appointment-request';

describe('counterAppointmentRequest', () => {
	const folder = generateFolder({ view: 'appointment' });
	const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

	it('returns fulfilled response when no Fault', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const event = mockedData.getEvent();
		const invite = mockedData.getInvite({ event });
		const context = { folders, dispatch: store.dispatch };
		const editor = generateEditor({ invite, context });
		const response = { jsns: JSNS.mail };

		createSoapAPIInterceptor('CounterAppointment', response);

		const result = await counterAppointmentRequest({ appt: editor });
		expect(result).toEqual(response);
	});

	it('returns rejected response when Fault is present', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const event = mockedData.getEvent();
		const invite = mockedData.getInvite({ event });
		const context = { folders, dispatch: store.dispatch };
		const editor = generateEditor({ invite, context });
		const faultResponse = generateSoapErrorResponseBody();
		createSoapAPIInterceptor('CounterAppointment', faultResponse);

		const result = await counterAppointmentRequest({ appt: editor });

		expect(result).toEqual({ ...faultResponse.Fault, error: true });
	});

	it('should send the compNum of the appointment', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const event = mockedData.getEvent({ id: faker.string.uuid() });
		const invite = mockedData.getInvite({ event });

		const context = { folders, dispatch: store.dispatch };
		const editor = generateEditor({ invite, context });
		const response = { jsns: JSNS.mail };

		const apiInterceptor = createSoapAPIInterceptor('CounterAppointment', response);

		await counterAppointmentRequest({ appt: editor });
		const requestParams = await apiInterceptor;
		expect(requestParams).toEqual(expect.objectContaining({ comp: invite.compNum }));
	});

	it('should build the message subject using the translated "new time proposed" label and the appointment title', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const event = mockedData.getEvent();
		const invite = mockedData.getInvite({ event });
		const context = { folders, dispatch: store.dispatch, title: faker.lorem.words(3) };
		const editor = generateEditor({ invite, context });
		const response = { jsns: JSNS.mail };

		const apiInterceptor = createSoapAPIInterceptor<{ m: { su: string } }, typeof response>(
			'CounterAppointment',
			response
		);

		await counterAppointmentRequest({ appt: editor });
		const requestParams = await apiInterceptor;

		expect(requestParams.m.su).toEqual(
			`${t('label.new_time_proposed', 'New Time Proposed')}: ${editor.title}`
		);
	});

	it('should include the translated labels in the html message part', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const event = mockedData.getEvent();
		const invite = mockedData.getInvite({ event });
		const context = { folders, dispatch: store.dispatch, title: faker.lorem.words(3) };
		const editor = generateEditor({ invite, context });
		const response = { jsns: JSNS.mail };

		const apiInterceptor = createSoapAPIInterceptor<
			{ m: { mp: { mp: Array<{ ct?: string; content: string }> } } },
			typeof response
		>('CounterAppointment', response);

		await counterAppointmentRequest({ appt: editor });
		const requestParams = await apiInterceptor;
		const htmlPart = requestParams.m.mp.mp.find((part) => part.ct === 'text/html');

		expect(htmlPart?.content).toContain(t('label.new_time_proposed', 'New Time Proposed'));
		expect(htmlPart?.content).toContain(`${t('label.subject', 'Subject')}: ${editor.title}`);
		expect(htmlPart?.content).toContain(t('label.time', 'Time'));
		expect(htmlPart?.content).toContain(`[${t('label.modified', 'MODIFIED')}]`);
	});

	it('should include the translated labels in the plain text message part', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const event = mockedData.getEvent();
		const invite = mockedData.getInvite({ event });
		const context = {
			folders,
			dispatch: store.dispatch,
			title: faker.lorem.words(3),
			plainText: faker.lorem.paragraph()
		};
		const editor = generateEditor({ invite, context });
		const response = { jsns: JSNS.mail };

		const apiInterceptor = createSoapAPIInterceptor<
			{ m: { mp: { mp: Array<{ ct?: string; content: string }> } } },
			typeof response
		>('CounterAppointment', response);

		await counterAppointmentRequest({ appt: editor });
		const requestParams = await apiInterceptor;
		const plainTextPart = requestParams.m.mp.mp.find((part) => part.ct === 'text/plain');

		expect(plainTextPart?.content).toContain(t('label.new_time_proposed', 'New Time Proposed'));
		expect(plainTextPart?.content).toContain(`${t('label.subject', 'Subject')}: ${editor.title}`);
		expect(plainTextPart?.content).toContain(t('label.time', 'Time'));
		expect(plainTextPart?.content).toContain(editor.plainText);
	});
});
