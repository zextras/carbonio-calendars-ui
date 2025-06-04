/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	xmlSoapFetch,
	Identity,
	updateSettings,
	AccountSettingsPrefs
} from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';

import { CALENDAR_APP_ID } from '../constants';
import type { AccountACEInfo } from './settings-view';

type AccountSettings = {
	[key: string]: string | number | Array<string | number> | undefined;
};

type AccountSettingsAttrs = AccountSettings;
type IdentityAttrs = AccountSettings;

type PropsMods = Record<string, { app: string; value: unknown }>;
type PrefsMods = Record<string, unknown> & AccountSettingsPrefs;
type AttrsMods = Record<string, unknown> & AccountSettingsAttrs;

type IdentityMods = {
	modifyList?: Record<string, { id: string; prefs: Partial<IdentityAttrs> }>;
	deleteList?: string[];
	createList?: { prefs: Partial<IdentityAttrs> }[];
};

type PermissionsMods = {
	freeBusy?: {
		current: Array<AccountACEInfo>;
		new: {
			gt: string;
			deny: boolean;
			d?: Array<{ email: string }> | string;
		};
	};
	inviteRight?: {
		current: Array<AccountACEInfo>;
		new: {
			gt: string;
			deny: boolean;
			d?: Array<{ email: string }> | string;
		};
	};
};

interface Mods extends Record<string, Record<string, unknown> | undefined> {
	props?: PropsMods;
	prefs?: PrefsMods;
	attrs?: AttrsMods;
	identity?: IdentityMods;
	permissions?: PermissionsMods;
}

export type SaveSettingsResponse = {
	CreateIdentityResponse?: {
		identity: [Identity];
	}[];
};

function getRequestForProps(props: PropsMods | undefined, appId: string): string {
	return props
		? `<ModifyPropertiesRequest xmlns="urn:zimbraAccount">${map(
				props,
				(prop, key) => `<prop name="${key}" zimlet="${prop.app ?? appId}">${prop.value}</prop>`
			)}</ModifyPropertiesRequest>`
		: '';
}

function getRequestForPrefs(prefs: PrefsMods | undefined): string {
	return prefs
		? `<ModifyPrefsRequest xmlns="urn:zimbraAccount">${map(
				prefs,
				(value, key) => `<pref name="${key}">${value}</pref>`
			).join('')}</ModifyPrefsRequest>`
		: '';
}

export const saveSettings = (mods: Mods): Promise<SaveSettingsResponse> =>
	xmlSoapFetch<string, SaveSettingsResponse>(
		'Batch',
		`<BatchRequest xmlns="urn:zimbra" onerror="stop">
				${getRequestForProps(mods.props, CALENDAR_APP_ID)}
        ${getRequestForPrefs(mods.prefs)}
        ${
					mods.permissions
						? `<RevokeRightsRequest xmlns="urn:zimbraAccount" requestId="0">${
								mods.permissions.freeBusy
									? map(mods.permissions.freeBusy.current, (right) => {
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
								mods.permissions.inviteRight
									? map(mods.permissions.inviteRight.current, (right) => {
											if (right.gt === 'all' && right.deny)
												return `<ace right="invite" gt="${right.gt}" zid="${right.zid}" deny="1"/>`;
											if (right.gt === 'usr')
												return `<ace right="invite" gt="${right.gt}" zid="${right.zid}" d="${right.d}"/>`;
											return `<ace right="invite" gt="${right.gt}" zid="${right.zid}" />`;
										}).join('')
									: ''
							}</RevokeRightsRequest><GrantRightsRequest xmlns="urn:zimbraAccount" requestId="1">${
								mods.permissions.freeBusy
									? `${((): string => {
											if (mods.permissions.freeBusy.new.gt === 'dom') {
												return `<ace right="viewFreeBusy" gt="${mods.permissions.freeBusy.new.gt}" d="${mods.permissions.freeBusy.new.d}"/>`;
											}
											if (
												mods.permissions.freeBusy.new.gt === 'all' &&
												mods.permissions.freeBusy.new.deny
											) {
												return `<ace right="viewFreeBusy" gt="${mods.permissions.freeBusy.new.gt}" deny="1"/>`;
											}
											if (mods.permissions.freeBusy.new.gt === 'usr') {
												return map(
													mods.permissions.freeBusy.new.d as Array<{ email: string }>,
													(u) =>
														`<ace right="viewFreeBusy" gt="${mods.permissions?.freeBusy?.new?.gt}" d="${u.email}"/>`
												).join('');
											}
											return `<ace right="viewFreeBusy" gt="${mods.permissions.freeBusy.new.gt}" />`;
										})()}`
									: ''
							}${
								mods.permissions.inviteRight
									? `${((): string => {
											if (
												mods.permissions.inviteRight.new.gt === 'all' &&
												mods.permissions.inviteRight.new.deny
											) {
												return `<ace right="invite" gt="${mods.permissions.inviteRight.new.gt}" deny="1"/>`;
											}
											if (mods.permissions.inviteRight.new.gt === 'usr') {
												return map(
													mods.permissions.inviteRight.new.d as Array<{ email: string }>,
													(u) =>
														`<ace right="invite" gt="${mods.permissions?.inviteRight?.new?.gt}" d="${u.email}"/>`
												).join('');
											}
											return `<ace right="invite" gt="${mods.permissions?.inviteRight.new.gt}" />`;
										})()}`
									: ''
							}
	</GrantRightsRequest>`
						: ''
				}
		</BatchRequest>`
	).then((resp) => {
		updateSettings(mods);
		return resp;
	});
