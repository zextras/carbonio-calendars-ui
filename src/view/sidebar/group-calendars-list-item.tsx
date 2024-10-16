/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { Button, Container, Row, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { ZIMBRA_STANDARD_COLORS } from '../../carbonio-ui-commons/constants';
import { Square } from '../../commons/styled-components';
import { GroupCalendar } from '../../types/groups';

export type GroupCalendarsListItemProps = {
	calendar: GroupCalendar;
	onRemove: (calendarId: string) => void;
};

export const GroupCalendarsListItem = ({
	calendar,
	onRemove
}: GroupCalendarsListItemProps): React.JSX.Element => {
	const [t] = useTranslation();

	const color = useMemo<string>(() => {
		const colorIndex = calendar.color.color ? Number(calendar.color.color) : 0;
		return ZIMBRA_STANDARD_COLORS[colorIndex].hex;
	}, [calendar.color.color]);

	const buttonLabel = t('label.remove', 'remove');

	const onButtonClick = useCallback(() => {
		onRemove(calendar.id);
	}, [calendar.id, onRemove]);

	return (
		<Container>
			<Row width="fit">
				<Square data-testid="colored-square" color={color} />
			</Row>
			<Row takeAvailableSpace>
				<Text>{calendar.name}</Text>
			</Row>
			<Row width="fit">
				<Button label={buttonLabel} onClick={onButtonClick} />
			</Row>
		</Container>
	);
};
