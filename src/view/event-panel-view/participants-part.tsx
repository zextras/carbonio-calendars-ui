/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import { Container } from '@zextras/carbonio-design-system';

import { OrganizerPart } from './organizer-part';
import { ParticipantsDisplayer } from './participants-displayer';
import { ParticipantsDisplayerSmall } from './participants-displayer-small';
import { EventType } from '../../types/event';
import { Invite, InviteOrganizer, InviteParticipants } from '../../types/store/invite';
import { FreeBusyStatusRow } from '../event-summary-view/free-busy-status-row';

type ParticipantProps = {
	invite: Invite;
	event: EventType;
	organizer: InviteOrganizer;
	participants: InviteParticipants;
	isSummary?: boolean;
};

export const ParticipantsPart = ({
	invite,
	event,
	organizer,
	participants,
	isSummary
}: ParticipantProps): ReactElement | null =>
	organizer ? (
		<Container
			orientation="vertical"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			width="fill"
			height="fit"
			padding={isSummary ? { vertical: 'small' } : { horizontal: 'large', vertical: 'medium' }}
			background={'gray6'}
		>
			<OrganizerPart
				organizer={organizer}
				invite={invite}
				calendarOwner={event.resource.calendar.owner}
				isSummary={isSummary}
			/>
			{isSummary && (
				<FreeBusyStatusRow
					freeBusy={event.resource.freeBusy}
					organizerName={invite?.organizer?.a}
				/>
			)}
			{isSummary ? (
				<ParticipantsDisplayerSmall participants={participants} event={event} />
			) : (
				<ParticipantsDisplayer participants={participants} />
			)}
		</Container>
	) : null;
