/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import failOnConsole from 'jest-fail-on-console';
import moment from 'moment-timezone';
import { http } from 'msw';

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
		http.post('/service/soap/SendInviteReplyRequest', handleSendInviteReplyRequest),
		http.post('/service/soap/ItemActionRequest', handleItemActionRequest),
		http.post('/service/soap/GetFreeBusyRequest', handleGetFreeBusy),
		http.post('/service/soap/GetMsgRequest', handleGetInvite),
		http.post('/service/soap/CreateFolderRequest', handleCreateFolderRequest),
		http.post('/service/soap/GetFolderRequest', handleGetFolderRequest),
		http.post('/service/soap/FolderActionRequest', handleFolderActionRequest),
		http.post('/service/soap/SearchRequest', handleSearchRequest),
		http.post('/service/soap/CreateAppointmentRequest', handleCreateAppointmentRequest),
		http.post('/service/soap/CancelAppointmentRequest', handleCancelAppointmentRequest),
		http.post('/service/soap/AutoCompleteGalRequest', handleAutoCompleteGalRequest),
		http.post(
			'/service/soap/CreateAppointmentExceptionRequest',
			handleCreateAppointmentExceptionRequest
		),
		http.post('/service/soap/ModifyAppointmentRequest', handleModifyAppointmentRequest),
		http.post('/service/soap/SendShareNotificationRequest', handleSendShareNotificationRequest),
		http.post('/service/soap/GetShareInfoRequest', handleGetShareInfoRequest),
		http.post('/service/soap/SearchCalendarResourcesRequest', handleSearchCalendarResourcesRequest),
		http.post('/service/soap/GetAppointmentRequest', handleGetAppointmentRequest)
	];
	registerRestHandler(...h);
	defaultBeforeAllTests();
});

beforeEach(() => {
	moment.tz.setDefault('Europe/Berlin');
	moment.tz.guess = jest.fn().mockImplementation(() => 'Europe/Berlin');
	const originalDateResolvedOptions = new Intl.DateTimeFormat().resolvedOptions();

	jest.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
		...originalDateResolvedOptions,
		timeZone: 'Europe/Berlin'
	});
	jest.setSystemTime(new Date('2022-01-01'));
	defaultBeforeEachTest();
});

afterEach(() => {
	defaultAfterEachTest();
});

afterAll(() => {
	defaultAfterAllTests();
});
