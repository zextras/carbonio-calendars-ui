/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect, useMemo, useState } from 'react';

import { Container, Padding, Row, Shimmer } from '@zextras/carbonio-design-system';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { filter, map, values } from 'lodash';

import { AppointmentCard } from './appointment-card';
import { useFoldersMapByRoot } from '../../../carbonio-ui-commons/store/zustand/folder';
import { LinkFolder } from '../../../carbonio-ui-commons/types/folder';
import { hasId } from '../../../carbonio-ui-commons/worker/handle-message';
import { normalizeAppointments } from '../../../normalizations/normalize-appointments';
import { normalizeCalendarEvents } from '../../../normalizations/normalize-calendar-events';
import { searchAppointments } from '../../../store/actions/search-appointments';
import { useAppDispatch } from '../../../store/redux/hooks';
import { EventType } from '../../../types/event';

const useAppointmentsInRange = (
	start: number,
	end: number,
	rootId: string,
	uid?: string
): Array<EventType> | undefined => {
	const [events, setEvents] = useState<Array<EventType> | undefined>(undefined);
	const dispatch = useAppDispatch();
	const calendars = useFoldersMapByRoot(rootId);

	const filteredCalendars = useMemo(
		() =>
			filter(
				calendars,
				(calendar) =>
					!/b/.test(calendar?.f ?? '') &&
					!(calendar as LinkFolder).broken &&
					!hasId({ id: calendar.id }, FOLDERS.TRASH) &&
					!(calendar as LinkFolder).isLink
			),
		[calendars]
	);

	const query = useMemo(
		() =>
			map(filteredCalendars, (result, id) =>
				id === 0 ? `inid:"${result.id}"` : `OR inid:"${result.id}"`
			).join(' '),
		[filteredCalendars]
	);

	useEffect(() => {
		if (start && end && !events) {
			dispatch(searchAppointments({ spanEnd: end, spanStart: start, query })).then((response) => {
				if (response?.payload?.appt?.length) {
					const toNormalize = filter(
						response.payload.appt,
						(appt) => appt.fb !== 'F' && appt.uid !== uid
					);
					if (toNormalize.length) {
						const appointments = values(normalizeAppointments(toNormalize));
						const selectedEvents = normalizeCalendarEvents(appointments, calendars);
						setEvents(selectedEvents);
					} else {
						setEvents([]);
					}
				}
			});
		}
	}, [calendars, dispatch, end, events, query, start, uid]);

	return events;
};

export const AppointmentCardContainer = ({
	start,
	end,
	rootId,
	uid
}: {
	start: number;
	end: number;
	rootId: string;
	uid?: string;
}): React.JSX.Element => {
	const events = useAppointmentsInRange(start, end, rootId, uid);
	if (!events) {
		return (
			<Container width={'fill'} padding={{ top: 'medium' }} data-testid="ShimmerContainer">
				<Row width={'fill'} padding={{ bottom: 'small' }}>
					<Shimmer.ListItem width="100%" type={3} />
				</Row>
				<Row width={'fill'} padding={{ bottom: 'small' }}>
					<Shimmer.ListItem width="100%" type={3} />
				</Row>
				<Row width={'fill'}>
					<Shimmer.ListItem width="100%" type={3} />
				</Row>
			</Container>
		);
	}
	return (
		<Container
			data-testid="AppointmentCardContainer"
			width={'fill'}
			padding={{ top: 'medium', right: 'small' }}
			maxHeight={'10rem'}
			style={{ overflowY: 'auto' }}
			mainAlignment="flex-start"
			crossAlignment="flex-start"
		>
			{map(events, (event, index) => (
				<Container
					key={`externalCardContainer-${event.id}`}
					data-testid={`externalCardContainer-${event.id}`}
				>
					<AppointmentCard event={event} />
					{index < events.length - 1 && <Padding bottom={'small'} />}
				</Container>
			))}
		</Container>
	);
};
