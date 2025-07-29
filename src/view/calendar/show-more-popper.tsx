/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { RefObject, useMemo } from 'react';

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
