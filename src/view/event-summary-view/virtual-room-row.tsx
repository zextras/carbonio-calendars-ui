/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';

import { Icon, Padding, Row, Text, Tooltip } from '@zextras/carbonio-design-system';
import { find } from 'lodash';
import { useTranslation } from 'react-i18next';

import { CRB_XPROPS, CRB_XPARAMS } from '../../constants/xprops';
import { XPropProps } from '../../types/store/invite';

export const VirtualRoomRow = ({
	xprop,
	showIcon = false
}: {
	xprop: XPropProps;
	showIcon?: boolean;
}): ReactElement | null => {
	const [t] = useTranslation();
	const tooltipLabel = t('appointment.virtualRoom.displayerLink', 'Join the virtual room');

	const room = useMemo(() => find(xprop, ['name', CRB_XPROPS.MEETING_ROOM]), [xprop]);

	if (room) {
		const roomName = find(room.xparam, ['name', CRB_XPARAMS.ROOM_NAME])?.value;
		const roomLink = find(room.xparam, ['name', CRB_XPARAMS.ROOM_LINK])?.value;
		return (
			<Row width="fill" mainAlignment="flex-start" padding={{ top: 'small' }}>
				<Tooltip label={tooltipLabel}>
					<Row mainAlignment="flex-start">
						{showIcon && (
							<Padding right="small">
								<Icon icon="VideoOutline" size="medium" />
							</Padding>
						)}
						<Row takeAvailableSpace mainAlignment="flex-start">
							<Text color="gray1" size="small">
								<a href={roomLink} target="_blank" rel="noreferrer">
									{roomName}
								</a>
							</Text>
						</Row>
					</Row>
				</Tooltip>
			</Row>
		);
	}
	return null;
};
