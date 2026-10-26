/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { updateSettings } from '@zextras/carbonio-shell-ui';
import { AccountSettingsPrefs, legacyXmlSoapFetch } from '@zextras/carbonio-ui-soap-lib';
import { map } from 'lodash';

import type { AccountACEInfo } from './settings-view';

type PrefsMods = Record<string, unknown> & AccountSettingsPrefs;

export type PermissionChange = {
	gt: string;
	deny?: boolean;
	d?: Array<{ email: string }> | string;
};

type PermissionsMods = {
	// `new: null` revokes the current grants without granting anything
	freeBusy?: {
		current: Array<AccountACEInfo>;
		new: PermissionChange | null;
	};
	inviteRight?: {
		current: Array<AccountACEInfo>;
		new: PermissionChange | null;
	};
};

interface Mods extends Record<string, Record<string, unknown> | undefined> {
	prefs?: PrefsMods;
	permissions?: PermissionsMods;
}

export type SaveSettingsResponse = {
	ModifyPrefsResponse?: {
		prefs: PrefsMods;
	}[];
};

function getRequestForPrefs(prefs: Mods['prefs'] | undefined): string {
	return prefs
		? `<ModifyPrefsRequest xmlns="urn:zimbraAccount">${map(
				prefs,
				(value, key) => `<pref name="${key}">${value}</pref>`
			).join('')}</ModifyPrefsRequest>`
		: '';
}

function getRevokeAces(right: 'viewFreeBusy' | 'invite', current: Array<AccountACEInfo>): string {
	return map(current, (ace) => {
		if (ace.gt === 'all' && ace.deny)
			return `<ace right="${right}" gt="${ace.gt}" zid="${ace.zid}" deny="1"/>`;
		if (ace.gt === 'usr' || (right === 'viewFreeBusy' && ace.gt === 'dom'))
			return `<ace right="${right}" gt="${ace.gt}" zid="${ace.zid}" d="${ace.d}"/>`;
		return `<ace right="${right}" gt="${ace.gt}" zid="${ace.zid}" />`;
	}).join('');
}

function getGrantAces(right: 'viewFreeBusy' | 'invite', change: PermissionChange | null): string {
	if (!change) return '';
	if (change.gt === 'dom' && right === 'viewFreeBusy') {
		return `<ace right="${right}" gt="${change.gt}" d="${change.d}"/>`;
	}
	if (change.gt === 'all' && change.deny) {
		return `<ace right="${right}" gt="${change.gt}" deny="1"/>`;
	}
	if (change.gt === 'usr') {
		return map(
			change.d as Array<{ email: string }>,
			(u) => `<ace right="${right}" gt="${change.gt}" d="${u.email}"/>`
		).join('');
	}
	return `<ace right="${right}" gt="${change.gt}" />`;
}

function getPermissions(permissions: Mods['permissions'] | undefined): string {
	if (!permissions) return '';
	const { freeBusy, inviteRight } = permissions;
	const revokes = `${freeBusy ? getRevokeAces('viewFreeBusy', freeBusy.current) : ''}${
		inviteRight ? getRevokeAces('invite', inviteRight.current) : ''
	}`;
	const grants = `${freeBusy ? getGrantAces('viewFreeBusy', freeBusy.new) : ''}${
		inviteRight ? getGrantAces('invite', inviteRight.new) : ''
	}`;
	return `${
		revokes
			? `<RevokeRightsRequest xmlns="urn:zimbraAccount" requestId="0">${revokes}</RevokeRightsRequest>`
			: ''
	}${
		grants
			? `<GrantRightsRequest xmlns="urn:zimbraAccount" requestId="1">${grants}</GrantRightsRequest>`
			: ''
	}`;
}

function getRequestForMods(mods: Mods): string {
	return `${getRequestForPrefs(mods.prefs)}${getPermissions(mods.permissions)}`;
}

export const saveSettings = (mods: Mods): Promise<SaveSettingsResponse> =>
	legacyXmlSoapFetch<string, SaveSettingsResponse>(
		'Batch',
		`<BatchRequest xmlns="urn:zimbra" onerror="stop">${getRequestForMods(mods)}</BatchRequest>`
	).then((resp) => {
		updateSettings(mods);
		return resp;
	});
