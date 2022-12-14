/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '@testing-library/jest-dom';
import failOnConsole from 'jest-fail-on-console';
import moment from 'moment-timezone';
import { rest } from 'msw';
import {
	defaultAfterAllTests,
	defaultAfterEachTest,
	defaultBeforeAllTests,
	defaultBeforeEachTest,
	getFailOnConsoleDefaultConfig
} from './src/carbonio-ui-commons/test/jest-setup';
import { registerRestHandler } from './src/carbonio-ui-commons/test/mocks/network/msw/handlers';
import { handleCreateAppointmentExceptionRequest } from './src/test/mocks/network/msw/handle-create-appointment-exception';
import { handleCreateFolderRequest } from './src/test/mocks/network/msw/handle-create-folder';
import { handleCreateAppointmentRequest } from './src/test/mocks/network/msw/handle-create-appointment';
import { handleGetInvite } from './src/test/mocks/network/msw/handle-get-invite';
import { handleModifyAppointmentRequest } from './src/test/mocks/network/msw/handle-modify-appointment';

failOnConsole({
	...getFailOnConsoleDefaultConfig()
});

beforeAll(() => {
	const h = [
		rest.post('/service/soap/GetMsgRequest', handleGetInvite),
		rest.post('/service/soap/CreateFolderRequest', handleCreateFolderRequest),
		rest.post('/service/soap/CreateAppointmentRequest', handleCreateAppointmentRequest),
		rest.post(
			'/service/soap/CreateAppointmentExceptionRequest',
			handleCreateAppointmentExceptionRequest
		),
		rest.post('/service/soap/ModifyAppointmentRequest', handleModifyAppointmentRequest)
	];
	registerRestHandler(...h);
	defaultBeforeAllTests();
});

beforeEach(() => {
	moment.tz.setDefault('Europe/Rome');
	jest.setSystemTime(new Date('2022-01-01'));
	defaultBeforeEachTest();
});

afterEach(() => {
	defaultAfterEachTest();
});

afterAll(() => {
	defaultAfterAllTests();
});
