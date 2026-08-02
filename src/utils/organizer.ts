/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

type OrganizerLike = { a?: string; sentBy?: string } | undefined;

// the mailbox stores sentBy as it is received, while it matches addresses ignoring their case
const isTheSameAddress = (first: string | undefined, second: string | undefined): boolean =>
	!!first && !!second && first.toLowerCase() === second.toLowerCase();

/**
 * An appointment is sent on behalf of the organizer when a delegate creates it on a shared calendar:
 * the organizer remains the calendar owner while sentBy holds the delegate address (ICS SENT-BY).
 */
export const isSentOnBehalfOf = (organizer: OrganizerLike): boolean =>
	!!organizer?.sentBy && !isTheSameAddress(organizer.sentBy, organizer.a);

export const getAppointmentCreatorEmail = (organizer: OrganizerLike): string | undefined =>
	isSentOnBehalfOf(organizer) ? organizer?.sentBy : organizer?.a;

export const isAppointmentCreatedBy = (
	organizer: OrganizerLike,
	address: string | undefined
): boolean => isTheSameAddress(getAppointmentCreatorEmail(organizer), address);
