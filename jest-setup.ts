/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '@testing-library/jest-dom';

import { configure } from '@testing-library/react';
import failOnConsole from 'jest-fail-on-console';
import moment from 'moment-timezone';
import { http, RequestHandler } from 'msw';
import { setupServer, SetupServer } from 'msw/node';

import { useLocalStorage } from './__mocks__/@zextras/carbonio-shell-ui';
import { JEST_DEFAULT_TIMEZONE } from './src/constants/test-environment';
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
import { handleSendInviteReplyRequest } from './src/test/mocks/network/msw/handle-send-invite-reply';
import { handleSendShareNotificationRequest } from './src/test/mocks/network/msw/handle-send-share-notification';
import { handleGetShareInfoRequest } from '@test-utils/network/msw/handle-get-share-info';
import { handleSearchRequest } from 'test/mocks/network/msw/handle-search-request';

// Global test mocks
declare global {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const BASE_PATH: string;
}

// Set up BASE_PATH mock for TinyMCE asset loading in tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).BASE_PATH = '/test-base-path/';

let server: SetupServer;
beforeAll(() => {
	useLocalStorage.mockReturnValue([jest.fn(), jest.fn()]);
	const handlers: Array<RequestHandler> = [
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
	// mock a simplified Intersection Observer
	Object.defineProperty(window, 'IntersectionObserver', {
		writable: true,
		value: jest.fn(function intersectionObserverMock(
			callback: IntersectionObserverCallback,
			options: IntersectionObserverInit
		) {
			return {
				thresholds: options.threshold,
				root: options.root,
				rootMargin: options.rootMargin,
				observe: jest.fn(),
				unobserve: jest.fn(),
				disconnect: jest.fn()
			};
		})
	});

	server?.close();

	server = setupServer(...handlers);

	server.listen({ onUnhandledRequest: 'warn' });
});

beforeEach(() => {
	moment.tz.setDefault(JEST_DEFAULT_TIMEZONE);
	moment.tz.guess = jest.fn().mockImplementation(() => JEST_DEFAULT_TIMEZONE);
	const originalDateResolvedOptions = new Intl.DateTimeFormat().resolvedOptions();

	jest.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
		...originalDateResolvedOptions,
		timeZone: JEST_DEFAULT_TIMEZONE
	});
});

afterEach(() => {
	jest.clearAllTimers();
});

afterAll(() => {
	server.resetHandlers();
	server.close();
});

global.Notification = jest.fn() as unknown as jest.Mocked<typeof Notification>;
global.Audio = jest.fn().mockImplementation(() => ({
	play: jest.fn()
}));

configure({
	asyncUtilTimeout: 2000
});

failOnConsole({
	shouldFailOnError: true,
	shouldFailOnWarn: true
});

// Mock matchMedia
// see: https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: jest.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(), // deprecated
		removeListener: jest.fn(), // deprecated
		addEventListener: jest.fn(),
		removeEventListener: jest.fn()
	}))
});

// Mock implementation of window.open
Object.defineProperty(window, 'open', {
	writable: true,
	value: jest.fn()
});

// mock a simplified crypto
Object.defineProperty(window.crypto, 'randomUUID', {
	writable: true,
	value: jest.fn(() => Math.random().toString())
});

window.ResizeObserver = jest.fn().mockImplementation(() => ({
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn()
}));

export const getSetupServer = (): SetupServer => server;
// mock a simplified crypto
Object.defineProperty(window.crypto, 'randomUUID', {
	writable: true,
	value: jest.fn(() => Math.random().toString())
});
