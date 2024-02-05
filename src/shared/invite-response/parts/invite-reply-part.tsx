/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useState, useContext, useMemo } from 'react';

import {
	SnackbarManagerContext,
	Container,
	Padding,
	Button,
	Divider,
	Row,
	Checkbox
} from '@zextras/carbonio-design-system';
import { addBoard, Board } from '@zextras/carbonio-shell-ui';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { Folder } from '../../../carbonio-ui-commons/types/folder';
import { generateEditor } from '../../../commons/editor-generator';
import { CALENDAR_ROUTE } from '../../../constants';
import { useCalendarFolders } from '../../../hooks/use-calendar-folders';
import {
	getEquipments,
	getMeetingRooms,
	getVirtualRoom
} from '../../../normalizations/normalize-editor';
import { useAppDispatch } from '../../../store/redux/hooks';
import { CalendarSelector } from '../../../view/editor/parts/calendar-selector';
import { sendResponse } from '../invite-reply-actions';

type InviteReplyPart = {
	inviteId: string;
	message: any & {
		participants: { address: string; fullName: string; name: string; type: string };
	};
};
const InviteReplyPart: FC<InviteReplyPart> = ({ inviteId, message }): ReactElement => {
	const [notifyOrganizer, setNotifyOrganizer] = useState(true);
	const [activeCalendar, setActiveCalendar] = useState<Folder | null>(null);
	const createSnackbar = useContext(SnackbarManagerContext);
	const [t] = useTranslation();
	const dispatch = useAppDispatch();
	const calendarFolders = useCalendarFolders();

	const proposeNewTimeCb = useCallback(() => {
		// TODO: refactor editor normalization
		// const editorContext = normalizeEditorContextFromMailMsg(message);
		const editor = generateEditor({
			context: {
				dispatch,
				folders: calendarFolders,
				isProposeNewTime: true,
				attendees: [
					{
						email: message.invite[0].comp[0].or.a ?? message.invite[0].comp[0].or.url,
						id: message.invite[0].comp[0].or.a ?? message.invite[0].comp[0].or.url
					}
				],
				panel: false,
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
				isException: message.invite[0].comp[0].ex ?? false,
				exceptId: message.invite[0].comp[0].exceptId,
				isSeries: !!message.invite[0].comp[0].recur,
				isInstance: !message.invite[0].comp[0].recur,
				isRichText: true,
				isNew: false,
				attachmentFiles: [],
				title: message.invite[0].comp[0].name,
				location: message.invite[0].comp[0].loc,
				allDay: message.invite[0].comp[0].allDay ?? false,
				freeBusy: message.invite[0].comp[0].fb,
				class: message.invite[0].comp[0].class,
				inviteId,
				timezone: message.invite[0].comp[0]?.s[0]?.tz ?? moment.tz.guess(true),
				recur: message.invite[0].comp[0].recur,
				richText: message.invite[0].comp[0].descHtml[0]?._content ?? '',
				plainText: message.invite[0].comp[0].desc[0]?._content ?? '',
				meetingRoom: getMeetingRooms(message.invite[0].comp[0].at),
				equipment: getEquipments(message.invite[0].comp[0].at),
				room: getVirtualRoom(message.invite[0].comp[0].xprop),
				uid: message.invite[0].comp[0].uid,
				originalStart:
					message.invite[0].comp[0].s[0].u ?? moment(message.invite[0].comp[0].s[0].d).valueOf(),
				originalEnd:
					message.invite[0].comp[0].e[0].u ?? moment(message.invite[0].comp[0].e[0].d).valueOf(),
				start:
					message.invite[0].comp[0].s[0].u ?? moment(message.invite[0].comp[0].s[0].d).valueOf(),
				end: message.invite[0].comp[0].e[0].u ?? moment(message.invite[0].comp[0].e[0].d).valueOf()
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
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		(action: string): any =>
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
	const participationStatus = useMemo(
		() => message?.invite?.[0]?.replies?.[0].reply?.[0]?.ptst ?? '',
		[message?.invite]
	);
	return (
		<>
			<Padding top="small" />
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
						calendarId="10"
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
						label={t('label.tentative', 'tentative')}
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
