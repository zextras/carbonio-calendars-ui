/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useRef, useState } from 'react';

import { Button, Padding, Tooltip } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { ShowMorePopover } from './show-more-popper';
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
	const anchorRef = useRef<HTMLDivElement | null>(null);
	const [open, setOpen] = useState(false);

	const onClick = useCallback(() => {
		setOpen((value) => !value);
	}, []);

	const onClose = useCallback(() => {
		setOpen(false);
	}, []);

	return (
		<>
			<Tooltip label={'Show all events for this day'} placement="top">
				<Padding all={'.0625rem'}>
					<Button
						className={'rbc-show-more'}
						type="ghost"
						label={t('label.show_more', {
							count: remainingEvents.length,
							defaultValue_one: '+ {{count}} more',
							defaultValue: '+ {{count}} more'
						})}
						color="primary"
						size={'small'}
						onClick={onClick}
						ref={anchorRef}
					/>
				</Padding>
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
