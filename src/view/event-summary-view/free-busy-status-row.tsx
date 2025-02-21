/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Container, Padding, Row, Text } from '@zextras/carbonio-design-system';
import { useUserAccount } from '@zextras/carbonio-shell-ui';
import { toLower } from 'lodash';
import { Trans, useTranslation } from 'react-i18next';

import { EVENT_DISPLAY_STATUS } from '../../constants/api';
import { InviteFreeBusy, InviteOrganizer } from '../../types/store/invite';

export const FreeBusyStatusRowComponent = ({
	freeBusy,
	organizerName
}: {
	freeBusy: InviteFreeBusy;
	organizerName: InviteOrganizer['a'];
}): React.JSX.Element => {
	const account = useUserAccount();
	const [t] = useTranslation();
	const whoSetThis = useMemo(
		() =>
			organizerName === account.name
				? t('message.you', 'You')
				: t('message.the_organizer', 'The organizer'),
		[account.name, organizerName, t]
	);

	const status = useMemo(() => {
		if (freeBusy === EVENT_DISPLAY_STATUS.FREE) {
			return toLower(t('label.free', 'Free'));
		}
		if (freeBusy === EVENT_DISPLAY_STATUS.TENTATIVE) {
			return toLower(t('label.tentative', 'Tentative'));
		}
		if (freeBusy === EVENT_DISPLAY_STATUS.OUT_OF_OFFICE) {
			return toLower(t('label.out_of_office', 'Out of office'));
		}
		return toLower(t('label.busy', 'Busy'));
	}, [freeBusy, t]);

	return (
		<Row>
			<Text color="secondary" size={'small'}>
				<Trans
					i18nKey="message.who_set_this"
					defaults="{{whoSetThis}} set this appointment as <strong>{{status}}</strong>"
					values={{ whoSetThis, status }}
				/>
			</Text>
		</Row>
	);
};

export const FreeBusyStatusRow = ({
	freeBusy,
	organizerName
}: {
	freeBusy: InviteFreeBusy;
	organizerName: InviteOrganizer['a'];
}): React.JSX.Element => (
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
			padding={{ vertical: 'small' }}
			background={'gray6'}
		>
			<Row mainAlignment="flex-start" crossAlignment="center" width="fill">
				<Padding left={'1.5rem'} />
				<FreeBusyStatusRowComponent organizerName={organizerName} freeBusy={freeBusy} />
			</Row>
		</Container>
	</Container>
);
