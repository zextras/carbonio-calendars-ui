/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { find } from 'lodash';
import { Icon, Padding, Row, Text } from '@zextras/carbonio-design-system';
import React, { useMemo } from 'react';
import { CRB_XPROPS, CRB_XPARAMS } from '../../constants/xprops';

export const VirtualRoomRow = ({ xprop, showIcon }) => {
	const room = useMemo(() => find(xprop, ['name', CRB_XPROPS.MEETING_ROOM]), [xprop]);
	if (room) {
		const roomName = find(room.xparam, ['name', CRB_XPARAMS.ROOM_NAME])?.value;
		const roomLink = find(room.xparam, ['name', CRB_XPARAMS.ROOM_LINK])?.value;
		return (
			<Row width="fill" mainAlignment="flex-start" padding={{ top: 'small' }}>
				<Row takeAvailableSpace mainAlignment="flex-start">
					{showIcon && (
						<Padding right="small">
							<Icon icon="TeamOutline" size="medium" />
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
			</Row>
		);
	}
	return null;
};
