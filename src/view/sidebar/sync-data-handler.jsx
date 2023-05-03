/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useState } from 'react';
import { isEmpty, reduce, forEach, sortBy } from 'lodash';
import { useNotify, useRefresh } from '@zextras/carbonio-shell-ui';
import { handleModifiedInvites } from '../../store/slices/invites-slice';
import {
	handleCalendarsRefresh,
	handleCreatedCalendars,
	handleDeletedCalendars,
	handleModifiedCalendars
} from '../../store/slices/calendars-slice';
import { handleModifiedAppointments } from '../../store/slices/appointments-slice';
import { selectEnd, selectStart } from '../../store/selectors/calendars';
import { searchAppointments } from '../../store/actions/search-appointments';
import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import { folderWorker } from '../../carbonio-ui-commons/worker';
import { useFolderStore } from '../../carbonio-ui-commons/store/zustand/folder';

export const SyncDataHandler = () => {
	const refresh = useRefresh();
	const notifyList = useNotify();
	const [seq, setSeq] = useState(-1);
	const dispatch = useAppDispatch();
	const start = useAppSelector(selectStart);
	const end = useAppSelector(selectEnd);
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		if (!isEmpty(refresh) && !initialized) {
			folderWorker.postMessage({
				op: 'refresh',
				folder: refresh.folder ?? []
			});
			dispatch(handleCalendarsRefresh(refresh));
			setInitialized(true);
		}
	}, [dispatch, initialized, refresh]);

	useEffect(() => {
		if (notifyList.length > 0) {
			forEach(sortBy(notifyList, 'seq'), (notify) => {
				if (!isEmpty(notify) && (notify.seq > seq || (seq > 1 && notify.seq === 1))) {
					folderWorker.postMessage({
						op: 'notify',
						notify,
						state: useFolderStore.getState().folders
					});
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
	}, [dispatch, end, notifyList, seq, start]);

	return null;
};
