/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AlarmType } from './event';

export type SetActiveReminderFn = (reminderItem: ReminderItem) => void;
export type RemoveReminderFn = (a: string) => void;
export type ReminderItem = {
	key: string;
	start: Date;
	id: string;
	isRecurrent: boolean;
	end: Date;
	alarmData: Array<AlarmType>;
	location: string;
	name: string;
	isOrg: boolean;
	inviteId: string;
	calendar: { id: string };
	isException?: boolean;
	allDay: boolean;
};

export type ReminderModalContentProps = {
	reminders: Reminders;
	removeReminder: RemoveReminderFn;
	toggleModal: () => void;
	setActiveReminder: SetActiveReminderFn;
};

export type ApptReminderModalProps = {
	open: boolean;
	reminders: Reminders;
	onConfirm: (a: string) => void;
	removeReminder: RemoveReminderFn;
	toggleModal: () => void;
	setActiveReminder: SetActiveReminderFn;
};

export type ApptReminderCardProps = {
	reminderItem: ReminderItem;
	removeReminder: RemoveReminderFn;
	toggleModal: () => void;
	setActiveReminder: SetActiveReminderFn;
};

export type SetNewTimeModalProps = {
	toggleModal: () => void;
	setNewTime: () => void;
};

export type Reminders = Record<string, ReminderItem>;
