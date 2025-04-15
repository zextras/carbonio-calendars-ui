/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { useTranslation } from 'react-i18next';

import { CustomEventIcon } from './custom-event-icon';
import { PARTICIPATION_STATUS } from '../../constants/api';
import { ParticipationStatus } from '../../types/store/invite';

export const CustomEventReplyIcons = ({
	iAmAttendee,
	participationStatus
}: {
	iAmAttendee: boolean;
	participationStatus: ParticipationStatus;
}): React.JSX.Element | null => {
	const [t] = useTranslation();

	if (!iAmAttendee) {
		return null;
	}
	return (
		<>
			{participationStatus === PARTICIPATION_STATUS.NEED_ACTION && (
				<CustomEventIcon
					iconColor={'primary'}
					iconName={'CalendarWarning'}
					isIconVisible={participationStatus === PARTICIPATION_STATUS.NEED_ACTION}
					tooltipLabel={t('message.you_did_not_answer', "You didn't answer")}
				/>
			)}
			{participationStatus === PARTICIPATION_STATUS.ACCEPTED && (
				<CustomEventIcon
					iconColor={'success'}
					iconName={'StatusAccept'}
					isIconVisible={participationStatus === PARTICIPATION_STATUS.ACCEPTED}
					tooltipLabel={t('message.you_accepted', 'You accepted')}
				/>
			)}
			{participationStatus === PARTICIPATION_STATUS.DECLINED && (
				<CustomEventIcon
					iconColor={'error'}
					iconName={'StatusDenied'}
					isIconVisible={participationStatus === PARTICIPATION_STATUS.DECLINED}
					tooltipLabel={t('message.you_declined', 'You declined')}
				/>
			)}
			{participationStatus === PARTICIPATION_STATUS.TENTATIVE && (
				<CustomEventIcon
					iconColor={'warning'}
					iconName={'StatusMaybe'}
					isIconVisible={participationStatus === PARTICIPATION_STATUS.TENTATIVE}
					tooltipLabel={t('message.you_accepted_as_tentative', 'You accepted as tentative')}
				/>
			)}
		</>
	);
};
