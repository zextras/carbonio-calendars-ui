/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Folder, useFoldersMap } from '@zextras/carbonio-ui-commons';
import { forEach, isEqual, keyBy, some } from 'lodash';
import { create } from 'zustand';

export type CalendarGroup = {
	id: string;
	name: string;
	calendarId?: string[];
};
export type CalendarGroups = Record<string, CalendarGroup>;

export type CalendarGroupAppState = {
	groups: CalendarGroups;
};

export const useCalendarGroupStore = create<CalendarGroupAppState>(() => ({
	groups: {}
}));

/**
 * Check if the group contains any non-existent calendars
 * @param group
 * @param folders
 */
const groupContainsNonExistentCalendars = (
	group: CalendarGroup,
	folders: Record<string, Folder>
): boolean => (group.calendarId ? group.calendarId.some((id) => !folders[id]) : false);

/**
 * Check if any group contains a non-existent calendar
 * @param groups
 * @param folders
 */
const groupsContainNonExistentCalendars = (
	groups: CalendarGroups,
	folders: Record<string, Folder>
): boolean => some(groups, (group) => groupContainsNonExistentCalendars(group, folders));

/**
 * Return the given group with non-existent calendars removed
 * @param group
 * @param folders
 */
const cleanupGroupFromNonExistentCalendars = (
	group: CalendarGroup,
	folders: Record<string, Folder>
): CalendarGroup => {
	if (!groupContainsNonExistentCalendars(group, folders)) {
		return group;
	}

	const newGroup = { ...group };
	if (newGroup.calendarId) {
		newGroup.calendarId = newGroup.calendarId.filter((id) => folders[id]);
	}
	return newGroup;
};

export const useGroupById = (groupId: string): CalendarGroup | undefined => {
	const folders = useFoldersMap();
	const group = useCalendarGroupStore((state) => state.groups[groupId]);
	return group ? cleanupGroupFromNonExistentCalendars(group, folders) : undefined;
};

export const useCalendarGroups = (): CalendarGroups => {
	const folders = useFoldersMap();
	return useCalendarGroupStore((state) => {
		if (!groupsContainNonExistentCalendars(state.groups, folders)) {
			return state.groups;
		}

		const newGroups = { ...state.groups };
		forEach(newGroups, (group, id) => {
			newGroups[id] = cleanupGroupFromNonExistentCalendars(group, folders);
		});

		return newGroups;
	});
};

export const updateCalendarGroupsStore = (groups: Array<CalendarGroup>): void => {
	const groupsToAdd = keyBy(groups, 'id');
	useCalendarGroupStore.setState((state) => ({
		...state,
		groups: {
			...state.groups,
			...groupsToAdd
		}
	}));
};

export const deleteCalendarGroupsFromStore = (groupIds: Array<string>): void => {
	const state = useCalendarGroupStore.getState();
	forEach(groupIds, (id) => {
		if (state.groups[id]) {
			delete state.groups[id];
		}
	});
};

export const updateCalendarGroupIds = (groupId: string, groupIds: Array<string>): void => {
	const state = useCalendarGroupStore.getState();
	if (state.groups[groupId] && !isEqual(state.groups[groupId].calendarId, groupIds)) {
		useCalendarGroupStore.setState((s) => ({
			...s,
			groups: {
				...s.groups,
				[groupId]: {
					...s.groups[groupId],
					calendarId: groupIds
				}
			}
		}));
	}
};

export const updateCalendarGroupName = (groupId: string, name: string): void => {
	const state = useCalendarGroupStore.getState();
	if (state.groups[groupId] && state.groups[groupId].name !== name) {
		useCalendarGroupStore.setState((s) => ({
			...s,
			groups: {
				...s.groups,
				[groupId]: {
					...s.groups[groupId],
					name
				}
			}
		}));
	}
};
