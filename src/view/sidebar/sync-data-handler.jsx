/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useState } from 'react';
import { isEmpty, reduce, forEach, sortBy } from 'lodash';
import { useRefresh, useNotify, store } from '@zextras/carbonio-shell-ui';
import { useDispatch, useSelector } from 'react-redux';
import { combineReducers } from '@reduxjs/toolkit';
import invitesSliceReducer, { handleModifiedInvites } from '../../store/slices/invites-slice';
import calendarsSliceReducer, {
	handleCalendarsRefresh,
	handleCreatedCalendars,
	handleDeletedCalendars,
	handleModifiedCalendars
} from '../../store/slices/calendars-slice';
import editorSliceReducer from '../../store/slices/editor-slice';
import appointmentsSliceReducer, {
	handleModifiedAppointments
} from '../../store/slices/appointments-slice';
import { setSearchRange } from '../../store/actions/set-search-range';
import { selectEnd, selectStart } from '../../store/selectors/calendars';

export const SyncDataHandler = () => {
	const refresh = useRefresh();
	const notifyList = useNotify();
	const [seq, setSeq] = useState(-1);
	const dispatch = useDispatch();
	const [initialized, setInitialized] = useState(false);
	const start = useSelector(selectStart);
	const end = useSelector(selectEnd);
	useEffect(() => {
		if (!isEmpty(refresh) && !initialized) {
			store.setReducer(
				combineReducers({
					appointments: appointmentsSliceReducer,
					calendars: calendarsSliceReducer,
					editor: editorSliceReducer,
					invites: invitesSliceReducer
				})
			);
			dispatch(handleCalendarsRefresh(refresh));
			setInitialized(true);
		}
	}, [dispatch, initialized, refresh]);

	useEffect(() => {
		if (initialized) {
			if (notifyList.length > 0) {
				forEach(sortBy(notifyList, 'seq'), (notify) => {
					if (!isEmpty(notify) && notify.seq > seq) {
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
								dispatch(
									setSearchRange({
										rangeStart: start,
										rangeEnd: end
									})
								);
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
								dispatch(
									setSearchRange({
										rangeStart: start,
										rangeEnd: end
									})
								);

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
							dispatch(handleDeletedCalendars(notify.deleted?.id?.split?.(',')));
						}
						setSeq(notify.seq);
					}
				});
			}
		}
	}, [dispatch, end, initialized, notifyList, seq, start]);

	return null;
};
