/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { head, split } from 'lodash';
import { addBoard } from '@zextras/carbonio-shell-ui';
import { CALENDAR_ROUTE } from '../../../constants';
import { EventActionsEnum } from '../../../types/enums/event-actions-enum';

export const openEventFn = (ev, context) => {
	if (ev) ev.stopPropagation();
	const path = head(split(context?.pathname, `/${context?.action}`));
	context?.history.push(`${path}/${EventActionsEnum.EXPAND}/${context?.apptId}/${context?.ridZ}`);
};

export const closeEventFn = (ev, context) => {
	if (ev) ev.stopPropagation();
	const path = head(split(context?.pathname, `/${context?.action}`));
	context?.history.push(path);
};

export const editEventFn = (ev, context) => {
	if (ev) ev.stopPropagation();
	const path = head(split(context?.pathname, `/${context?.action}`));
	context?.history.push(`${path}/${EventActionsEnum.EDIT}/${context?.apptId}/${context?.ridZ}`);
};

export const moveToBardFn = (ev, context) => {
	if (ev) ev.stopPropagation();
	addBoard({
		url: `${CALENDAR_ROUTE}/${EventActionsEnum.EDIT}/${context.apptId}/${context.ridZ}`,
		context: { editor: context.editor }
	});
	const path = head(split(context?.pathname, `/${context?.action}`));
	context?.history.push(path);
};
