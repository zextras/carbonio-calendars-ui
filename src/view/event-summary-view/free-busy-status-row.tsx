/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Container, Padding, Row, Text, Theme } from '@zextras/carbonio-design-system';
import { useUserAccount } from '@zextras/carbonio-shell-ui';
import { toLower } from 'lodash';
import { Trans, useTranslation } from 'react-i18next';

import { EventType } from '../../types/event';
import { Invite } from '../../types/store/invite';

export const FreeBusyStatusRowComponent = ({
	event,
	invite,
	fontSize = 'small'
}: {
	event: EventType;
	invite: Invite;
	fontSize?: keyof typeof Theme.sizes.font;
}): React.JSX.Element => {
	const account = useUserAccount();
	const [t] = useTranslation();
	const whoSetThis = useMemo(
		() =>
			invite?.organizer?.a === account.name
				? t('message.you', 'You')
				: t('message.the_organizer', 'The organizer'),
		[account.name, invite?.organizer?.a, t]
	);

	const status = useMemo(() => {
		if (event.resource.freeBusy === 'F') {
			return toLower(t('label.free', 'Free'));
		}
		if (event.resource.freeBusy === 'T') {
			return toLower(t('label.tentative', 'Tentative'));
		}
		if (event.resource.freeBusy === 'O') {
			return toLower(t('label.out_of_office', 'Out of office'));
		}
		return toLower(t('label.busy', 'Busy'));
	}, [event.resource.freeBusy, t]);

	return (
		<Trans
			i18nKey="message.the_organizer_set_this"
			defaults="<Row><Text>{{whoSetThis}} set this appointment as <strong>{{status}}</strong></Text></Row>"
			components={{
				Row: <Row />,
				Text: <Text color="secondary" size={fontSize} />
			}}
			values={{ whoSetThis, status }}
		/>
	);
};

export const FreeBusyStatusRow = ({
	event,
	invite,
	isSummary,
	fontSize = 'small'
}: {
	event: EventType;
	invite: Invite;
	isSummary?: boolean;
	fontSize?: keyof typeof Theme.sizes.font;
}): React.JSX.Element => {
	const padding = isSummary ? '1.5rem' : '1rem';

	return (
		<Container
			orientation="vertical"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			width="fill"
			height="fit"
			padding={{ top: 'small' }}
		>
			<Container
				orientation="vertical"
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				width="fill"
				height="fit"
				padding={isSummary ? { vertical: 'small' } : { horizontal: 'large', vertical: 'medium' }}
				background={'gray6'}
			>
				<Row mainAlignment="flex-start" crossAlignment="center" width="fill">
					<Padding left={padding} />
					<FreeBusyStatusRowComponent invite={invite} fontSize={fontSize} event={event} />
				</Row>
			</Container>
		</Container>
	);
};
