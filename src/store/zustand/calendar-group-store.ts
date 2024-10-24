/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { keyBy } from 'lodash';
import { create } from 'zustand';

import { CalendarGroup, CalendarGroups } from '../../carbonio-ui-commons/types';

export type CalendarGroupAppState = {
	groups: Record<string, CalendarGroup>;
};

export const useCalendarGroupStore = create<CalendarGroupAppState>((set) => ({
	groups: {}
}));

export const useGroupById = (groupId: string): CalendarGroup | undefined =>
	useCalendarGroupStore((state) => state.groups[groupId]);

export const getCalendarGroups = (): Record<string, CalendarGroup> =>
	useCalendarGroupStore.getState().groups;

export const updateCalendarGroupsStore = (groups: CalendarGroups) => {
	const groupsToAdd = keyBy(groups, 'id');
	useCalendarGroupStore.setState((state) => ({
		...state,
		groups: {
			...state.groups,
			...groupsToAdd
		}
	}));
};
