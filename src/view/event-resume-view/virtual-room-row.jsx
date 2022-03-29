/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { find } from 'lodash';
import { Icon, Padding, Row, Text } from '@zextras/carbonio-design-system';
import React, { useMemo } from 'react';
import { METADATA_SECTIONS } from '../../constants/metadata';

export const VirtualRoomRow = ({ meta, showIcon }) => {
	const room = useMemo(() => find(meta, ['section', METADATA_SECTIONS.MEETING_ROOM]), [meta]);
	return room ? (
		<Row width="fill" mainAlignment="flex-start" padding={{ top: 'small' }}>
			<Row takeAvailableSpace mainAlignment="flex-start">
				{showIcon && (
					<Padding right="small">
						<Icon icon="TeamOutline" size="medium" />
					</Padding>
				)}
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text color="gray1" size="small">
						<a href={room?._attrs?.link} target="_blank" rel="noreferrer">
							{room?._attrs?.room}
						</a>
					</Text>
				</Row>
			</Row>
		</Row>
	) : null;
};
