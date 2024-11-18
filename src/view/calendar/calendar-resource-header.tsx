/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Row, Text } from '@zextras/carbonio-design-system';

import { setCalendarColor } from '../../normalizations/normalizations-utils';

export type CalendarResourceHeaderProps = {
	id: string;
	label: string;
	resource: {
		color: number;
	};
};

export const CalendarResourceHeader = (props: CalendarResourceHeaderProps): React.JSX.Element => {
	const backgroundColor = setCalendarColor({
		color: props.resource.color
	});
	return (
		<Row
			key={props.id}
			background={backgroundColor.background}
			borderColor={backgroundColor.color}
			height="2.25rem"
			padding={'small'}
		>
			<Text weight={'bold'}>{props.label}</Text>
		</Row>
	);
};
