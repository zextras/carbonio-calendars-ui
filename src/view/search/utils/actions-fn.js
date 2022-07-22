/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { head, split } from 'lodash';
import { CALENDAR_APP_ID, CALENDAR_ROUTE } from '../../../constants';
import { EventActionsEnum } from '../../../types/enums/event-actions-enum';
import { normalizeEditor } from '../../../normalizations/normalize-editor';
import { generateEditor } from '../../../commons/editor-generator';

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

export const editEventFn = (ev, event, invite, context) => {
	if (ev) ev.stopPropagation();
	const path = head(split(context?.pathname, `/${context?.action}`));
	generateEditor({ event, invite, context: { searchPanel: true, panel: false } });
	context?.history.push(`${path}/${EventActionsEnum.EDIT}/${context?.apptId}/${context?.ridZ}`);
};

export const moveToBardFn = (ev, context) => {
	if (ev) ev.stopPropagation();
	context.addBoard(`${CALENDAR_ROUTE}/${EventActionsEnum.EDIT}/${context.apptId}/${context.ridZ}`, {
		app: CALENDAR_APP_ID,
		editor: context.editor
	});
	const path = head(split(context?.pathname, `/${context?.action}`));
	context?.history.push(path);
};
