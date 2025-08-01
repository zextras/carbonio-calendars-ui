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
	const [t] = useTranslation();

	const title = useMemo(
		() =>
			new Intl.DateTimeFormat(locale, {
				weekday: 'short',
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			}).format(date),
		[date, locale]
	);

	return (
		<Popover anchorEl={anchorRef} open={open} styleAsModal placement="left" onClose={onClose}>
			<Container
				width="25rem"
				maxHeight="35vh"
				height="35vh"
				padding="0.5rem"
				style={{ zIndex: 3 }}
			>
				<Row width={'fill'} mainAlignment={'space-between'}>
					<Text weight={'bold'} size={'medium'}>
						{title}
					</Text>
					<Tooltip label={t('label.close', 'Close')}>
						<Button icon="Close" size="large" type={'ghost'} color={'text'} onClick={onClose} />
					</Tooltip>
				</Row>
				<Divider />
				<Container padding="1rem 0" style={{ overflowY: 'hidden' }}>
					<Container
						maxHeight="100%"
						padding={{ right: '1rem' }}
						style={{ overflowY: 'auto' }}
						mainAlignment={'flex-start'}
						gap={'0.5rem'}
					>
						{events.map((event) => (
							<MemoCustomEvent key={event.id} event={event} title={event.title} />
						))}
					</Container>
				</Container>
			</Container>
		</Popover>
	);
};
