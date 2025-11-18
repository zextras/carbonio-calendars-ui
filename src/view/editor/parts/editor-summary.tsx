/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';

import styled from '@emotion/styled';
import {
	Avatar,
	Container,
	Icon,
	Padding,
	Row,
	Text,
	Tooltip
} from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { CALENDARS_STANDARD_COLORS } from '../../../constants/calendar';
import { useGetDateRangeConvertedToTimezone } from '../../../hooks/use-get-date-range-converted-to-timezone';
import { useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorAllDay,
	selectEditorCalendar,
	selectEditorEnd,
	selectEditorEquipment,
	selectEditorLocation,
	selectEditorMeetingRoom,
	selectEditorRoom,
	selectEditorStart,
	selectEditorTimezone,
	selectEditorTitle
} from '../../../store/selectors/editor';

export const AvatarComp = styled(Avatar)`
	svg {
		width: 1.5rem;
		min-width: 1.5rem;
		height: 1.5rem;
		min-height: 1.5rem;
	}
`;

const TitleRow = ({ children }: { children: ReactElement }): ReactElement => (
	<Container
		mainAlignment="flex-start"
		crossAlignment="flex-start"
		padding={{ top: 'extrasmall' }}
		orientation="horizontal"
	>
		{children}
	</Container>
);

export const EditorSummary = ({ editorId }: { editorId: string }): ReactElement => {
	const [t] = useTranslation();
	const start = useAppSelector(selectEditorStart(editorId));
	const end = useAppSelector(selectEditorEnd(editorId));
	const timezone = useAppSelector(selectEditorTimezone(editorId));
	const location = useAppSelector(selectEditorLocation(editorId));
	const meetingRoom = useAppSelector(selectEditorMeetingRoom(editorId));
	const equipments = useAppSelector(selectEditorEquipment(editorId));
	const room = useAppSelector(selectEditorRoom(editorId));
	const title = useAppSelector(selectEditorTitle(editorId));
	const calendar = useAppSelector(selectEditorCalendar(editorId));
	const allDay = useAppSelector(selectEditorAllDay(editorId));

	const meetingRoomField = useMemo(() => {
		if (meetingRoom && meetingRoom.length > 0) {
			const res = map(meetingRoom, (roo) => roo.label);
			return res.join(', ');
		}
		return '';
	}, [meetingRoom]);

	const equipmentsField = useMemo(() => {
		if (equipments && equipments.length > 0) {
			const res = map(equipments, (eq) => eq.label);
			return res.join(', ');
		}
		return '';
	}, [equipments]);

	const virtualRoom = useMemo(() => room?.label, [room?.label]);

	const originalDate = useGetDateRangeConvertedToTimezone(start ?? 0, end ?? 0, {
		timeZone: timezone,
		allDay
	});
	const convertedDate = useGetDateRangeConvertedToTimezone(start ?? 0, end ?? 0, { allDay });

	const convertedDateTooltip = useMemo(
		() => (
			<>
				{t('local_timezone_tooltip', 'Date and time on local timezone:')}
				<br />
				{convertedDate}
			</>
		),
		[t, convertedDate]
	);

	return (
		<Row
			height="fit"
			width="fill"
			mainAlignment="flex-start"
			wrap="nowrap"
			padding={{ top: 'large', bottom: 'medium' }}
		>
			<AvatarComp
				size="large"
				icon="Calendar2"
				style={{
					background: CALENDARS_STANDARD_COLORS?.[calendar?.color ?? 0]?.color
				}}
				label=""
			/>

			<Row
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="fit"
				padding={{ left: 'large' }}
				takeAvailableSpace
			>
				<Container mainAlignment="space-between" orientation="horizontal">
					<Text overflow="ellipsis" weight="bold" size="small">
						{title || t('label.subject', 'Subject')}
					</Text>
					<Icon icon="Calendar2" color={CALENDARS_STANDARD_COLORS?.[calendar?.color ?? 0]?.color} />
				</Container>
				<TitleRow>
					<>
						<Text overflow="ellipsis" color="secondary" weight="bold" size="small">
							{originalDate}
						</Text>
						{originalDate !== convertedDate && (
							<Tooltip label={convertedDateTooltip}>
								<Padding left="small">
									<Icon icon="GlobeOutline" color="gray1" />
								</Padding>
							</Tooltip>
						)}
					</>
				</TitleRow>
				<TitleRow>
					<Text overflow="ellipsis" color="secondary" size="small">
						{location}
					</Text>
				</TitleRow>
				<TitleRow>
					<Text overflow="ellipsis" color="secondary" size="small">
						{meetingRoomField}
					</Text>
				</TitleRow>
				{equipmentsField && (
					<TitleRow>
						<Text overflow="ellipsis" color="secondary" size="small">
							{equipmentsField}
						</Text>
					</TitleRow>
				)}
				{virtualRoom && (
					<TitleRow>
						<Text overflow="ellipsis" color="secondary" size="small">
							{virtualRoom}
						</Text>
					</TitleRow>
				)}
			</Row>
		</Row>
	);
};
