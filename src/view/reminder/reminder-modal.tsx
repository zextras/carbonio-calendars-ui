/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useState } from 'react';

import { Container, CustomModal } from '@zextras/carbonio-design-system';
import { addBoard, Board, t } from '@zextras/carbonio-shell-ui';
import { FOLDERS, useFoldersMap } from '@zextras/carbonio-ui-commons';
import { find, isEmpty, map, omit } from 'lodash';
import moment from 'moment';

import { AppointmentReminderItem } from './appointment-reminder-item';
import { SetNewAppointmentTimeModal } from './set-new-appointment-time-modal';
import { generateEditor } from '../../commons/editor-generator';
import { getAppointment, normalizeFromGetAppointment } from '../../commons/get-appointment';
import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';
import { CALENDAR_BOARD_ID } from '../../constants';
import { normalizeCalendarEvent } from '../../normalizations/normalize-calendar-events';
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
					getAppointment(activeReminder.id).then((res) => {
						const appointment = normalizeFromGetAppointment(res?.appt[0]);
						const invite = normalizeInvite(payload.m?.[0]);
						const folderId = invite.ciFolder;
						const calendar = find(calendarFolders, ['id', folderId ?? FOLDERS.CALENDAR]);
						if (calendar) {
							const event = normalizeCalendarEvent({ appointment, invite, calendar });
							const editor = generateEditor({
								event,
								invite,
								context: {
									dispatch,
									folders: calendarFolders
								}
							});
							addBoard({
								boardViewId: CALENDAR_BOARD_ID,
								title: editor?.title ?? '',
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								editor
							} as unknown as Board);
							dismissAll();
						}
					});
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
			onClose={dismissAll}
			maxHeight="90vh"
			data-testid="reminder-modal"
		>
			{showNewTimeModal ? (
				<SetNewAppointmentTimeModal toggleModal={toggleModal} setNewTime={setNewTime} />
			) : (
				<Container mainAlignment="center" crossAlignment="flex-start" height="fit" width="100%">
					<ModalHeader title={headerLabel} />
					<Container
						maxHeight="20rem"
						style={{ overflow: 'auto', display: 'block' }}
						padding={{ vertical: 'small', right: 'small' }}
					>
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
