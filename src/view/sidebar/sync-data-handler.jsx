/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useNotify, useRefresh } from '@zextras/carbonio-shell-ui';
import { forEach, isEmpty, reduce, sortBy } from 'lodash';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { searchAppointments } from '../../store/actions/search-appointments';
import { selectEnd, selectStart } from '../../store/selectors/calendars';
import { handleModifiedAppointments } from '../../store/slices/appointments-slice';
import {
	handleCalendarsRefresh,
	handleCreatedCalendars,
	handleDeletedCalendars,
	handleModifiedCalendars
} from '../../store/slices/calendars-slice';
import { handleModifiedInvites } from '../../store/slices/invites-slice';

export const SyncDataHandler = () => {
	const refresh = useRefresh();
	const notifyList = useNotify();
	const [seq, setSeq] = useState(-1);
	const dispatch = useAppDispatch();
	const [initialized, setInitialized] = useState(false);
	const start = useAppSelector(selectStart);
	const end = useAppSelector(selectEnd);
	useEffect(() => {
		if (!isEmpty(refresh) && !initialized) {
			dispatch(handleCalendarsRefresh(refresh));
			setInitialized(true);
		}
	}, [dispatch, initialized, refresh]);

	useEffect(() => {
		if (initialized) {
			if (notifyList.length > 0) {
				forEach(sortBy(notifyList, 'seq'), (notify) => {
					if (!isEmpty(notify) && (notify.seq > seq || (seq > 1 && notify.seq === 1))) {
						if (notify.created) {
							if (notify.created.folder || notify.created.link) {
								dispatch(
									handleCreatedCalendars([
										...(notify.created.folder ?? []),
										...(notify.created.link ?? [])
									])
								);
							}
							if (notify.created.appt) {
								dispatch(searchAppointments({ spanEnd: end, spanStart: start }));
							}
						}
						if (notify.modified) {
							if (notify.modified.folder || notify.modified.link) {
								dispatch(
									handleModifiedCalendars([
										...(notify.modified.folder ?? []),
										...(notify.modified.link ?? [])
									])
								);
							}
							if (notify.modified.appt) {
								// probably unnecessary
								const apptToUpdate = reduce(
									notify.modified.appt,
									(acc, v) => {
										if (v.l) {
											return [...acc, v];
										}
										return acc;
									},
									[]
								);
								if (apptToUpdate?.length > 0) {
									dispatch(handleModifiedAppointments(apptToUpdate));
								}
								dispatch(searchAppointments({ spanEnd: end, spanStart: start }));

								const invites = reduce(
									notify.modified.appt,
									(acc, v) => {
										if (v?.inv?.length > 0) {
											return [...acc, ...v.inv];
										}
										return acc;
									},
									[]
								);
								if (invites?.length > 0) {
									dispatch(handleModifiedInvites(invites));
								}
							}
						}
						if (notify.deleted) {
							dispatch(handleDeletedCalendars(notify.deleted));
						}
						setSeq(notify.seq);
					}
				});
			}
		}
	}, [dispatch, end, initialized, notifyList, seq, start]);

	return null;
};
