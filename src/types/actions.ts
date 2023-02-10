/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Folder, Tags } from '@zextras/carbonio-shell-ui';
import React from 'react';
import { EventActionsId } from './enums/event-actions-enum';
import { EventType } from './event';
import { Invite } from './store/invite';

export type ActionsContext = {
	ridZ?: string | undefined;
	isInstance?: boolean;
	isSeries?: boolean;
	isException?: boolean;
	haveWriteAccess?: boolean;
	isFromSearch?: boolean;
	createAndApplyTag: (arg: any) => any;
	createModal: any;
	createSnackbar: unknown;
	dispatch: any;
	replaceHistory?: (arg: any) => void;
	tags: Tags;
	onClose?: () => void;
	panel?: boolean;
	searchPanel?: boolean;
	panelView?: PanelView;
	folders: Array<Folder>;
};

export type PanelView = 'app' | 'board' | 'search';

export type ActionsProps = {
	event: EventType;
	invite: Invite;
	context: ActionsContext;
};

export type ActionsClick = React.SyntheticEvent | KeyboardEvent;

export type AppointmentActionsItems = {
	id: EventActionsId;
	icon: string;
	disabled: boolean;
	label: string;
	click: (ev: ActionsClick) => void;
};

export type InstanceActionsItems = Array<AppointmentActionsItems>;

export type SeriesActionsItems = [
	{
		id: EventActionsId;
		icon: 'CalendarOutline';
		label: string;
		disabled: false;
		click: (ev: ActionsClick) => void;
		items: Array<AppointmentActionsItems>;
	},
	{
		id: EventActionsId;
		icon: 'CalendarOutline';
		label: string;
		disabled: false;
		click: (ev: ActionsClick) => void;
		items: Array<AppointmentActionsItems>;
	}
];
