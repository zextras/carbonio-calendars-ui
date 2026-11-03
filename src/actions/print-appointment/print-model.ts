/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getUserSettings, t } from '@zextras/carbonio-shell-ui';
import { toLower } from 'lodash';

import { TIME_FORMAT_PREF_NAME, toHour12Option } from 'commons/time-format';
import { PARTICIPANT_ROLE } from 'constants/api';
import { getTimeStrings } from 'hooks/use-get-date-range-converted-to-timezone';
import { localeFromPrefs } from 'hooks/use-locale';
import { EventType } from 'types/event';
import { Attendee, Invite } from 'types/store/invite';

export type PrintField = { label: string; value: string };

export type PrintModel = {
	lang: string;
	title: string;
	fields: Array<PrintField>;
	attendees: { label: string; values: Array<string> };
	description: string;
};

// C0 and C1 controls, except tab and line feed
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g;

export const sanitizeText = (value: string | undefined | null): string =>
	(value ?? '').replace(/\r\n?/g, '\n').replace(CONTROL_CHARS, '').trim();

const BLOCK_ELEMENTS =
	'address, blockquote, div, dl, dt, dd, h1, h2, h3, h4, h5, h6, li, p, pre, tr';

// DOMParser documents are inert: no script runs and nothing is fetched
export const htmlToText = (html: string | undefined): string => {
	if (!html) return '';
	const doc = new DOMParser().parseFromString(html, 'text/html');
	doc.querySelectorAll('head, script, style, noscript, template').forEach((node) => node.remove());
	doc.querySelectorAll('br').forEach((node) => node.replaceWith('\n'));
	doc.querySelectorAll(BLOCK_ELEMENTS).forEach((node) => {
		node.before('\n');
		node.append('\n');
	});
	return (doc.body?.textContent ?? '').replace(/\n{2,}/g, '\n').trim();
};

export const formatParticipant = (name?: string, email?: string): string => {
	const cleanName = sanitizeText(name);
	const cleanEmail = sanitizeText(email);
	if (cleanName && cleanEmail && cleanName !== cleanEmail) return `${cleanName} <${cleanEmail}>`;
	return cleanName || cleanEmail;
};

const formatAttendee = (attendee: Attendee): string => {
	const participant = formatParticipant(attendee.d, attendee.a);
	return attendee.role === PARTICIPANT_ROLE.OPTIONAL
		? `${participant} (${t('label.optional', 'Optional')})`
		: participant;
};

const getTitle = (event: EventType, invite: Invite): string => {
	const title = sanitizeText(invite.name) || sanitizeText(event.title);
	if (title) return title;
	return invite.class === 'PRI' || event.resource.class === 'PRI'
		? t('label.private', 'Private')
		: t('label.no_subject', 'No subject');
};

const getWhen = (event: EventType): string => {
	const { prefs } = getUserSettings();
	return getTimeStrings({
		// the invite only has the series dates
		start: event.start,
		end: event.end,
		options: {
			allDay: event.allDay,
			allDayLabel: toLower(t('label.all_day', 'All day')),
			locale: localeFromPrefs(prefs),
			hour12: toHour12Option(prefs[TIME_FORMAT_PREF_NAME]),
			timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
		}
	});
};

const getDescription = (invite: Invite): string => {
	const text = invite.textDescription?.[0]?._content;
	return sanitizeText(text || htmlToText(invite.htmlDescription?.[0]?._content));
};

export const buildPrintModel = ({
	event,
	invite
}: {
	event: EventType;
	invite: Invite;
}): PrintModel => {
	const organizer = invite.organizer
		? formatParticipant(invite.organizer.d, invite.organizer.a)
		: formatParticipant(event.resource.organizer?.name, event.resource.organizer?.email);

	const fields: Array<PrintField> = [
		{ label: t('label.when', 'When'), value: getWhen(event) },
		{
			label: t('label.location', 'Location'),
			value: sanitizeText(invite.location || event.resource.location)
		},
		{ label: t('label.calendar', 'Calendar'), value: sanitizeText(event.resource.calendar?.name) },
		{ label: t('message.organizer', 'Organizer'), value: organizer }
	].filter((field) => field.value);

	return {
		lang: localeFromPrefs(getUserSettings().prefs),
		title: getTitle(event, invite),
		fields,
		attendees: {
			label: t('label.attendees', 'Attendees'),
			values: (invite.attendees ?? []).map(formatAttendee).filter(Boolean)
		},
		description: getDescription(invite)
	};
};
