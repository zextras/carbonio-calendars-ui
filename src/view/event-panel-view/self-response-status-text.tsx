/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import { Container, Icon, Padding, Text } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import { PARTICIPATION_STATUS } from '../../constants/api';
import { ParticipationStatus } from '../../types/store/invite';

type StatusMeta = { icon: string; color: string; label: string };

const getStatusMeta = (participationStatus: ParticipationStatus | undefined): StatusMeta => {
	switch (participationStatus) {
		case PARTICIPATION_STATUS.ACCEPTED:
			return {
				icon: 'StatusAccept',
				color: 'success',
				label: t('message.you_accepted', 'You accepted')
			};
		case PARTICIPATION_STATUS.DECLINED:
			return {
				icon: 'StatusDenied',
				color: 'error',
				label: t('message.you_declined', 'You declined')
			};
		case PARTICIPATION_STATUS.TENTATIVE:
			return {
				icon: 'StatusMaybe',
				color: 'warning',
				label: t('message.you_accepted_as_tentative', 'You accepted as tentative')
			};
		default:
			return {
				icon: 'CalendarWarning',
				color: 'primary',
				label: t('message.you_did_not_answer', "You didn't answer")
			};
	}
};

/**
 * Tells the attendee their own response status, above the reply buttons (Figma spec,
 * CO-4136 follow-up) - replies are only ever delivered to the organizer, so this is the
 * one place a non-editor attendee can reliably see (and manage, via the buttons below)
 * their own status.
 */
export const SelfResponseStatusText = ({
	participationStatus
}: {
	participationStatus?: ParticipationStatus;
}): ReactElement => {
	const meta = getStatusMeta(participationStatus);

	return (
		<Container
			data-testid="SelfResponseStatusText"
			orientation="horizontal"
			crossAlignment="center"
			mainAlignment="flex-start"
			width="fill"
			height="fit"
			padding={{ horizontal: 'large', top: 'small' }}
		>
			<Padding right="small">
				<Icon icon={meta.icon} color={meta.color} size="large" />
			</Padding>
			<Text color={meta.color} weight="bold" size="small">
				{meta.label}
			</Text>
		</Container>
	);
};
