/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { Avatar, Container } from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import { ZimbraColorType } from '../../commons/zimbra-standard-colors';

const OuterContainer = styled(Container)`
	height: 100%;
	background: linear-gradient(0.25turn, ${(props): string => props.color}, #ffffff);
`;

const IconContainer = styled(Avatar)`
	background-color: ${(props): string => props.backgroundColor};
	width: 48px;
	height: 48px;
`;

export const ImageAndIconPart = ({
	icon = 'CalendarOutline',
	color
}: {
	icon?: string;
	color: ZimbraColorType;
}): JSX.Element => (
	<OuterContainer customColor={`${color}.regular`}>
		<IconContainer icon={icon} customColor={`${color}.regular`} label="" backgroundColor={color} />
	</OuterContainer>
);
