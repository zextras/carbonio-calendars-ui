/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';

import { getColor, Icon, Padding, Row, Text, useTheme } from '@zextras/carbonio-design-system';
import { useFolder } from '@zextras/carbonio-ui-commons';

import { getCalendarOwnerEmail, getFolderIcon } from '../../commons/utilities';
import { setCalendarColor } from '../../normalizations/normalizations-utils';
import { EventType } from '../../types/event';

export type CalendarInfoRowProps = {
	event: EventType;
};

export const CalendarInfoRow = ({ event }: CalendarInfoRowProps): ReactElement => {
	const calendar = useFolder(event.resource.calendar.id);
	const color = setCalendarColor({ color: calendar?.color, rgb: calendar?.rgb });
	const icon = useMemo(
		(): string => (calendar ? getFolderIcon({ item: calendar, checked: true }) : 'Calendar2'),
		[calendar]
	);
	const theme = useTheme();
	const ownerLabelColor = useMemo(() => getColor('gray1.active', theme), [theme]);
	const ownerLabel = useMemo((): string | null => {
		const ownerEmail = calendar && getCalendarOwnerEmail(calendar);
		return ownerEmail ? `(${ownerEmail})` : null;
	}, [calendar]);

	return (
		<>
			{calendar && (
				<Row width="fill" mainAlignment="flex-start" padding={{ top: 'small' }}>
					<Row takeAvailableSpace mainAlignment="flex-start">
						<Padding right="small">
							<Icon icon={icon} size="medium" color={color.color} />
						</Padding>
						<Text overflow="break-word" size="medium" weight="bold" style={{ flexShrink: 0 }}>
							{calendar?.name}
						</Text>
						{ownerLabel && (
							<>
								<Padding left="extrasmall" />
								<Text overflow="break-word" size="small" style={{ color: ownerLabelColor }}>
									{ownerLabel}
								</Text>
							</>
						)}
					</Row>
				</Row>
			)}
		</>
	);
};
