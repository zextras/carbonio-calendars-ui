/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Grant } from '../../carbonio-ui-commons/types/folder';

export type Contact = {
	id: string;
	l: string;
	d: number;
	rev: number;
	fileAsStr: string;
	_attrs: {
		lastName: string;
		notes: string;
		fileAs: string;
		zimbraId: string;
		zimbraAccountCalendarUserType: string; // 'RESOURCE'
		createTimeStamp: string;
		objectClass: Array<string>;
		zimbraCalResType: string; // 'Location'
		fullName: string;
		modifyTimeStamp: string;
		email: string;
	};
	ref: string;
	sf: string;
};

export type Cn = Array<Contact>;

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
	color?: string;
	f?: string;
	zid?: string;
	grant?: Grant | Grant[];
	type?: string;
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
