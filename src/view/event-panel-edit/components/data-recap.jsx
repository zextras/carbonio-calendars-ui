/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';
import { Row, Avatar, Text, Container, Icon } from '@zextras/zapp-ui';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ZIMBRA_STANDARD_COLORS } from '../../../commons/zimbra-standard-colors';

export const AvatarComp = styled(Avatar)`
	svg {
		width: 24px;
		min-width: 24px;
		height: 24px;
		min-height: 24px;
	}
`;

const TitleRow = ({ children }) => (
	<Container mainAlignment="flex-start" crossAlignment="flex-start" padding={{ top: 'extrasmall' }}>
		{children}
	</Container>
);
export default function DataRecap({ data }) {
	const [t] = useTranslation();

	const apptDateTime = useMemo(
		() => `${moment(data.start).format(`dddd, DD MMMM, YYYY HH:mm`)} -
	           ${moment(data.end).format(' HH:mm')}`,
		[data.start, data.end]
	);
	const apptLocation = useMemo(
		() => `GMT ${moment(data.start).tz(moment.tz.guess()).format('Z')} ${moment.tz.guess()}`,
		[data.start]
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
					background: data.resource.calendar.color
						? data.resource.calendar.color?.color
						: ZIMBRA_STANDARD_COLORS[0].color
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
						{data.title || t('message.you_will_see_the_subject_here', 'Subject')}
					</Text>
					<Icon
						icon="Calendar2"
						customColor={
							data.resource.calendar.color
								? data.resource.calendar.color.color
								: ZIMBRA_STANDARD_COLORS[0].color
						}
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
						{data?.resource?.location || t('label.location', 'location')}
					</Text>
				</TitleRow>
			</Row>
		</Row>
	);
}
