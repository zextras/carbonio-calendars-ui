/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';

import { Icon, Padding, Row, Text } from '@zextras/carbonio-design-system';
import { filter, map } from 'lodash';

import { CALENDAR_RESOURCES } from '../../constants';
import { Invite } from '../../types/store/invite';

export const EquipmentsRow = ({
	invite,
	showIcon
}: {
	invite: Invite;
	showIcon?: boolean;
}): ReactElement | null => {
	const equipments = useMemo(
		() => filter(invite.attendees, ['cutype', CALENDAR_RESOURCES.RESOURCE]),
		[invite.attendees]
	);
	const equipmentsLabels = useMemo(
		() => map(equipments, (equipment) => equipment.d).join(', '),
		[equipments]
	);
	return equipments.length ? (
		<Row width="fill" mainAlignment="flex-start" padding={{ top: 'small' }}>
			<Row takeAvailableSpace mainAlignment="flex-start">
				{showIcon && (
					<Padding right="small">
						<Icon icon="BriefcaseOutline" size="medium" />
					</Padding>
				)}
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text color="gray1" size="small">
						{equipmentsLabels}
					</Text>
				</Row>
			</Row>
		</Row>
	) : null;
};
