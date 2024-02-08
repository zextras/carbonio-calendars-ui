/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useEffect, useMemo } from 'react';

import { Container, Divider, Popover } from '@zextras/carbonio-design-system';
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
import { useAppStatusStore } from '../../store/zustand/store';
import { EventType } from '../../types/event';

type EventSummaryProps = {
	anchorRef: React.RefObject<HTMLElement>;
	open: boolean;
	event: EventType;
	onClose: () => void;
	inviteId: string | undefined;
};

export const EventSummaryView = ({
	anchorRef,
	open,
	event,
	onClose,
	inviteId
}: EventSummaryProps): ReactElement | null => {
	const invite = useInvite(inviteId);

	const timeData = useMemo(
		() => ({
			...omitBy(
				{
					allDay: event.allDay,
					start: event.start,
					end: event.end
				},
				isNil
			),
			...{ timezone: invite?.tz ?? moment.tz.guess() }
		}),
		[event.allDay, event.end, event.start, invite?.tz]
	);

	const locationData = useMemo(
		() =>
			omitBy(
				{
					class: event.resource.class,
					location: event.resource.location,
					locationUrl: event.resource.locationUrl
				},
				isNil
			),
		[event?.resource?.class, event?.resource?.location, event?.resource?.locationUrl]
	);

	useEffect(() => {
		useAppStatusStore.setState(({ summaryViewCounter }) => ({
			summaryViewCounter: summaryViewCounter + 1
		}));
		return () =>
			useAppStatusStore.setState(({ summaryViewCounter }) => ({
				summaryViewCounter: summaryViewCounter - 1
			}));
	}, []);

	return (
		<Popover anchorEl={anchorRef} open={open} styleAsModal placement="left" onClose={onClose}>
			<Container
				padding={{ top: 'medium', horizontal: 'small', bottom: 'extrasmall' }}
				width="25rem"
			>
				<TitleRow event={event} />
				<NeverSentWarningRow neverSent={event?.resource?.inviteNeverSent} />
				<CalendarInfoRow />
				{timeData && <TimeInfoRow timeInfoData={timeData} showIcon />}
				{locationData && <LocationRow locationData={locationData} showIcon />}
				{invite && <MeetingRoomsRow invite={invite} showIcon />}
				{invite && <EquipmentsRow invite={invite} showIcon />}
				{invite?.xprop && <VirtualRoomRow xprop={invite?.xprop} showIcon />}
				{invite && <ParticipantsRow event={event} invite={invite} />}
				{event?.resource?.tags?.length > 0 && <TagsRow event={event} />}
				{!startsWith(event?.resource?.fragment ?? '', ROOM_DIVIDER) && (
					<DescriptionFragmentRow event={event} />
				)}
				<Divider />
				<ActionsButtonsRow onClose={onClose} event={event} />
			</Container>
		</Popover>
	);
};

export const MemoEventSummaryView = React.memo(EventSummaryView);
