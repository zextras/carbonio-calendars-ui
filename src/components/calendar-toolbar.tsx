/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Button, Container, Padding, Tooltip } from '@zextras/carbonio-design-system';

export const CalendarToolbar = ({
	dateLabel,
	resetButtonLabel,
	rightArrowLabel,
	leftArrowLabel,
	onResetAction,
	onRightArrowAction,
	onLeftArrowAction
}: {
	dateLabel: string;
	resetButtonLabel: string;
	rightArrowLabel: string;
	leftArrowLabel: string;
	onResetAction: () => void;
	onRightArrowAction: () => void;
	onLeftArrowAction: () => void;
}): React.JSX.Element => (
	<>
		<Button
			label={resetButtonLabel}
			type="outlined"
			onClick={onResetAction}
			minWidth={'fit-content'}
		/>
		<Padding left={'1rem'} />
		<Tooltip label={leftArrowLabel}>
			<Button
				type={'ghost'}
				icon="ChevronLeft"
				onClick={onLeftArrowAction}
				minWidth={'max-content'}
			/>
		</Tooltip>
		<Padding horizontal={'.25rem'} />
		<Tooltip label={rightArrowLabel}>
			<Button
				type={'ghost'}
				icon="ChevronRight"
				onClick={onRightArrowAction}
				minWidth={'max-content'}
			/>
		</Tooltip>
		<Container
			orientation="horizontal"
			mainAlignment="flex-start"
			style={{ minWidth: 0, flexBasis: 'content', flexGrow: 1 }}
		>
			<Padding left={'1rem'} />
			<Button
				type="ghost"
				label={dateLabel}
				onClick={(): null => null}
				data-testid="CurrentDateContainer"
			/>
		</Container>
	</>
);
