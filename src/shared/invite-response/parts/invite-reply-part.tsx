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
import { addBoard, Board, getUserAccount } from '@zextras/carbonio-shell-ui';
import { useHistoryNavigation, useFoldersMap, Folder } from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';

import { InstanceExceptionId } from '../../../utils/event';

import { sendResponse } from '../invite-reply-actions';
import { generateEditor } from 'commons/editor-generator';
import { PARTICIPATION_STATUS } from 'constants/api';
import { CALENDAR_BOARD_ID } from 'constants/index';
import { getEquipments, getMeetingRooms, getVirtualRoom } from 'normalizations/normalize-editor';
import { InviteReplyVerb, MimePartInfo, Msg } from 'soap/send-invite-reply-request';
import { buildMessagePart } from 'store/actions/move-appointment-to-trash';
import { useAppDispatch } from 'store/redux/hooks';
import { Editor } from 'types/editor';
import type { InviteReplyPartArguments, InviteResponseArguments } from 'types/integrations';
import { Invite } from 'types/store/invite';
import { parseDateFromICS } from 'utils/dates';
import { CalendarSelector } from 'view/editor/parts/calendar-selector';

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
	timezone: messageData?.s[0]?.tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
	recur: messageData.recur,
	richText: messageData.descHtml?.[0]?._content ?? '',
	plainText: messageData.desc[0]?._content ?? '',
	meetingRoom: getMeetingRooms(messageData.at),
	equipment: getEquipments(messageData.at),
	room: getVirtualRoom(messageData.xprop),
	uid: messageData.uid,
	originalStart:
		messageData.s[0].u ?? (messageData.s[0].d ? parseDateFromICS(messageData.s[0].d).getTime() : 0),
	originalEnd:
		messageData.e[0].u ?? (messageData.e[0].d ? parseDateFromICS(messageData.e[0].d).getTime() : 0),
	start:
		messageData.s[0].u ?? (messageData.s[0].d ? parseDateFromICS(messageData.s[0].d).getTime() : 0),
	end:
		messageData.e[0].u ?? (messageData.e[0].d ? parseDateFromICS(messageData.e[0].d).getTime() : 0),
	attendees: [
		{
			email: messageData.or.a ?? messageData.or.url
		}
	]
});

const InviteReplyPart: FC<InviteReplyPartArguments> = ({ inviteId, message }): ReactElement => {
	const [notifyOrganizer, setNotifyOrganizer] = useState(true);
	const createSnackbar = useSnackbar();
	const [t] = useTranslation();
	const dispatch = useAppDispatch();
	const calendarFolders = useFoldersMap();
	const { replaceHistory } = useHistoryNavigation();

	const [selectedCalendarId, setSelectedCalendarId] = useState<string>(message.parent);
	const [activeCalendar, setActiveCalendar] = useState<Folder | null>(
		() => calendarFolders[message.parent] ?? null
	);

	const exceptId = useMemo((): InstanceExceptionId | undefined => {
		const messageData = message.invite?.[0]?.comp?.[0];
		if (!messageData || messageData.recur) return undefined;
		const rawExceptId = messageData.exceptId?.[0];
		return rawExceptId?.d ? { d: rawExceptId.d, tz: rawExceptId.tz } : undefined;
	}, [message.invite]);

	const declineMessage = useMemo((): Msg | undefined => {
		if (!notifyOrganizer) return undefined;
		const messageData = message.invite?.[0]?.comp?.[0];
		if (!messageData) return undefined;
		const inviteForMessage = {
			name: messageData.name,
			allDay: messageData.allDay ?? false,
			start: { d: messageData.s?.[0]?.d, u: messageData.s?.[0]?.u, tz: messageData.s?.[0]?.tz },
			end: { d: messageData.e?.[0]?.d, u: messageData.e?.[0]?.u, tz: messageData.e?.[0]?.tz },
			textDescription: messageData.desc,
			htmlDescription: messageData.descHtml?.length ? messageData.descHtml : undefined,
			recurrenceRule: messageData.recur,
			tz: messageData.s?.[0]?.tz
		};
		const messagePart = buildMessagePart({
			t,
			fullInvite: inviteForMessage as unknown as Invite,
			newMessage: `${t('message.invite_declined', 'The following meeting invite has been declined')}:`,
			deleteSingleInstance: true,
			inst: exceptId
		});
		const organizerEmail = messageData.or?.a ?? messageData.or?.url ?? '';
		const inviteeEmail = getUserAccount()?.name ?? '';
		return {
			su: `${t('label.declined', 'Declined')}: ${messageData.name ?? ''}`,
			mp: messagePart as MimePartInfo,
			e: [
				{ t: 't', a: organizerEmail },
				{ t: 'f', a: inviteeEmail }
			]
		};
	}, [notifyOrganizer, message.invite, t, exceptId]);

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
				boardViewId: CALENDAR_BOARD_ID,
				title: editor?.title ?? '',
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				editor
			} as unknown as Board);
		}
	}, [calendarFolders, dispatch, inviteId, message.invite]);

	const onAction = useCallback(
		(action: InviteReplyVerb): (() => void) =>
			(): void => {
				sendResponse({
					action,
					createSnackbar,
					inviteId,
					notifyOrganizer,
					activeCalendar,
					dispatch,
					replaceHistory,
					t,
					parent: message.parent,
					exceptId,
					...(action === InviteReplyVerb.DECLINE && declineMessage && { m: declineMessage })
				});
			},
		[
			t,
			replaceHistory,
			createSnackbar,
			inviteId,
			notifyOrganizer,
			activeCalendar,
			dispatch,
			message.parent,
			exceptId,
			declineMessage
		]
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
						calendarId={selectedCalendarId}
						onCalendarChange={(cal): void => {
							setActiveCalendar(cal);
							setSelectedCalendarId(cal.id);
						}}
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
						onClick={onAction(InviteReplyVerb.ACCEPT)}
						disabled={participationStatus === PARTICIPATION_STATUS.ACCEPTED}
					/>
				</Padding>
				<Padding right="small" vertical="medium">
					<Button
						type="outlined"
						label={t('label.tentative', 'Tentative')}
						icon="QuestionMarkOutline"
						color="warning"
						onClick={onAction(InviteReplyVerb.TENTATIVE)}
						disabled={participationStatus === PARTICIPATION_STATUS.TENTATIVE}
					/>
				</Padding>
				<Padding right="small" vertical="medium">
					<Button
						type="outlined"
						label={t('event.action.decline', 'Decline')}
						icon="CloseOutline"
						color="error"
						onClick={onAction(InviteReplyVerb.DECLINE)}
						disabled={participationStatus === PARTICIPATION_STATUS.DECLINED}
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
