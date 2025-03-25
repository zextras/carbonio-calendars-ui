/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import { Container, Icon } from '@zextras/carbonio-design-system';

import BodyMessageRenderer from '../../commons/body-message-renderer';
import { Invite } from '../../types/store/invite';

type MessageProps = {
	fullInvite: Invite;
	inviteId: string;
	parts: any;
};

export const MessagePart = ({ fullInvite, inviteId, parts }: MessageProps): ReactElement => (
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
