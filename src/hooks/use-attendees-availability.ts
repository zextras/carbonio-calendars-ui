/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { map, differenceBy, filter, includes, find } from 'lodash';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { getFreeBusyRequest } from '../soap/get-free-busy-request';
import { Editor } from '../types/editor';

export type AttendeesAvailabilityType = {
	id: string;
	email: string;
	t: Array<{ s: number; e: number }>;
	f: Array<{ s: number; e: number }>;
	b: Array<{ s: number; e: number }>;
	requestedDays: Array<string>;
};

export type AttendeesAvailabilityListType = Array<AttendeesAvailabilityType> | undefined;

export const useAttendeesAvailability = (
	start: Editor['start'],
	attendees: Editor['attendees'],
	excludeUid?: string | undefined
): AttendeesAvailabilityListType => {
	const [previousStart, setPreviousStart] = useState<Editor['start']>(start);

	const [attendeesAvailabilityList, setAttendeesAvailabilityList] =
		useState<AttendeesAvailabilityListType>(undefined);

	useEffect(() => {
		if (start && attendees && attendees.length > 0) {
			const currentStartDay = moment(start).format('YYYY/MM/DD');

			const newRangeStart = moment(start).startOf('day').valueOf();
			const newRangeEnd = moment(start).endOf('day').valueOf();

			if (!attendeesAvailabilityList) {
				const uid = map(attendees, (attendee) => attendee.email).join(',');

				getFreeBusyRequest({ s: newRangeStart, e: newRangeEnd, uid, excludeUid }).then(
					(response) => {
						const newAttendeesInRangeRetrievedList = map(response.usr, (item) => ({
							...item,
							email: item.id,
							t: item.t ?? [],
							f: item.f ?? [],
							b: item.b ?? [],
							requestedDays: [currentStartDay]
						}));
						setAttendeesAvailabilityList(newAttendeesInRangeRetrievedList);
					}
				);
			}
			if (attendeesAvailabilityList) {
				const newAttendees = differenceBy(attendees, attendeesAvailabilityList, 'email');
				if (newAttendees.length) {
					const uid = map(newAttendees, (attendee) => attendee.email).join(',');

					getFreeBusyRequest({ s: newRangeStart, e: newRangeEnd, uid, excludeUid }).then(
						(response) => {
							const newAttendee = map(response.usr, (item) => ({
								...item,
								email: item.id,
								t: item.t ?? [],
								f: item.f ?? [],
								b: item.b ?? [],
								requestedDays: [currentStartDay]
							}));
							const newList = attendeesAvailabilityList.concat(newAttendee);
							setAttendeesAvailabilityList(newList);
						}
					);
				}
				const previousStartDay = moment(previousStart).format('YYYY/MM/DD');

				if (currentStartDay !== previousStartDay) {
					setPreviousStart(start);
					const AttendeesToRetrieve = filter(
						attendeesAvailabilityList,
						(attendee) => !includes(attendee.requestedDays, currentStartDay)
					);
					if (AttendeesToRetrieve.length > 0) {
						const uid = map(AttendeesToRetrieve, (attendee) => attendee.email).join(',');

						getFreeBusyRequest({ s: newRangeStart, e: newRangeEnd, uid, excludeUid }).then(
							(response) => {
								const newAttendeesInRangeRetrievedList = map(response.usr, (item) => {
									const oldItem = find(attendeesAvailabilityList, ['id', item.id]);
									if (oldItem) {
										return {
											...oldItem,
											email: oldItem.email,
											t: (oldItem?.t ?? []).concat(item.t ?? []),
											f: (oldItem?.f ?? []).concat(item.f ?? []),
											b: (oldItem?.b ?? []).concat(item.b ?? []),
											requestedDays: (oldItem?.requestedDays ?? []).concat([currentStartDay])
										};
									}
									return {
										...item,
										email: item.id,
										t: item.t ?? [],
										f: item.f ?? [],
										b: item.b ?? [],
										requestedDays: [currentStartDay]
									};
								});
								const oldAttendeesInRangeRetrievedList = differenceBy(
									attendeesAvailabilityList,
									response.usr,
									'id'
								);
								setAttendeesAvailabilityList(
									oldAttendeesInRangeRetrievedList.concat(newAttendeesInRangeRetrievedList)
								);
							}
						);
					}
				}
			}
		}
	}, [attendees, attendeesAvailabilityList, excludeUid, previousStart, start]);

	return attendeesAvailabilityList;
};
