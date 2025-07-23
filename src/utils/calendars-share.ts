import { Grant } from '@zextras/carbonio-ui-commons';

import { SHARE_USER_TYPE } from '../constants';
import { CALENDARS_SHARE_LINK_TYPES } from '../constants/calendar';

/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export const createCalendarShareURL = (
	type: keyof typeof CALENDARS_SHARE_LINK_TYPES,
	parameters: { domain: string; user: string; calendarName: string }
): string => {
	const { domain, user, calendarName } = parameters;
	if (type === CALENDARS_SHARE_LINK_TYPES.ics) {
		return `https://${domain}/home/${user}/${calendarName}.ics`;
	}
	if (type === CALENDARS_SHARE_LINK_TYPES.webcal) {
		return `webcals://${domain}/home/${user}/${calendarName}`;
	}
	if (type === CALENDARS_SHARE_LINK_TYPES.caldav) {
		return `https://${domain}/dav/${user}/${calendarName}`;
	}
	throw new Error(`Unsupported calendar share link type: ${type}`);
};

export const containPublicShareGrant = (grants: Grant[]): boolean =>
	grants.some((grant) => grant.gt === SHARE_USER_TYPE.PUBLIC);
