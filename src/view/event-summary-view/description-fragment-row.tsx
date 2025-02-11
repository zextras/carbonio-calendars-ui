/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import { Icon, Row, Text, Theme } from '@zextras/carbonio-design-system';

import { Invite } from '../../types/store/invite';

export const DescriptionFragmentRow = ({
	invite,
	calendarOwner,
	fontSize = 'medium'
}: {
	invite: Invite;
	calendarOwner?: string;
	fontSize?: keyof typeof Theme.sizes.font;
}): ReactElement => (
	<>
		{invite.class === 'PRI' && !invite.isOrganizer && !calendarOwner ? null : (
			<>
				{invite.fragment && invite.fragment.length > 0 && (
					<Row
						width="fill"
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						padding={{ vertical: 'small' }}
					>
						<Row padding={{ right: 'small' }}>
							<Icon icon="MessageSquareOutline" />
						</Row>
						<Row takeAvailableSpace mainAlignment="flex-start">
							<Text overflow="break-word" size={fontSize}>
								{invite.fragment}
							</Text>
						</Row>
					</Row>
				)}
			</>
		)}
	</>
);
