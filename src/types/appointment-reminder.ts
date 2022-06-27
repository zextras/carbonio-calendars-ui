/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TFunction } from 'i18next';
import { Dispatch } from 'redux';
import { EventType } from './event';

export type ApptReminderModalProps = {
	title: string;
	open: boolean;
	onClose: () => void;
	events: Array<EventType>;
	t: TFunction;
	dispatch: Dispatch;
	onConfirm: (a: string) => void;
	removeReminder: (a: string) => void;
	toggleModal: () => void;
	setActive: (a: EventType) => void;
};

export type ApptReminderCardProps = {
	event: EventType;
	t: TFunction;
	dispatch: Dispatch;
	removeReminder: (a: string) => void;
	toggleModal: () => void;
	setActive: (a: EventType) => void;
};

export type SetNewTimeModalProps = {
	toggleModal: () => void;
	t: TFunction;
	setNewTime: () => void;
};
