/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useState } from 'react';

import { Container, CustomModal } from '@zextras/carbonio-design-system';
import { addBoard, Board, t } from '@zextras/carbonio-shell-ui';
import { isEmpty, map, omit } from 'lodash';
import moment from 'moment';

import { AppointmentReminderItem } from './appointment-reminder-item';
import { SetNewAppointmentTimeModal } from './set-new-appointment-time-modal';
import { useFoldersMap } from '../../carbonio-ui-commons/store/zustand/folder';
import { generateEditor } from '../../commons/editor-generator';
import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';
import { CALENDAR_ROUTE } from '../../constants';
import { normalizeInvite } from '../../normalizations/normalize-invite';
import { dismissApptReminder } from '../../store/actions/dismiss-appointment-reminder';
import { getInvite } from '../../store/actions/get-invite';
import { useAppDispatch } from '../../store/redux/hooks';
import { ReminderItem, Reminders } from '../../types/appointment-reminder';

export const ReminderModal = ({
	reminders,
	setReminders
}: {
	reminders: Reminders;
	setReminders: (arg: Reminders) => void;
}): ReactElement => {
	const [showNewTimeModal, setShowNewTimeModal] = useState(false);
	const [activeReminder, setActiveReminder] = useState<ReminderItem | undefined>(undefined);
	const toggleModal = useCallback(() => setShowNewTimeModal(!showNewTimeModal), [showNewTimeModal]);
	const dispatch = useAppDispatch();
	const calendarFolders = useFoldersMap();
	const openModal = useMemo(() => !isEmpty(reminders), [reminders]);

	const dismissAll = useCallback(() => {
		const dismissItems = map(reminders, (a) => ({
			id: a.id,
			dismissedAt: moment().valueOf()
		}));
		setShowNewTimeModal(false);
		if (dismissItems.length > 0) {
			dispatch(dismissApptReminder({ dismissItems }));
			setReminders({});
		}
	}, [dispatch, reminders, setReminders]);

	const removeFromAppList = useCallback(
		(key: string) => {
			const tmp = omit(reminders, key);
			setReminders(tmp);
		},
		[reminders, setReminders]
	);

	const setNewTime = useCallback(() => {
		if (activeReminder) {
			dispatch(getInvite({ inviteId: activeReminder.inviteId })).then(({ payload }) => {
				if (payload) {
					const invite = normalizeInvite(payload.m?.[0]);
					const event = {
						resource: {
							calendar: activeReminder.calendar,
							isRecurrent: activeReminder.isRecurrent,
							isException: !!activeReminder.isException,
							location: activeReminder.location,
							inviteId: activeReminder.inviteId,
							id: activeReminder.id
						},
						title: activeReminder.name,
						allDay: activeReminder.allDay,
						start: activeReminder.start,
						end: activeReminder.end
					};
					const editor = generateEditor({
						event,
						invite,
						context: {
							dispatch,
							folders: calendarFolders,
							panel: false
						}
					});
					addBoard({
						url: `${CALENDAR_ROUTE}/`,
						title: editor?.title ?? '',
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						editor
					} as unknown as Board);
					dismissAll();
				}
			});
		}
	}, [activeReminder, calendarFolders, dismissAll, dispatch]);

	const headerLabel = useMemo(
		() =>
			t(`label.appt_reminder`, {
				count: Object.keys(reminders)?.length ?? 1,
				defaultValue_one: 'Appointment Reminder',
				defaultValue_other: 'Appointment Reminders'
			}),
		[reminders]
	);

	const footerLabel = useMemo(
		() =>
			t('label.dismiss', {
				count: Object.keys(reminders)?.length ?? 1,
				defaultValue_one: 'Dismiss',
				defaultValue_other: 'Dismiss all'
			}),
		[reminders]
	);

	return (
		<CustomModal
			open={openModal}
			onClose={(): null => null}
			maxHeight="90vh"
			data-testid="reminder-modal"
		>
			{showNewTimeModal ? (
				<SetNewAppointmentTimeModal toggleModal={toggleModal} setNewTime={setNewTime} />
			) : (
				<Container
					padding={{ all: 'small' }}
					mainAlignment="center"
					crossAlignment="flex-start"
					height="fit"
					width="100%"
				>
					<ModalHeader title={headerLabel} />
					<Container maxHeight="20rem" style={{ overflow: 'auto', display: 'block' }}>
						{map(reminders, (reminder) => (
							<AppointmentReminderItem
								reminderItem={reminder}
								key={reminder.key}
								removeReminder={removeFromAppList}
								toggleModal={toggleModal}
								setActiveReminder={setActiveReminder}
							/>
						))}
					</Container>
					<ModalFooter label={footerLabel} onConfirm={dismissAll} />
				</Container>
			)}
		</CustomModal>
	);
};
