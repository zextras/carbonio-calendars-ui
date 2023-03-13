/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Avatar, Container, Icon, Row, Text } from '@zextras/carbonio-design-system';
import moment from 'moment';
import React, { ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { ZIMBRA_STANDARD_COLORS } from '../../../commons/zimbra-standard-colors';
import {
	selectEditorAllDay,
	selectEditorCalendar,
	selectEditorEnd,
	selectEditorLocation,
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
	<Container mainAlignment="flex-start" crossAlignment="flex-start" padding={{ top: 'extrasmall' }}>
		{children}
	</Container>
);

export const EditorSummary = ({ editorId }: { editorId: string }): ReactElement => {
	const [t] = useTranslation();
	const start = useSelector(selectEditorStart(editorId));
	const end = useSelector(selectEditorEnd(editorId));
	const location = useSelector(selectEditorLocation(editorId));
	const room = useSelector(selectEditorRoom(editorId));
	const title = useSelector(selectEditorTitle(editorId));
	const calendar = useSelector(selectEditorCalendar(editorId));
	const allDay = useSelector(selectEditorAllDay(editorId));
	const timezone = useSelector(selectEditorTimezone(editorId));

	const apptDateTime = useMemo(() => {
		if (timezone) {
			const diff = moment(end).diff(moment(start), 'days');
			const allDayString =
				allDay && diff > 0
					? `${moment(start).tz(timezone).format(`dddd, DD MMMM, YYYY`)} -
	           ${moment(end).tz(timezone).format(`dddd, DD MMMM, YYYY`)} - ${t(
							'label.all_day',
							'All day'
					  )}`
					: `${moment(start).tz(timezone).format(`dddd, DD MMMM, YYYY`)} - ${t(
							'label.all_day',
							'All day'
					  )}`;

			return allDay
				? allDayString
				: `${moment(start).tz(timezone).format(`dddd, DD MMMM, YYYY HH:mm`)} -
	           ${moment(end).tz(timezone).format(' HH:mm')}`;
		}
		return undefined;
	}, [timezone, end, start, allDay, t]);

	const apptLocation = useMemo(
		() => (timezone ? `GMT ${moment(start).tz(timezone).format('Z')} ${timezone}` : undefined),
		[start, timezone]
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
