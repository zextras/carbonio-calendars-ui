/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';

import { Container, useSnackbar } from '@zextras/carbonio-design-system';
import { useUserAccount } from '@zextras/carbonio-shell-ui';

import { OrganizerPart } from './organizer-part';
import { ParticipantsDisplayer } from './participants-displayer';
import { ParticipantsDisplayerSmall } from './participants-displayer-small';
import { useFolder } from '../../carbonio-ui-commons/store/zustand/folder';
import { LinkFolder } from '../../carbonio-ui-commons/types/folder';
import { EventType } from '../../types/event';
import { Invite, InviteOrganizer, InviteParticipants } from '../../types/store/invite';

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
}: ParticipantProps): ReactElement | null => {
	const account = useUserAccount();
	const calendar = useFolder(invite.ciFolder);
	const createSnackbar = useSnackbar();
	const iAmAttendee = useMemo(
		() => (!invite.isOrganizer && !(calendar as LinkFolder)?.owner) ?? false,
		[calendar, invite.isOrganizer]
	);
	return organizer ? (
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
			{isSummary ? (
				<ParticipantsDisplayerSmall participants={participants} event={event} />
			) : (
				<ParticipantsDisplayer participants={participants} />
			)}
		</Container>
	) : null;
};
