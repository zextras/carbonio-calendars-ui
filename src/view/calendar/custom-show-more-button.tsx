/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { RefObject, useCallback, useMemo, useRef, useState } from 'react';

import {
	Button,
	Container,
	Divider,
	Padding,
	Popover,
	Row,
	Text,
	Tooltip
} from '@zextras/carbonio-design-system';
import { useUserSettings } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { MemoCustomEvent } from './custom-event';
import { EventType } from '../../types/event';

export const ShowMorePopover = ({
	anchorRef,
	onClose,
	open,
	date,
	events
}: {
	onClose: () => void;
	open: boolean;
	date: Date;
	events: EventType[];
	anchorRef: RefObject<HTMLElement>;
}): React.JSX.Element => {
	const userSetting = useUserSettings().prefs.zimbraPrefLocale;
	const locale = useMemo(() => userSetting ?? navigator.language, [userSetting]);
	return (
		<Popover anchorEl={anchorRef} open={open} styleAsModal placement="left" onClose={onClose}>
			<Container
				width="25rem"
				style={{ zIndex: 3, maxHeight: '35vh', height: '35vh', padding: '0.5rem' }}
			>
				<Row width={'fill'} mainAlignment={'space-between'}>
					<Text weight={'bold'} size={'medium'}>
						{new Intl.DateTimeFormat(locale, {
							weekday: 'short',
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						}).format(date)}
					</Text>
					<Tooltip label={'Close'}>
						<Button icon="Close" size="large" type={'ghost'} color={'text'} onClick={onClose} />
					</Tooltip>
				</Row>
				<Divider />
				<Container style={{ padding: '1rem 0', overflowY: 'hidden' }}>
					<Container
						style={{ maxHeight: '100%', overflowY: 'auto', paddingRight: '1rem' }}
						mainAlignment={'flex-start'}
					>
						{events.map((event, index) => (
							<>
								<MemoCustomEvent event={event} title={event.title} />
								{index !== events.length - 1 && <Padding top={'0.5rem'} />}
							</>
						))}
					</Container>
				</Container>
			</Container>
		</Popover>
	);
};

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
				<Padding all={'0 .5rem .5rem .5rem'}>
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
