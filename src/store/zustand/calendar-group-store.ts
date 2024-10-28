/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { forEach, isEqual, keyBy } from 'lodash';
import { create } from 'zustand';

export type CalendarGroup = {
	id: string;
	name: string;
	calendarId: string[];
};
export type CalendarGroups = CalendarGroup[];

export type CalendarGroupAppState = {
	groups: Record<string, CalendarGroup>;
};

export const useCalendarGroupStore = create<CalendarGroupAppState>(() => ({
	groups: {}
}));

export const useGroupById = (groupId: string): CalendarGroup | undefined =>
	useCalendarGroupStore((state) => state.groups[groupId]);

export const getCalendarGroups = (): Record<string, CalendarGroup> =>
	useCalendarGroupStore.getState().groups;

export const updateCalendarGroupsStore = (groups: CalendarGroups): void => {
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
