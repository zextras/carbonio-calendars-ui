/* eslint-disable import/no-extraneous-dependencies */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '@testing-library/jest-dom';
import moment from 'moment-timezone';
import { http, RequestHandler } from 'msw';
import { SetupServer, setupServer } from 'msw/node';
import { vi, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';

import { handleGetFolderRequest } from '@test-utils/network/msw/handle-get-folder';
import { handleGetShareInfoRequest } from '@test-utils/network/msw/handle-get-share-info';
import { VITEST_DEFAULT_TIMEZONE } from 'constants/test-environment';
import { handleAutoCompleteGalRequest } from 'test/mocks/network/msw/handle-autocomplete-gal-request';
import { handleCancelAppointmentRequest } from 'test/mocks/network/msw/handle-cancel-appointment';
import { handleCreateAppointmentRequest } from 'test/mocks/network/msw/handle-create-appointment';
import { handleCreateAppointmentExceptionRequest } from 'test/mocks/network/msw/handle-create-appointment-exception';
import { handleCreateFolderRequest } from 'test/mocks/network/msw/handle-create-folder';
import { handleFolderActionRequest } from 'test/mocks/network/msw/handle-folder-action';
import { handleGetAppointmentRequest } from 'test/mocks/network/msw/handle-get-appointment';
import { handleGetFreeBusy } from 'test/mocks/network/msw/handle-get-free-busy';
import { handleGetInvite } from 'test/mocks/network/msw/handle-get-invite';
import { handleItemActionRequest } from 'test/mocks/network/msw/handle-item-action';
import { handleModifyAppointmentRequest } from 'test/mocks/network/msw/handle-modify-appointment';
import { handleSearchCalendarResourcesRequest } from 'test/mocks/network/msw/handle-search-calendar-resoruces';
import { handleSearchRequest } from 'test/mocks/network/msw/handle-search-request';
import { handleSendInviteReplyRequest } from 'test/mocks/network/msw/handle-send-invite-reply';
import { handleSendShareNotificationRequest } from 'test/mocks/network/msw/handle-send-share-notification';

vi.mock('darkreader');
vi.mock('@zextras/carbonio-shell-ui');
vi.mock('@zextras/carbonio-ui-soap-lib');

// Setup MSW mock server
let server = setupServer();

/**
 * Default logic to execute before all the tests
 */
type DefaultBeforeAllTestsProps = {
	onUnhandledRequest: 'warn' | 'error';
};

const defaultBeforeAllTests = (
	{ onUnhandledRequest }: DefaultBeforeAllTestsProps = { onUnhandledRequest: 'warn' }
): void => {
	server?.close();

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

	server = setupServer(...handlers);
	server.listen({ onUnhandledRequest });
};

Object.defineProperty(window, 'open', {
	writable: true,
	value: vi.fn()
});

Object.defineProperty(window.crypto, 'randomUUID', {
	writable: true,
	value: vi.fn(() => Math.random().toString())
});

Object.defineProperty(window.URL, 'createObjectURL', {
	writable: true,
	value: vi.fn()
});

Object.defineProperty(window, 'ResizeObserver', {
	writable: true,
	value: function ResizeObserverMock(): ResizeObserver {
		return {
			observe: (): undefined => undefined,
			unobserve: (): undefined => undefined,
			disconnect: (): undefined => undefined
		};
	}
});

Object.defineProperty(window, 'IntersectionObserver', {
	writable: true,
	value: vi.fn(function intersectionObserverMock(
		callback: IntersectionObserverCallback,
		options: IntersectionObserverInit
	) {
		return {
			thresholds: options.threshold,
			root: options.root,
			rootMargin: options.rootMargin,
			observe: vi.fn(),
			unobserve: vi.fn(),
			disconnect: vi.fn()
		};
	})
});

Object.defineProperty(window, 'Notification', {
	writable: true,
	value: vi.fn(function NotificationMock(title: string, options?: NotificationOptions) {
		return {
			title,
			body: options?.body,
			onclick: null,
			onshow: null,
			onerror: null,
			onclose: null,
			close: vi.fn()
		};
	})
});

Object.defineProperty(window.Notification, 'requestPermission', {
	writable: true,
	value: vi.fn().mockResolvedValue('granted')
});

Object.defineProperty(window.Notification, 'permission', {
	writable: true,
	value: 'granted'
});

// Mock HTMLMediaElement.play() for audio notifications
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
	writable: true,
	value: vi.fn().mockResolvedValue(undefined)
});

// Suppress CSS parsing errors from jsdom/cssstyle when encountering CSS variables
// This is a known issue with jsdom not fully supporting CSS custom properties in shorthand declarations
const originalConsoleError = console.error;
console.error = (...args: unknown[]): void => {
	const message = String(args[0] || '');
	// Filter out CSS parsing errors
	if (
		message.includes('Could not parse CSS stylesheet') ||
		message.includes('Cannot create property') ||
		message.includes('Error: Could not parse CSS')
	) {
		return;
	}
	originalConsoleError.apply(console, args);
};

// Patch CSSStyleDeclaration.setProperty to prevent errors with CSS variables
const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
CSSStyleDeclaration.prototype.setProperty = function (
	this: CSSStyleDeclaration,
	property: string,
	value: string | null,
	priority?: string
): void {
	try {
		return originalSetProperty.call(this, property, value, priority);
	} catch (error) {
		// Silently ignore CSS parsing errors for CSS variables
		if (error instanceof TypeError && error.message.includes('Cannot create property')) {
			return undefined;
		}
		throw error;
	}
};

if (!Promise.withResolvers) {
	Promise.withResolvers = function withResolvers<T>(): {
		promise: Promise<T>;
		resolve: (value: T | PromiseLike<T>) => void;
		reject: (reason?: any) => void;
	} {
		let resolve: (value: T | PromiseLike<T>) => void;
		let reject: (reason?: any) => void;
		const promise = new Promise<T>((res, rej) => {
			resolve = res;
			reject = rej;
		});
		return { promise, resolve: resolve!, reject: reject! };
	};
}

export const abortSpy = vi.fn();

Object.defineProperty(window, 'AbortController', {
	writable: true,
	value: vi.fn(function AbortControllerMock() {
		return {
			abort: abortSpy,
			signal: {
				aborted: false,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn()
			}
		};
	})
});

beforeAll(() => {
	defaultBeforeAllTests();
});

beforeEach(() => {
	moment.tz.setDefault(VITEST_DEFAULT_TIMEZONE);
	moment.tz.guess = vi.fn().mockImplementation(() => VITEST_DEFAULT_TIMEZONE);
	const originalDateResolvedOptions = new Intl.DateTimeFormat().resolvedOptions();

	vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
		...originalDateResolvedOptions,
		timeZone: VITEST_DEFAULT_TIMEZONE
	});
	vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
	vi.clearAllTimers();
	vi.useRealTimers();
});

afterAll(() => {
	server.resetHandlers();
	server.close();
});

export const getSetupServer = (): SetupServer => server;
