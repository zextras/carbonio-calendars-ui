/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Avatar, Container, Icon, Row, Text } from '@zextras/carbonio-design-system';
import moment from 'moment';
import React, { ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ZIMBRA_STANDARD_COLORS } from '../../../commons/zimbra-standard-colors';
import { useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorAllDay,
	selectEditorCalendar,
	selectEditorEnd,
	selectEditorLocation,
	selectEditorRoom,
	selectEditorStart,
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
	<Container mainAlignment="flex-start" crossAlignment="flex-start" padding={{ top: 'extrasmall' }}>
		{children}
	</Container>
);

export const EditorSummary = ({ editorId }: { editorId: string }): ReactElement => {
	const [t] = useTranslation();
	const start = useAppSelector(selectEditorStart(editorId));
	const end = useAppSelector(selectEditorEnd(editorId));
	const location = useAppSelector(selectEditorLocation(editorId));
	const room = useAppSelector(selectEditorRoom(editorId));
	const title = useAppSelector(selectEditorTitle(editorId));
	const calendar = useAppSelector(selectEditorCalendar(editorId));
	const allDay = useAppSelector(selectEditorAllDay(editorId));

	const apptDateTime = useMemo(() => {
		const diff = moment(end).diff(moment(start), 'days');
		const allDayString =
			allDay && diff > 0
				? `${moment(start).format(`dddd, DD MMMM, YYYY`)} -
	           ${moment(end).format(`dddd, DD MMMM, YYYY`)} - ${t('label.all_day', 'All day')}`
				: `${moment(start).format(`dddd, DD MMMM, YYYY`)} - ${t('label.all_day', 'All day')}`;

		return allDay
			? allDayString
			: `${moment(start).format(`dddd, DD MMMM, YYYY HH:mm`)} -
	           ${moment(end).format(' HH:mm')}`;
	}, [end, start, allDay, t]);

	const apptLocation = useMemo(
		() => `GMT ${moment(start).tz(moment.tz.guess()).format('Z')} ${moment.tz.guess()}`,
		[start]
	);

	const virtualRoom = useMemo(() => room?.label, [room?.label]);
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
					background: calendar?.color?.color ?? ZIMBRA_STANDARD_COLORS?.[0]?.color
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
					<Icon
						icon="Calendar2"
						customColor={calendar?.color?.color ?? ZIMBRA_STANDARD_COLORS?.[0]?.color}
					/>
				</Container>
				<TitleRow>
					<Text overflow="ellipsis" color="secondary" weight="bold" size="small">
						{apptDateTime}
					</Text>
				</TitleRow>
				<TitleRow>
					<Text overflow="ellipsis" color="secondary" weight="bold" size="small">
						{apptLocation}
					</Text>
				</TitleRow>
				<TitleRow>
					<Text overflow="ellipsis" color="secondary" size="small">
						{location}
					</Text>
				</TitleRow>
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
