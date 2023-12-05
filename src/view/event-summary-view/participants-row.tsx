/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import { Container } from '@zextras/carbonio-design-system';

import { EventType } from '../../types/event';
import { Invite } from '../../types/store/invite';
import { ParticipantsPart } from '../event-panel-view/participants-part';

export const ParticipantsRow = ({
	event,
	invite
}: {
	event: EventType;
	invite: Invite;
}): ReactElement => (
	<>
		{invite &&
		event?.resource?.class === 'PRI' &&
		event?.resource?.calendar?.owner &&
		!event?.resource?.iAmOrganizer ? null : (
			<Container
				orientation="vertical"
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				width="fill"
				height="fit"
				padding={{ top: 'small' }}
			>
				<ParticipantsPart
					invite={invite}
					event={event}
					organizer={invite.organizer}
					participants={invite?.participants}
					isSummary
				/>
			</Container>
		)}
	</>
);
