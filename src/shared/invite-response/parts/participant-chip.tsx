/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement } from 'react';

import { Chip, Tooltip, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

type ParticipantChipProps = {
	participant: {
		a?: string;
		d?: string;
	};
	isOrganizer?: boolean;
	onEmailClick?: () => void;
};

const ParticipantChip: FC<ParticipantChipProps> = ({
	participant,
	isOrganizer = false,
	onEmailClick
}): ReactElement => {
	const [t] = useTranslation();
	const organizerLabel = t('message.organizer', 'Organizer');
	const emailLabel = t('message.send_email', 'Send email');
	const displayName = participant.d ?? participant.a;
	const email = participant.a;

	const chipLabel = isOrganizer ? (
		<>
			<Text size="small">{displayName}</Text>&nbsp;
			<Text size="small" color="secondary">
				({organizerLabel})
			</Text>
		</>
	) : (
		displayName
	);

	const actions = onEmailClick
		? [
				{
					id: 'email-action',
					label: emailLabel,
					type: 'button' as const,
					icon: 'EmailOutline',
					onClick: onEmailClick
				}
			]
		: undefined;

	return (
		<Tooltip placement="top" label={email ?? displayName ?? ''} maxWidth="100%">
			<div>
				<Chip
					avatarLabel={displayName}
					label={chipLabel}
					background={isOrganizer ? 'gray3' : undefined}
					color={isOrganizer ? 'secondary' : undefined}
					actions={actions}
				/>
			</div>
		</Tooltip>
	);
};

export default ParticipantChip;
