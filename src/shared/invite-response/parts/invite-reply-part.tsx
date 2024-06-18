/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useState, useMemo } from 'react';

import {
	Container,
	Padding,
	Button,
	Divider,
	Row,
	Checkbox,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { addBoard, Board } from '@zextras/carbonio-shell-ui';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { useFoldersMap } from '../../../carbonio-ui-commons/store/zustand/folder';
import { Folder } from '../../../carbonio-ui-commons/types/folder';
import { generateEditor } from '../../../commons/editor-generator';
import { CALENDAR_ROUTE } from '../../../constants';
import {
	getEquipments,
	getMeetingRooms,
	getVirtualRoom
} from '../../../normalizations/normalize-editor';
import { useAppDispatch } from '../../../store/redux/hooks';
import { Editor } from '../../../types/editor';
import type {
	InviteReplyPartArguments,
	InviteResponseArguments
} from '../../../types/integrations';
import { CalendarSelector } from '../../../view/editor/parts/calendar-selector';
import { sendResponse } from '../invite-reply-actions';

const normalizeEditorFromMailMessage = (
	messageData: InviteResponseArguments['mailMsg']
): Partial<Editor> => ({
	isException: messageData.ex ?? false,
	exceptId: messageData.exceptId,
	isSeries: !!messageData.recur,
	isInstance: !messageData.recur,
	isRichText: true,
	isNew: false,
	attachmentFiles: [],
	title: messageData.name,
	location: messageData.loc,
	allDay: messageData.allDay ?? false,
	freeBusy: messageData.fb,
	class: messageData.class,
	timezone: messageData?.s[0]?.tz ?? moment.tz.guess(true),
	recur: messageData.recur,
	richText: messageData.descHtml[0]?._content ?? '',
	plainText: messageData.desc[0]?._content ?? '',
	meetingRoom: getMeetingRooms(messageData.at),
	equipment: getEquipments(messageData.at),
	room: getVirtualRoom(messageData.xprop),
	uid: messageData.uid,
	originalStart: messageData.s[0].u ?? moment(messageData.s[0].d).valueOf(),
	originalEnd: messageData.e[0].u ?? moment(messageData.e[0].d).valueOf(),
	start: messageData.s[0].u ?? moment(messageData.s[0].d).valueOf(),
	end: messageData.e[0].u ?? moment(messageData.e[0].d).valueOf(),
	attendees: [
		{
			email: messageData.or.a ?? messageData.or.url,
			id: messageData.or.a ?? messageData.or.url
		}
	]
});

const InviteReplyPart: FC<InviteReplyPartArguments> = ({ inviteId, message }): ReactElement => {
	const [notifyOrganizer, setNotifyOrganizer] = useState(true);
	const [activeCalendar, setActiveCalendar] = useState<Folder | null>(null);
	const createSnackbar = useSnackbar();
	const [t] = useTranslation();
	const dispatch = useAppDispatch();
	const calendarFolders = useFoldersMap();

	const proposeNewTimeCb = useCallback(() => {
		const messageData = message.invite[0].comp[0];
		const partialEditor = normalizeEditorFromMailMessage(messageData);

		const editor = generateEditor({
			context: {
				dispatch,
				folders: calendarFolders,
				isProposeNewTime: true,
				panel: false,
				inviteId,
				disabled: {
					title: true,
					location: true,
					organizer: true,
					virtualRoom: true,
					richTextButton: true,
					attachmentsButton: true,
					saveButton: true,
					attendees: true,
					optionalAttendees: true,
					freeBusy: true,
					calendar: true,
					private: true,
					allDay: true,
					reminder: true,
					recurrence: true,
					meetingRoom: true,
					equipment: true,
					timezone: true
				},
				...partialEditor
			}
		});
		if (editor.id) {
			addBoard({
				url: `${CALENDAR_ROUTE}/`,
				title: editor?.title ?? '',
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				editor
			} as unknown as Board);
		}
	}, [calendarFolders, dispatch, inviteId, message.invite]);

	const onAction = useCallback(
		(action: string): (() => void) =>
			(): void => {
				sendResponse({
					action,
					createSnackbar,
					inviteId,
					notifyOrganizer,
					activeCalendar,
					dispatch,
					parent: message.parent
				});
			},
		[createSnackbar, inviteId, notifyOrganizer, activeCalendar, dispatch, message.parent]
	);

	// TODO: find a more readable and descriptive way to handle this data
	const participationStatus = useMemo(
		() => message?.invite?.[0]?.replies?.[0].reply?.[0]?.ptst ?? '',
		[message?.invite]
	);
	return (
		<>
			<Row width="fill" mainAlignment="space-between" padding={{ vertical: 'small' }}>
				<Container width="35%" mainAlignment="flex-start" crossAlignment="baseline">
					<Checkbox
						value={notifyOrganizer}
						onClick={(): void => setNotifyOrganizer(!notifyOrganizer)}
						label={t('label.notify_organizer', 'Notify Organizer')}
					/>
				</Container>
				<Container width="65%" mainAlignment="flex-start">
					<CalendarSelector
						calendarId={message.parent}
						onCalendarChange={(cal): void => setActiveCalendar(cal)}
						label={t('label.scheduled_in', 'Scheduled in')}
						excludeTrash
					/>
				</Container>
			</Row>
			<Row
				width="fill"
				height="fit"
				style={{
					flexGrow: 1,
					flexBasis: 'fit-content',
					whiteSpace: 'nowrap',
					overflow: 'hidden'
				}}
				padding={{ vertical: 'small' }}
				mainAlignment="flex-start"
			>
				<Padding right="small" vertical="large">
					<Button
						type="outlined"
						label={t('event.action.accept', 'Accept')}
						icon="CheckmarkOutline"
						color="success"
						onClick={onAction('ACCEPT')}
						disabled={participationStatus === 'AC'}
					/>
				</Padding>
				<Padding right="small" vertical="medium">
					<Button
						type="outlined"
						label={t('label.tentative', 'Tentative')}
						icon="QuestionMarkOutline"
						color="warning"
						onClick={onAction('TENTATIVE')}
						disabled={participationStatus === 'TE'}
					/>
				</Padding>
				<Padding right="small" vertical="medium">
					<Button
						type="outlined"
						label={t('event.action.decline', 'Decline')}
						icon="CloseOutline"
						color="error"
						onClick={onAction('DECLINE')}
						disabled={participationStatus === 'DE'}
					/>
				</Padding>
				<Padding right="small" vertical="large">
					<Button
						label={t('label.propose_new_time', 'Propose new time')}
						icon="ClockOutline"
						color="primary"
						type="outlined"
						onClick={proposeNewTimeCb}
					/>
				</Padding>
			</Row>
			<Divider />
		</>
	);
};

export default InviteReplyPart;
