/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { Avatar, Container } from '@zextras/zapp-ui';
import styled from 'styled-components';

const OuterContainer = styled(Container)`
	height: 100%;
	background: linear-gradient(0.25turn, ${(props) => props.color}, #ffffff);
`;

const IconContainer = styled(Avatar)`
	background-color: ${(props) => props.backgroundColor};
	width: 48px;
	height: 48px;
`;

export default function ImageAndIconPart({ icon = 'CalendarOutline', color }) {
	return (
		<OuterContainer customColor={`${color}.regular`}>
			<IconContainer
				icon={icon}
				customColor={`${color}.regular`}
				label=""
				backgroundColor={color}
			/>
		</OuterContainer>
	);
}
