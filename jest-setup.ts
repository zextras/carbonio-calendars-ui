/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
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
import { handleGetShareInfoRequest } from './src/carbonio-ui-commons/test/mocks/network/msw/handle-get-share-info';
import { registerRestHandler } from './src/carbonio-ui-commons/test/mocks/network/msw/handlers';
import { handleAutoCompleteGalRequest } from './src/test/mocks/network/msw/handle-autocomplete-gal-request';
import { handleCancelAppointmentRequest } from './src/test/mocks/network/msw/handle-cancel-appointment';
import { handleCreateAppointmentRequest } from './src/test/mocks/network/msw/handle-create-appointment';
import { handleCreateAppointmentExceptionRequest } from './src/test/mocks/network/msw/handle-create-appointment-exception';
import { handleCreateFolderRequest } from './src/test/mocks/network/msw/handle-create-folder';
import { handleFolderActionRequest } from './src/test/mocks/network/msw/handle-folder-action';
import { handleGetAppointmentRequest } from './src/test/mocks/network/msw/handle-get-appointment';
import { handleGetFolderRequest } from './src/test/mocks/network/msw/handle-get-folder';
import { handleGetFreeBusy } from './src/test/mocks/network/msw/handle-get-free-busy';
import { handleGetInvite } from './src/test/mocks/network/msw/handle-get-invite';
import { handleItemActionRequest } from './src/test/mocks/network/msw/handle-item-action';
import { handleModifyAppointmentRequest } from './src/test/mocks/network/msw/handle-modify-appointment';
import { handleSearchCalendarResourcesRequest } from './src/test/mocks/network/msw/handle-search-calendar-resoruces';
import { handleSearchRequest } from './src/test/mocks/network/msw/handle-search-request';
import { handleSendInviteReplyRequest } from './src/test/mocks/network/msw/handle-send-invite-reply';
import { handleSendShareNotificationRequest } from './src/test/mocks/network/msw/handle-send-share-notification';

global.Notification = jest.fn() as unknown as jest.Mocked<typeof Notification>;
global.Audio = jest.fn().mockImplementation(() => ({
	play: jest.fn()
}));

configure({
	asyncUtilTimeout: 2000
});

failOnConsole({ ...getFailOnConsoleDefaultConfig(), shouldFailOnWarn: false });

beforeAll(() => {
	const h = [
		rest.post('/service/soap/SendInviteReplyRequest', handleSendInviteReplyRequest),
		rest.post('/service/soap/ItemActionRequest', handleItemActionRequest),
		rest.post('/service/soap/GetFreeBusyRequest', handleGetFreeBusy),
		rest.post('/service/soap/GetMsgRequest', handleGetInvite),
		rest.post('/service/soap/CreateFolderRequest', handleCreateFolderRequest),
		rest.post('/service/soap/GetFolderRequest', handleGetFolderRequest),
		rest.post('/service/soap/FolderActionRequest', handleFolderActionRequest),
		rest.post('/service/soap/SearchRequest', handleSearchRequest),
		rest.post('/service/soap/CreateAppointmentRequest', handleCreateAppointmentRequest),
		rest.post('/service/soap/CancelAppointmentRequest', handleCancelAppointmentRequest),
		rest.post('/service/soap/AutoCompleteGalRequest', handleAutoCompleteGalRequest),
		rest.post(
			'/service/soap/CreateAppointmentExceptionRequest',
			handleCreateAppointmentExceptionRequest
		),
		rest.post('/service/soap/ModifyAppointmentRequest', handleModifyAppointmentRequest),
		rest.post('/service/soap/SendShareNotificationRequest', handleSendShareNotificationRequest),
		rest.post('/service/soap/GetShareInfoRequest', handleGetShareInfoRequest),
		rest.post('/service/soap/SearchCalendarResourcesRequest', handleSearchCalendarResourcesRequest),
		rest.post('/service/soap/GetAppointmentRequest', handleGetAppointmentRequest)
	];
	registerRestHandler(...h);
	defaultBeforeAllTests();
});

beforeEach(() => {
	moment.tz.setDefault('Europe/Berlin');
	moment.tz.guess = jest.fn().mockImplementation(() => 'Europe/Berlin');
	jest.setSystemTime(new Date('2022-01-01'));
	defaultBeforeEachTest();
});

afterEach(() => {
	defaultAfterEachTest();
});

afterAll(() => {
	defaultAfterAllTests();
});
