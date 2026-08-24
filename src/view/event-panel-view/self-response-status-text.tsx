/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import { Row, Text } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import { PARTICIPATION_STATUS } from '../../constants/api';
import { ParticipationStatus } from '../../types/store/invite';

/**
 * Attendees can't see other participants' response status (CO-4136), since replies are
 * only ever delivered to the organizer. They must still be able to see their own, so this
 * renders a self-status line regardless of the viewer's permissions.
 */
export const SelfResponseStatusText = ({
	participationStatus
}: {
	participationStatus?: ParticipationStatus;
}): ReactElement => {
	const labelsByStatus: Partial<Record<ParticipationStatus, string>> = {
		[PARTICIPATION_STATUS.ACCEPTED]: t('message.you_accepted', 'You accepted'),
		[PARTICIPATION_STATUS.DECLINED]: t('message.you_declined', 'You declined'),
		[PARTICIPATION_STATUS.TENTATIVE]: t(
			'message.you_accepted_as_tentative',
			'You accepted as tentative'
		),
		[PARTICIPATION_STATUS.NEED_ACTION]: t('message.you_did_not_answer', "You didn't answer")
	};
	const label =
		(participationStatus && labelsByStatus[participationStatus]) ||
		labelsByStatus[PARTICIPATION_STATUS.NEED_ACTION];

	return (
		<Row
			data-testid="SelfResponseStatusText"
			mainAlignment="flex-start"
			width="fill"
			padding={{ top: 'small', bottom: 'extrasmall' }}
		>
			<Text size="small" color="secondary">
				{label}
			</Text>
		</Row>
	);
};
