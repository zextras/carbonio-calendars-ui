/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { filter, find, map } from 'lodash';

import { CALENDAR_RESOURCES } from '../../../constants';
import { CRB_XPARAMS, CRB_XPROPS } from '../../../constants/xprops';
import type { Attendee } from '../../../types/store/invite';

interface XParam {
	name: string;
	value?: string;
}

interface XProp {
	name: string;
	xparam?: XParam[];
}

interface VirtualRoomInfo {
	roomName?: string;
	roomLink?: string;
}

interface UseResourcesResult {
	virtualRoom: VirtualRoomInfo;
	meetingRooms: Attendee[];
	equipment: Attendee[];
	meetingRoomsString: string;
	equipmentString: string;
}

export const useResources = (attendees: Attendee[], xprops: XProp[]): UseResourcesResult => {
	const virtualRoom = useMemo<VirtualRoomInfo>(() => {
		const room = find(xprops, ['name', CRB_XPROPS.MEETING_ROOM]);
		const roomName = find(room?.xparam as XParam[], ['name', CRB_XPARAMS.ROOM_NAME])?.value;
		const roomLink = find(room?.xparam as XParam[], ['name', CRB_XPARAMS.ROOM_LINK])?.value;
		return { roomName, roomLink };
	}, [xprops]);

	const meetingRooms = useMemo(
		() => filter(attendees, ['cutype', CALENDAR_RESOURCES.ROOM]),
		[attendees]
	);

	const equipment = useMemo(
		() => filter(attendees, ['cutype', CALENDAR_RESOURCES.RESOURCE]),
		[attendees]
	);

	const meetingRoomsString = useMemo(
		() => map(meetingRooms, (room) => room.d).join(', '),
		[meetingRooms]
	);

	const equipmentString = useMemo(() => map(equipment, (item) => item.d).join(', '), [equipment]);

	return {
		virtualRoom,
		meetingRooms,
		equipment,
		meetingRoomsString,
		equipmentString
	};
};
