/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useRef, useState } from 'react';

import { Button, Tooltip } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { ShowMorePopover } from './show-more-popover';
import { EventType } from '../../types/event';

export const CustomShowMoreButton = ({
	remainingEvents,
	slotDate,
	events
}: {
	remainingEvents: Array<EventType>;
	slotDate: Date;
	events: Array<EventType>;
}): React.JSX.Element => {
	const [t] = useTranslation();
	const anchorRef = useRef<HTMLButtonElement | null>(null);
	const [open, setOpen] = useState(false);

	const onClick = useCallback(() => {
		setOpen((value) => !value);
	}, []);

	const onClose = useCallback(() => {
		setOpen(false);
	}, []);

	const tooltipLabel = t('label.show_all_events', 'Show all events');
	const buttonLabel = t('label.show_more', '+ {{count}} more', {
		count: remainingEvents.length
	});

	return (
		<>
			<Tooltip label={tooltipLabel} placement="top">
				<Button
					className={'rbc-show-more'}
					type="ghost"
					label={buttonLabel}
					color="primary"
					size={'small'}
					onClick={onClick}
					buttonRef={anchorRef}
				/>
			</Tooltip>
			{open && (
				<ShowMorePopover
					open={open}
					onClose={onClose}
					date={slotDate}
					events={events}
					anchorRef={anchorRef}
				/>
			)}
		</>
	);
};
