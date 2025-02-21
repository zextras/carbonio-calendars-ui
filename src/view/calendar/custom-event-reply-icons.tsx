/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Dispatch, SetStateAction } from 'react';

import { CustomEventIcon } from './custom-event-icon';
import { PARTICIPATION_STATUS } from '../../constants/api';
import { ParticipationStatus } from '../../types/store/invite';

export const CustomEventReplyIcons = ({
	setIsOuterTooltipDisabled,
	iAmAttendee,
	participationStatus
}: {
	iAmAttendee: boolean;
	setIsOuterTooltipDisabled: Dispatch<SetStateAction<boolean>>;
	participationStatus: ParticipationStatus;
}): React.JSX.Element | null =>
	iAmAttendee ? (
		<>
			{participationStatus === PARTICIPATION_STATUS.NEED_ACTION && (
				<CustomEventIcon
					iconColor={'primary'}
					iconName={'AlertCircleOutline'}
					isIconVisible={participationStatus === PARTICIPATION_STATUS.NEED_ACTION}
					tooltipLabel={"You didn't answer"}
					disableOuterTooltip={setIsOuterTooltipDisabled}
				/>
			)}
			{participationStatus === PARTICIPATION_STATUS.ACCEPTED && (
				<CustomEventIcon
					iconColor={'success'}
					iconName={'CheckmarkCircle2Outline'}
					isIconVisible={participationStatus === PARTICIPATION_STATUS.ACCEPTED}
					tooltipLabel={'You accepted'}
					disableOuterTooltip={setIsOuterTooltipDisabled}
				/>
			)}
			{participationStatus === PARTICIPATION_STATUS.DECLINED && (
				<CustomEventIcon
					iconColor={'error'}
					iconName={'CloseCircleOutline'}
					isIconVisible={participationStatus === PARTICIPATION_STATUS.DECLINED}
					tooltipLabel={'You declined'}
					disableOuterTooltip={setIsOuterTooltipDisabled}
				/>
			)}
			{participationStatus === PARTICIPATION_STATUS.TENTATIVE && (
				<CustomEventIcon
					iconColor={'warning'}
					iconName={'QuestionMarkCircleOutline'}
					isIconVisible={participationStatus === PARTICIPATION_STATUS.TENTATIVE}
					tooltipLabel={'You accepted as tentative'}
					disableOuterTooltip={setIsOuterTooltipDisabled}
				/>
			)}
		</>
	) : null;
