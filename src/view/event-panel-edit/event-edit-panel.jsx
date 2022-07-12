/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { replaceHistory, useBoardHooks } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
	Container,
	Divider,
	Icon,
	IconButton,
	Row,
	Text,
	Padding
} from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import { normalizeCalendarEvent } from '../../normalizations/normalize-calendar-events';
import { selectCalendar } from '../../store/selectors/calendars';
import { selectAppointment, selectAppointmentInstance } from '../../store/selectors/appointments';
import EditorCompleteView from './editor-complete-view';
import { useQueryParam } from '../../commons/useQueryParam';
import { useId } from '../../hooks/use-id';
import { selectInstanceInvite } from '../../store/selectors/invites';
import { useEditorDispatches } from '../../hooks/use-editor-dispatches';
import EditorSmallView from './editor-small-view';

const BackgroundContainer = styled.div`
	z-index: 10;
	position: absolute;
	top: 0px;
	right: 0px;
	bottom: 0px;
	left: 0px;
	background-color: rgba(0, 0, 0, 0.73);
	border-radius: 0px;
`;

const AppointmentExpandedContainer = styled(Container)`
	z-index: 10;
	position: absolute;
	top: 16px;
	right: 16px;
	left: 16px;
	bottom: 0px;
	width: auto;
	height: auto;
	overflow: hidden;
	max-height: 100%;
`;

const AppointmentCardContainer = styled(Container)`
	z-index: 10;
	position: absolute;
	top: 68px;
	right: 12px;
	bottom: 12px;
	left: ${({ expanded }) => (expanded ? '12px' : 'max(calc(100% - 680px), 12px)')};
	transition: left 0.2s ease-in-out;
	height: auto;
	width: auto;
	max-height: 100%;
	overflow: hidden;
`;

const Header = ({ title, expanded, setExpanded }) => {
	const [t] = useTranslation();

	const headerItems = useMemo(
		() => [
			{
				id: 'expand',
				icon: expanded ? 'Collapse' : 'Expand',
				label: '',
				click: () => setExpanded((e) => !e)
			},
			{
				id: 'close',
				icon: 'CloseOutline',
				label: '',
				click: () => {
					replaceHistory(``);
				}
			}
		],
		[expanded, setExpanded]
	);

	return (
		<>
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="gray5"
				width="fill"
				height="48px"
				padding={{ vertical: 'small' }}
			>
				<Row padding={{ horizontal: 'large' }}>
					<Icon icon={'CalendarModOutline'} />
				</Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis">
						{title ?? t('label.no_subject', 'No subject')}
					</Text>
				</Row>
				<Row height="40px" mainAlignment="flex-start" style={{ overflow: 'hidden' }}>
					{headerItems &&
						map(headerItems, (action) => (
							<IconButton key={action.id} icon={action.icon} onClick={action.click} />
						))}
					<Padding right="extrasmall" />
				</Row>
			</Row>
			<Divider />
		</>
	);
};

const EventEditPanel = ({ boardContext }) => {
	const params = useParams();
	const { calendarId, apptId, ridZ } = boardContext?.proposeNewTime
		? {
				calendarId: boardContext?.event?.resource.calendar.id,
				apptId: boardContext?.event?.resource.id,
				ridZ: boardContext?.event?.resource.ridZ
		  }
		: params;
	const calendar = useSelector((s) => selectCalendar(s, calendarId));
	const appointment = useSelector((s) => selectAppointment(s, apptId));
	const inst = useSelector((s) => selectAppointmentInstance(s, apptId, ridZ));
	const event = useMemo(() => {
		if (calendar && appointment && inst)
			return normalizeCalendarEvent(calendar, appointment, inst, appointment?.l?.includes(':'));
		return undefined;
	}, [appointment, calendar, inst]);
	const [title, setTitle] = useState(null);
	const [expanded, setExpanded] = useState(false);
	const isInstance = useQueryParam('isInstance');
	const updateAppTime = useQueryParam('updateTime');
	const selectedStartTime = useQueryParam('start');
	const selectedEndTime = useQueryParam('end');
	const [t] = useTranslation();
	const { updateBoard } = useBoardHooks();
	const { id, data } = useId(
		apptId ?? 'new',
		boardContext?.isBoard,
		boardContext?.event ? boardContext.event : event,
		selectedStartTime,
		selectedEndTime,
		boardContext?.invite,
		isInstance
	);
	const invite = useSelector(
		(state) =>
			selectInstanceInvite(state, event?.resource.inviteId, event?.resource.ridZ) ||
			boardContext?.invite
	);

	const callbacks = useEditorDispatches(id, boardContext?.isBoard, isInstance);

	useEffect(() => {
		if (!boardContext?.isBoard) {
			setTitle(data?.title ?? t('label.no_subject', 'No subject'));
		} else {
			updateBoard({ title: data?.title ?? t('label.new_appointment', 'New Appointment') });
		}
	}, [data?.title, setTitle, updateBoard, t, boardContext?.isBoard]);

	return data ? (
		<>
			{expanded && !boardContext?.isBoard ? (
				<>
					<BackgroundContainer>
						<AppointmentExpandedContainer
							background="gray5"
							mainAlignment="flex-start"
							expanded={expanded}
							height="100%"
						>
							<Header title={title} expanded={expanded} setExpanded={setExpanded} />
							<EditorCompleteView
								setTitle={setTitle}
								data={data}
								callbacks={callbacks}
								invite={boardContext?.proposeNewTime ? boardContext.invite : invite}
								updateAppTime={!!updateAppTime}
								proposeNewTime={!!boardContext?.proposeNewTime}
								isInstance={!!isInstance}
							/>
						</AppointmentExpandedContainer>
					</BackgroundContainer>
				</>
			) : (
				<>
					{boardContext?.isBoard ? (
						<EditorSmallView
							setTitle={setTitle}
							data={data}
							proposeNewTime={!!boardContext?.proposeNewTime}
							callbacks={callbacks}
							invite={boardContext?.proposeNewTime ? boardContext.invite : invite}
							updateAppTime={!!updateAppTime}
							hideActions
							isInstance={!!isInstance}
						/>
					) : (
						<AppointmentCardContainer
							background="gray5"
							mainAlignment="flex-start"
							expanded={expanded}
						>
							<Header title={title} expanded={expanded} setExpanded={setExpanded} />
							<EditorSmallView
								setTitle={setTitle}
								data={data}
								proposeNewTime={!!boardContext?.proposeNewTime}
								callbacks={callbacks}
								invite={boardContext?.proposeNewTime ? boardContext.invite : invite}
								updateAppTime={!!updateAppTime}
								hideActions
								isInstance={!!isInstance}
							/>
						</AppointmentCardContainer>
					)}
				</>
			)}
		</>
	) : (
		<></>
	);
};

export default EventEditPanel;
