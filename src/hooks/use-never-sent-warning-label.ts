/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { CALENDAR_RESOURCES, INVITE_NEVER_SENT_WARNING_LABELS } from '../constants';
import { Attendee } from '../types/store/invite';

export const useNeverSentWarningLabel = (attendees?: Attendee[]): string => {
	const [t] = useTranslation();
	return useMemo(() => {
		const hasResources = !!attendees?.filter(
			(attendee) =>
				attendee.cutype === CALENDAR_RESOURCES.RESOURCE ||
				attendee.cutype === CALENDAR_RESOURCES.ROOM
		);
		const hasParticipants = !!attendees?.filter(
			(attendee) =>
				attendee.cutype !== CALENDAR_RESOURCES.RESOURCE &&
				attendee.cutype !== CALENDAR_RESOURCES.ROOM
		).length;

		if (hasParticipants) {
			return t('label.invitation_not_sent', INVITE_NEVER_SENT_WARNING_LABELS.ATTENDEES);
		}
		if (hasResources) {
			return t('label.room_request_not_sent', INVITE_NEVER_SENT_WARNING_LABELS.RESOURCES);
		}
		return t('label.generic_invitation_not_sent', INVITE_NEVER_SENT_WARNING_LABELS.DEFAULT);
	}, [attendees, t]);
};
