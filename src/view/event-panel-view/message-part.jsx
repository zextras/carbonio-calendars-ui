/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Icon } from '@zextras/zapp-ui';
import React from 'react';
import BodyMessageRenderer from '../../commons/body-message-renderer';

export default function MessagePart({ fullInvite, inviteId, parts }) {
	return (
		<Container
			orientation="horizontal"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			width="fill"
			height="fit"
			padding={{ all: 'large' }}
			background="gray6"
		>
			<Icon icon="MessageSquareOutline" />
			<Container
				orientation="vertical"
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				width="fill"
				height="fit"
				padding={{ left: 'small' }}
			>
				<BodyMessageRenderer fullInvite={fullInvite} inviteId={inviteId} parts={parts} />
			</Container>
		</Container>
	);
}
