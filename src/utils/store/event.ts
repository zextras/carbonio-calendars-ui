/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {isTrashOrNestedInIt} from '@zextras/carbonio-ui-commons';
import {getUserAccount, getUserSettings} from '@zextras/carbonio-shell-ui';

import {EventType} from '../../types/event';

export const isOrganizerOrHaveEqualRights = (
	event: EventType,
	absFolderPath: string | undefined
): boolean => {
    const resource = event.resource;
    if (!resource.organizer || event?.haveWriteAccess) {
        return true;
    }

    if (isTrashOrNestedInIt({ id: resource.calendar.id, absFolderPath })) {
        return false;
    }

    const rawAlias = getUserSettings()?.attrs?.zimbraMailAlias;
    const emails = [getUserAccount()?.name, rawAlias].flat().filter(Boolean) as string[];
    const organizerEmail = event.resource.organizer?.email;
    const calendarOwner = event.resource.calendar.owner;
    const isUserOrganizer = organizerEmail ? emails.includes(organizerEmail) : event.resource.iAmOrganizer;
    const isUserOwner = calendarOwner ? emails.includes(calendarOwner) : false;

    if (!isUserOwner && !isUserOrganizer) {
        return false;
    }

    if (calendarOwner && calendarOwner !== organizerEmail) {
        return isUserOwner && isUserOrganizer;
    }

    return true;
}