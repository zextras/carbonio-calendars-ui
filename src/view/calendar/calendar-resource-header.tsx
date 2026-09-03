/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useEffect, useMemo, useRef } from 'react';

import { getColor, Row, Text, Tooltip, useTheme } from '@zextras/carbonio-design-system';
import type { ResourceHeaderProps } from 'react-big-calendar';

import { setCalendarColor } from '../../normalizations/normalizations-utils';

export type CalendarResource = {
	id: string;
	title: string;
	color: number | undefined;
	owner?: string;
};

export const CalendarResourceHeader = (
	props: ResourceHeaderProps<CalendarResource>
): React.JSX.Element => {
	const backgroundColor = setCalendarColor({
		color: props.resource.color
	});
	const rowRef = useRef<HTMLDivElement>(null);
	const theme = useTheme();
	const ownerLabelColor = useMemo(() => getColor('gray1.active', theme), [theme]);
	const tooltipLabel = props.resource.owner
		? `${props.resource.title} (${props.resource.owner})`
		: props.resource.title;

	// react-big-calendar's all-day row (BackgroundCells) never forwards the
	// resourceId to dayPropGetter, so it can't be themed from there. This is
	// the only per-resource DOM node rendered as a sibling of that all-day row
	// under the same `.rbc-time-header-content` column wrapper, so it's used
	// to set the CSS vars `.rbc-slot-selection`/`.rbc-day-bg.rbc-selected-cell`
	// read, keeping the all-day drag-selection preview colored like this column.
	useEffect(() => {
		const columnContent = rowRef.current?.closest<HTMLElement>('.rbc-time-header-content');
		columnContent?.style.setProperty('--rbc-slot-selection-border', backgroundColor.color);
		columnContent?.style.setProperty('--rbc-slot-selection-background', backgroundColor.background);
	}, [backgroundColor.background, backgroundColor.color]);

	return (
		<Row
			ref={rowRef}
			key={props.resource.id}
			background={backgroundColor.background}
			borderColor={backgroundColor.color}
			height={props.resource.owner ? '2.75rem' : '2.25rem'}
			padding={'small'}
			mainAlignment="flex-start"
			wrap="nowrap"
			minWidth={0}
			flexGrow={1}
			flexBasis="0"
		>
			<Tooltip label={tooltipLabel}>
				<Row
					orientation="vertical"
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					wrap="nowrap"
					minWidth={0}
					flexGrow={1}
					flexBasis="0"
				>
					<Text weight={'bold'} size="small" style={{ minWidth: 0, width: '100%' }}>
						{props.resource.title}
					</Text>
					{props.resource.owner && (
						<Text size="extrasmall" style={{ minWidth: 0, width: '100%', color: ownerLabelColor }}>
							{`(${props.resource.owner})`}
						</Text>
					)}
				</Row>
			</Tooltip>
		</Row>
	);
};
