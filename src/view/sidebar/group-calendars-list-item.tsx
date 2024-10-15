/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container, Row, Text } from '@zextras/carbonio-design-system';

import { Square } from '../../commons/styled-components';
import { Calendar } from '../../types/store/calendars';

export type GroupCalendarsListItemProps = {
	calendar: Pick<Calendar, 'id' | 'name' | 'color'>;
	onRemove: (calendarId: string) => void;
};

export const GroupCalendarsListItem = ({
	calendar,
	onRemove
}: GroupCalendarsListItemProps): React.JSX.Element => {
	const color = useMemo<string>(() => {
		const colorIndex = calendar.color.color ? Number(calendar.color.color) : 0;
		return ZIMBRA_STANDARD_COLORS[colorIndex].hex;
	}, [calendar.color.color]);

	return (
		<Container>
			<Row>
				<Square data-testid="colored-square" color={color} />
			</Row>
			<Row>
				<Text>{calendar.name}</Text>
			</Row>
		</Container>
	);
};
