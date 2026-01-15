/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo, useState } from 'react';

import { PARTICIPANT_ROLE } from '../../../constants/api';
import type { Attendee } from '../../../types/store/invite';

const INITIAL_REQUIRED_PARTICIPANTS_LIMIT = 2;
const INITIAL_OPTIONAL_PARTICIPANTS_LIMIT = 5;

type UseParticipants = {
	participants: Attendee[];
	visibleParticipants: Attendee[];
	hasMoreParticipants: boolean;
	showAllParticipants: () => void;
};

export const useParticipants = (attendees: Attendee[], isRequired: boolean): UseParticipants => {
	const [maxParticipantToShow, setMaxParticipantToShow] = useState(
		isRequired ? INITIAL_REQUIRED_PARTICIPANTS_LIMIT : INITIAL_OPTIONAL_PARTICIPANTS_LIMIT
	);

	const participants = useMemo(
		() =>
			attendees.filter(
				(user) => user.role === (isRequired ? PARTICIPANT_ROLE.REQUIRED : PARTICIPANT_ROLE.OPTIONAL)
			),
		[attendees, isRequired]
	);

	const visibleParticipants = useMemo(
		() => participants.slice(0, maxParticipantToShow),
		[participants, maxParticipantToShow]
	);

	const hasMoreParticipants = maxParticipantToShow < participants.length;

	const showAllParticipants = (): void => {
		setMaxParticipantToShow(participants.length);
	};

	return {
		participants,
		visibleParticipants,
		hasMoreParticipants,
		showAllParticipants
	};
};
