/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export type SearchRequestProps = {
	start: number;
	end: number;
	offset?: number;
	sortBy?: string;
	content: string;
};

export type FolderAction = {
	op: string;
	id: string;
	l?: string;
	recursive?: boolean;
	name?: string;
	color?: number;
	f?: string;
	zid?: string;
};

type GenericRequest = {
	_jsns: 'urn:zimbra';
	onerror?: 'continue';
};

export type FolderActionRequest = GenericRequest & {
	FolderActionRequest: Array<{
		action: FolderAction;
		_jsns: 'urn:zimbraMail';
		requestId?: number;
	}>;
};

export type CreateMountpointRequest = GenericRequest & {
	CreateMountpointRequest: Array<{
		link: any;
		_jsns: 'urn:zimbraMail';
	}>;
};

export type SoapRequests = FolderActionRequest | CreateMountpointRequest;
