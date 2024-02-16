/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TFunction } from 'i18next';
import { Dispatch } from 'redux';

import { EventType } from './event';
import { TransProps } from './i18next';

export type DeleteApptViewType = {
	open: boolean;
	onClose: () => void;
	event: EventType;
	isInstance: boolean;
};

export type ShowDeleteWarningModalType = {
	toggleModal: () => void;
	onConfirm: () => void;
	onClose: () => void;
	open: boolean;
	appointment: EventType;
	t: TFunction;
	inviteFetched: boolean;
	invite: any;
	notifyOrganizer: boolean;
	toggleNotifyOrganizer: () => void;
	onEditMessage: () => void;
	activeModal: string;
	isInstance: boolean;
	onDeleteSingleInstance: () => void;
	onDeleteFutureInstance: () => void;
	title: string;
	disabled: boolean;
	deleteAll: boolean;
	deleteOneAndConfirm: () => void;
	toggleDeleteAll: () => void;
	Trans: TransProps;
};

export type SnackbarArgumentType = {
	key: string;
	replace: boolean;
	type: string;
	label: string;
	autoHideTimeout: number;
	hideButton: boolean;
	actionLabel?: string;
	onActionClick?: () => void;
};
export type DeleteApptFunctionType = {
	id?: string;
	notifyOrganizer?: boolean;
	dispatch: Dispatch;
	event: EventType;
	t?: TFunction;
	invite: any;
	notify?: boolean;
	onClose: () => void;
	isOrganizer?: boolean;
	isInstance?: boolean;
	createSnackbar: (obj: SnackbarArgumentType) => void;
	newMessage?: string;
	accounts: any;
};
