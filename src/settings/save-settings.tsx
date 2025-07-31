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

type PermissionsMods = {
	freeBusy?: {
		current: Array<AccountACEInfo>;
		new: {
			gt: string;
			deny?: boolean;
			d?: Array<{ email: string }> | string;
		};
	};
	inviteRight?: {
		current: Array<AccountACEInfo>;
		new: {
			gt: string;
			deny?: boolean;
			d?: Array<{ email: string }> | string;
		};
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

function getPermissions(permissions: Mods['permissions'] | undefined): string {
	return permissions
		? `<RevokeRightsRequest xmlns="urn:zimbraAccount" requestId="0">${
				permissions.freeBusy
					? map(permissions.freeBusy.current, (right) => {
							if (right.gt === 'dom')
								return `<ace right="viewFreeBusy" gt="${right.gt}" zid="${right.zid}" d="${right.d}"/>`;
							if (right.gt === 'all' && right.deny)
								return `<ace right="viewFreeBusy" gt="${right.gt}" zid="${right.zid}" deny="1"/>`;
							if (right.gt === 'usr')
								return `<ace right="viewFreeBusy" gt="${right.gt}" zid="${right.zid}" d="${right.d}"/>`;
							return `<ace right="viewFreeBusy" gt="${right.gt}" zid="${right.zid}" />`;
						}).join('')
					: ''
			}${
				permissions.inviteRight
					? map(permissions.inviteRight.current, (right) => {
							if (right.gt === 'all' && right.deny)
								return `<ace right="invite" gt="${right.gt}" zid="${right.zid}" deny="1"/>`;
							if (right.gt === 'usr')
								return `<ace right="invite" gt="${right.gt}" zid="${right.zid}" d="${right.d}"/>`;
							return `<ace right="invite" gt="${right.gt}" zid="${right.zid}" />`;
						}).join('')
					: ''
			}</RevokeRightsRequest><GrantRightsRequest xmlns="urn:zimbraAccount" requestId="1">${
				permissions.freeBusy
					? `${((): string => {
							if (permissions.freeBusy.new.gt === 'dom') {
								return `<ace right="viewFreeBusy" gt="${permissions.freeBusy.new.gt}" d="${permissions.freeBusy.new.d}"/>`;
							}
							if (permissions.freeBusy.new.gt === 'all' && permissions.freeBusy.new.deny) {
								return `<ace right="viewFreeBusy" gt="${permissions.freeBusy.new.gt}" deny="1"/>`;
							}
							if (permissions.freeBusy.new.gt === 'usr') {
								return map(
									permissions.freeBusy.new.d as Array<{ email: string }>,
									(u) =>
										`<ace right="viewFreeBusy" gt="${permissions?.freeBusy?.new?.gt}" d="${u.email}"/>`
								).join('');
							}
							return `<ace right="viewFreeBusy" gt="${permissions.freeBusy.new.gt}" />`;
						})()}`
					: ''
			}${
				permissions.inviteRight
					? `${((): string => {
							if (permissions.inviteRight.new.gt === 'all' && permissions.inviteRight.new.deny) {
								return `<ace right="invite" gt="${permissions.inviteRight.new.gt}" deny="1"/>`;
							}
							if (permissions.inviteRight.new.gt === 'usr') {
								return map(
									permissions.inviteRight.new.d as Array<{ email: string }>,
									(u) =>
										`<ace right="invite" gt="${permissions?.inviteRight?.new?.gt}" d="${u.email}"/>`
								).join('');
							}
							return `<ace right="invite" gt="${permissions?.inviteRight.new.gt}" />`;
						})()}`
					: ''
			}</GrantRightsRequest>`
		: '';
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
