/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useRef } from 'react';

import {
	useFolderStore,
	useTagStore,
	folderWorker,
	tagsWorker
} from '@zextras/carbonio-ui-commons';
import { useSync } from '@zextras/carbonio-ui-soap-lib';
import { isEmpty, reduce, forEach, sortBy, map, filter, isNil } from 'lodash';

import { useCheckedCalendarsQuery } from './use-checked-calendars-query';
import { searchAppointments } from '../store/actions/search-appointments';
import { useAppDispatch } from '../store/redux/hooks';
import {
	handleDeletedAppointments,
	handleModifiedAppointments
} from '../store/slices/appointments-slice';
import { handleModifiedInvites } from '../store/slices/invites-slice';
import {
	deleteCalendarGroupsFromStore,
	updateCalendarGroupIds,
	updateCalendarGroupName,
	updateCalendarGroupsStore
} from '../store/zustand/calendar-group-store';
import { useRangeEnd, useRangeStart } from '../store/zustand/hooks';

function handleCalendarGroupNotify(notify) {
	if (notify.deleted) {
		deleteCalendarGroupsFromStore(notify.deleted);
	}
	if (notify?.modified?.folder) {
		forEach(notify?.modified?.folder, (folder) => {
			if (folder.id && folder.name) {
				updateCalendarGroupName(folder.id, folder.name);
			}
			if (folder.id && !isNil(folder?.meta?.[0]?._attrs?.cids)) {
				const ids = folder?.meta?.[0]?._attrs?.cids;
				const groupIds = ids?.length ? ids?.split('#') : [];
				updateCalendarGroupIds(folder.id, groupIds);
			}
		});
	}
	if (notify?.created?.folder) {
		const groupsToAdd = filter(
			notify?.created?.folder,
			(folder) => folder.view === 'calendar_group'
		);
		if (groupsToAdd.length) {
			const groups = map(groupsToAdd, (group) => ({
				id: group.id,
				name: group.name,
				calendarId: group?.meta?.[0]?._attrs?.cids?.split('#') ?? []
			}));

			updateCalendarGroupsStore(groups);
		}
	}
}

function handleFoldersNotify(notifyList, notify) {
	const isNotifyRelatedToFolders =
		!isEmpty(notifyList) &&
		!!(
			notify?.created?.folder ||
			notify?.modified?.folder ||
			notify.deleted ||
			notify?.created?.link ||
			notify?.modified?.link
		);

	if (isNotifyRelatedToFolders) {
		handleCalendarGroupNotify(notify);
		const state = useFolderStore.getState();
		folderWorker.postMessage({
			op: 'notify',
			notify,
			state: state.folders
		});
	}
}

function handleAppointmentCreationNotify(notify, dispatch, end, start, query) {
	if (notify.created && notify.created.appt) {
		dispatch(searchAppointments({ spanEnd: end, spanStart: start, query }));
	}
}

function handleAppointmentModifyNotify(notify, dispatch, end, start, query) {
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
}

function handleAppointmentDeletionNotify(notify, dispatch) {
	if (notify.deleted) {
		dispatch(handleDeletedAppointments(notify.deleted));
	}
}

export const useSyncDataHandler = () => {
	const notifyList = useSync();
	const seq = useRef(-1);
	const dispatch = useAppDispatch();
	const start = useRangeStart();
	const end = useRangeEnd();
	const query = useCheckedCalendarsQuery();

	useEffect(() => {
		if (notifyList.length <= 0) return;
		forEach(sortBy(notifyList, 'seq'), (notify) => {
			if (!isEmpty(notify) && (notify.seq > seq.current || (seq.current > 1 && notify.seq === 1))) {
				handleFoldersNotify(notifyList, notify);
				tagsWorker.postMessage({
					op: 'notify',
					notify,
					state: useTagStore.getState().tags
				});
				handleAppointmentCreationNotify(notify, dispatch, end, start, query);
				handleAppointmentModifyNotify(notify, dispatch, end, start, query);
				handleAppointmentDeletionNotify(notify, dispatch);
				seq.current = notify.seq;
			}
		});
	}, [dispatch, end, notifyList, query, start]);
};
