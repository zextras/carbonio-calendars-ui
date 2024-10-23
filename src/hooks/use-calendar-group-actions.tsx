/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { t } from '@zextras/carbonio-shell-ui';

import { CalendarGroup } from '../carbonio-ui-commons/types';
import { EVENT_ACTIONS } from '../constants/event-actions';

// TODO: implement calendarGroup functions
const calendarGroupEditActionFn = () => () => {};

const useCalendarGroupEditActionDescriptor = (calendarGroup: CalendarGroup) => ({
	id: EVENT_ACTIONS.EXPAND,
	icon: 'ExpandOutline',
	disabled: false,
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
	label: t('event.action.expand', 'Open'),
	onClick: calendarGroupEditActionFn(calendarGroup)
});

export const useCalendarGroupActions = ({
	calendarGroup
}: {
	calendarGroup: CalendarGroup;
}): any[] => {
	const edit = useCalendarGroupEditActionDescriptor(calendarGroup);
	console.log('useCalendarGroupActions', calendarGroup);
	return [];
};
