/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useEffect, useMemo } from 'react';

import { Container, Divider } from '@zextras/carbonio-design-system';
import { isNil, omitBy, startsWith } from 'lodash';
import moment from 'moment';

import { ActionsButtonsRow } from './actions-buttons-row';
import { CalendarInfoRow } from './calendar-info-row';
import { DescriptionFragmentRow } from './description-fragment-row';
import { EquipmentsRow } from './equipments-row';
import { LocationRow } from './location-row';
import { MeetingRoomsRow } from './meeting-rooms-row';
import { NeverSentWarningRow } from './never-sent-warning-row';
import { ParticipantsRow } from './participants-row';
import TagsRow from './tags-row';
import { TimeInfoRow } from './time-info-row';
import { TitleRow } from './title-row';
import { VirtualRoomRow } from './virtual-room-row';
import { ROOM_DIVIDER } from '../../constants';
import { useInvite } from '../../hooks/use-invite';
import { useNeverSentWarningLabel } from '../../hooks/use-never-sent-warning-label';
import { useSummaryView } from '../../store/zustand/hooks';
import { EventType } from '../../types/event';

type EventSummaryProps = {
	events: EventType[];
	onClose: () => void;
};

export const EventSummaryView = ({ events, onClose }: EventSummaryProps): ReactElement | null => {
	const eventId = useSummaryView();
	const event = events.find((item) => item.id === eventId);
	const invite = useInvite(event?.resource.inviteId);

	const timeData = useMemo(
		() => ({
			allDay: event?.allDay,
			start: event?.start?.getTime(),
			end: event?.end?.getTime(),
			timezone: invite?.tz ?? moment.tz.guess()
		}),
		[event?.allDay, event?.end, event?.start, invite?.tz]
	);

	const locationData = useMemo(
		() =>
			omitBy(
				{
					class: event?.resource.class,
					location: event?.resource.location,
					locationUrl: event?.resource.locationUrl
				},
				isNil
			),
		[event?.resource?.class, event?.resource?.location, event?.resource?.locationUrl]
	);
	const neverSentWarningLabel = useNeverSentWarningLabel(invite?.attendees);

	useEffect(() => onClose, [onClose]);

	if (!event) {
		return null;
	}
	return (
		<Container
			padding={{ top: 'medium', horizontal: 'small', bottom: 'extrasmall' }}
			width="25rem"
			style={{ zIndex: 3 }}
		>
			<TitleRow event={event} />
			<NeverSentWarningRow
				neverSent={event?.resource?.inviteNeverSent}
				label={neverSentWarningLabel}
			/>
			<CalendarInfoRow />
			{timeData && <TimeInfoRow timeInfoData={timeData} showIcon />}
			{locationData && <LocationRow locationData={locationData} showIcon />}
			{invite && <MeetingRoomsRow invite={invite} showIcon />}
			{invite && <EquipmentsRow invite={invite} showIcon />}
			{invite?.xprop && <VirtualRoomRow xprop={invite?.xprop} showIcon />}
			{invite && <ParticipantsRow event={event} invite={invite} />}
			{event?.resource?.tags?.length > 0 && <TagsRow event={event} />}
			{invite && !startsWith(invite.fragment ?? '', ROOM_DIVIDER) && (
				<DescriptionFragmentRow invite={invite} calendarOwner={event.resource.calendar.owner} />
			)}
			<Divider />
			<ActionsButtonsRow onClose={onClose} event={event} />
		</Container>
	);
};

export const MemoEventSummaryView = React.memo(EventSummaryView);
