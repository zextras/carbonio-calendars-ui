/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useState } from 'react';

import { useNotify, useRefresh } from '@zextras/carbonio-shell-ui';
import { isEmpty, reduce, forEach, sortBy } from 'lodash';

import { useFolderStore } from '../../carbonio-ui-commons/store/zustand/folder';
import { folderWorker } from '../../carbonio-ui-commons/worker';
import { useCheckedCalendarsQuery } from '../../hooks/use-checked-calendars-query';
import { searchAppointments } from '../../store/actions/search-appointments';
import { useAppDispatch } from '../../store/redux/hooks';
import {
	handleDeletedAppointments,
	handleModifiedAppointments
} from '../../store/slices/appointments-slice';
import { handleModifiedInvites } from '../../store/slices/invites-slice';
import { useRangeEnd, useRangeStart } from '../../store/zustand/hooks';

function handleFoldersNotify(notifyList, notify, worker, store) {
	const isNotifyRelatedToFolders =
		!isEmpty(notifyList) &&
		(notify?.created?.folder ||
			notify?.modified?.folder ||
			notify.deleted ||
			notify?.created?.link ||
			notify?.modified?.link);

	if (isNotifyRelatedToFolders) {
		worker.postMessage({
			op: 'notify',
			notify,
			state: store.getState().folders
		});
	}
}

export const SyncDataHandler = () => {
	const refresh = useRefresh();
	const notifyList = useNotify();
	const [seq, setSeq] = useState(-1);
	const dispatch = useAppDispatch();
	const start = useRangeStart();
	const end = useRangeEnd();
	const [initialized, setInitialized] = useState(false);
	const query = useCheckedCalendarsQuery();

	useEffect(() => {
		if (!isEmpty(refresh) && !initialized) {
			setInitialized(true);
		}
	}, [dispatch, initialized, refresh]);

	useEffect(() => {
		if (notifyList.length > 0) {
			forEach(sortBy(notifyList, 'seq'), (notify) => {
				if (!isEmpty(notify) && (notify.seq > seq || (seq > 1 && notify.seq === 1))) {
					handleFoldersNotify(notifyList, notify, folderWorker, useFolderStore);

					if (notify.created && notify.created.appt) {
						dispatch(searchAppointments({ spanEnd: end, spanStart: start, query }));
					}
					if (notify.modified && notify.modified.appt) {
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
						dispatch(searchAppointments({ spanEnd: end, spanStart: start, query }));

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
					if (notify.deleted) {
						dispatch(handleDeletedAppointments(notify.deleted));
					}
					setSeq(notify.seq);
				}
			});
		}
	}, [dispatch, end, notifyList, query, seq, start]);

	return null;
};
