/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { JSNS } from '@zextras/carbonio-shell-ui';

export type DataSourceAttribute = {
	/** Attribute name, e.g. "zimbraDataSourceAttribute" */
	n: string;
	_content: string;
};

export type CalDavDataSourceParams = {
	/** Data source / calendar display name */
	name: string;
	/** Polling interval, e.g. "1m" */
	pollingInterval: string;
	/** Whether the data source is enabled ("1") or disabled ("0") */
	isEnabled: '0' | '1';
	/** ID of the parent folder that will hold the synced calendar items */
	l: string;
	/** CalDAV server host (hostname or full base URL) */
	host: string;
	/** CalDAV account username (omit when the server requires no credentials) */
	username?: string;
	/** CalDAV account password (omit when the server requires no credentials) */
	password?: string;
	/** Additional data-source attributes, e.g. the CalDAV principal path */
	a?: DataSourceAttribute;
	/** CalDAV server port (omit to use the default port, usually 443 for SSL and 80 for cleartext) */
	port?: string;
	/** Connection type, e.g. "ssl" */
	connectionType?: 'ssl' | 'cleartext' | 'tls' | 'tls_if_available';
	/** Indicates that this datasource is used for one way (incoming) import versus two-way sync */
	importOnly?: '0' | '1';
};

export type CreateCalDavDataSourceRequest = {
	_jsns: typeof JSNS.mail;
	caldav: CalDavDataSourceParams;
};

export type CreateCalDavDataSourceResponse = {
	_jsns: typeof JSNS.mail;
	caldav?: { id: string }[];
};

export type TestCalDavDataSourceParams = Omit<
	CalDavDataSourceParams,
	'pollingInterval' | 'isEnabled' | 'l' | 'importOnly'
>;

export type TestCalDavDataSourceRequest = {
	_jsns: typeof JSNS.mail;
	caldav: TestCalDavDataSourceParams;
};

export type TestCalDavDataSourceResponse = {
	_jsns: typeof JSNS.mail;
	caldav?: Array<{
		success: boolean;
		error?: string;
	}>;
};
