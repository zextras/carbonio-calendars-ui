/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import { Avatar, Container } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

import { CalendarsColorType } from '../../types/store/calendars';

const IconContainer = styled(Avatar)`
	width: 3rem;
	height: 3rem;
`;

export const ImageAndIconPart = ({
	icon = 'CalendarOutline',
	color
}: {
	icon?: string;
	color: CalendarsColorType;
}): ReactElement => (
	<Container>
		<IconContainer icon={icon} label="" background={color.color} />
	</Container>
);
