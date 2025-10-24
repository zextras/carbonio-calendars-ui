/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { Button, Container, Row, Tooltip, Text } from '@zextras/carbonio-design-system';
import { ZIMBRA_STANDARD_COLORS } from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';

import { Square } from '../../../commons/styled-components';
import { GroupCalendar } from '../../../types/groups';

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
		const colorIndex = calendar.color ? Number(calendar.color) : 0;
		return ZIMBRA_STANDARD_COLORS[colorIndex].hex;
	}, [calendar.color]);

	const buttonLabel = t('label.remove', 'remove');

	const onButtonClick = useCallback(() => {
		onRemove(calendar.id);
	}, [calendar.id, onRemove]);

	return (
		<Container
			data-testid="group-calendars-list-item"
			orientation="horizontal"
			gap="0.5rem"
			padding={{ right: '0.5rem' }}
		>
			<Row width="fit">
				<Square data-testid="colored-square" $color={color} />
			</Row>
			<Row takeAvailableSpace mainAlignment="flex-start" padding={{ bottom: '0.2rem' }}>
				<Tooltip overflowTooltip label={calendar.name}>
					<Text>{calendar.name}</Text>
				</Tooltip>
			</Row>
			<Row width="fit">
				<Button
					type="outlined"
					color="error"
					size="medium"
					label={buttonLabel}
					onClick={onButtonClick}
					icon="TrashOutline"
				/>
			</Row>
		</Container>
	);
};
