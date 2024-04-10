/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isTrashOrNestedInIt } from '../../carbonio-ui-commons/store/zustand/folder/utils';
import { EventType } from '../../types/event';

export const isOrganizerOrHaveEqualRights = (
	event: EventType,
	absFolderPath: string | undefined
): boolean =>
	!(event.resource.organizer
		? // if the event is in trash or nested in it
			isTrashOrNestedInIt({ id: event.resource.calendar.id, absFolderPath }) ||
			// if user is owner of the calendar but he is not the organizer
			(!event.resource.calendar.owner && !event.resource.iAmOrganizer) ||
			// if it is inside a shared calendar or user doesn't have write access
			(!!event.resource.calendar.owner &&
				(event.resource.calendar.owner !== event.resource.organizer?.email ||
					!event?.haveWriteAccess))
		: false);
