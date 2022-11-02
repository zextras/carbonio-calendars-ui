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
	selectEditorCalendar,
	selectEditorEnd,
	selectEditorLocation,
	selectEditorRoom,
	selectEditorStart,
	selectEditorTitle
} from '../../../store/selectors/editor';

export const AvatarComp = styled(Avatar)`
	svg {
		width: 24px;
		min-width: 24px;
		height: 24px;
		min-height: 24px;
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

	const apptDateTime = useMemo(
		() => `${moment(start).format(`dddd, DD MMMM, YYYY HH:mm`)} -
	           ${moment(end).format(' HH:mm')}`,
		[start, end]
	);

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
