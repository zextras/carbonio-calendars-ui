/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, ReactElement, useMemo } from 'react';

import { Icon, Padding, Row, Tooltip, Text } from '@zextras/carbonio-design-system';
import { FOLDERS } from '@zextras/carbonio-ui-commons';
import moment from 'moment';
import { Trans, useTranslation } from 'react-i18next';

import { MESSAGE_METHOD } from 'constants/api';
import { useGetDateRangeConvertedToTimezone } from 'hooks/use-get-date-range-converted-to-timezone';
import { Invite } from 'types/store/invite';

// Fallback duration applied when a VEVENT has a DATE-TIME DTSTART but no
// DTEND/DURATION. RFC 5545 §3.6.1 defines the default as a zero-length
// event in that case, which renders as a degenerate (or, if the end is
// missing outright, incorrect) range. Mirror Thunderbird's behavior and
// show a 1-hour block instead.
export const DEFAULT_EVENT_DURATION_MS = 60 * 60 * 1000;

// `end` is the parsed invite end timestamp, or `undefined` when the invite
// carries no DTEND/DURATION at all. All-day events keep their own
// date-based duration handling and are left untouched here.
export const getInviteEndTime = (
	start: number,
	end: number | undefined,
	allDay: boolean
): number => {
	if (allDay) return end ?? start;
	return end === undefined || end <= start ? start + DEFAULT_EVENT_DURATION_MS : end;
};

type InviteHeaderPartProps = {
	mailMsg: any;
	method: any;
	invite: Invite;
	proposedStartTime?: string;
	proposedEndTime?: string;
};

export const InviteHeaderPart: FC<InviteHeaderPartProps> = ({
	mailMsg,
	method,
	invite,
	proposedStartTime,
	proposedEndTime
}): ReactElement => {
	const [t] = useTranslation();

	const timeZone = invite.tz;
	const allDay = invite.allDay ?? false;

	const localStartTime = useMemo(
		() => moment(invite.start?.d ?? invite.start.u).valueOf(),
		[invite.start?.d, invite.start.u]
	);

	const localEndTime = useMemo(() => {
		const rawEnd = invite.end?.d ?? invite.end?.u;
		return getInviteEndTime(
			localStartTime,
			rawEnd !== undefined ? moment(rawEnd).valueOf() : undefined,
			allDay
		);
	}, [invite.end?.d, invite.end?.u, allDay, localStartTime]);

	const originalDate = useGetDateRangeConvertedToTimezone(localStartTime ?? 0, localEndTime ?? 0, {
		allDay,
		timeZone
	});

	const convertedDate = useGetDateRangeConvertedToTimezone(localStartTime ?? 0, localEndTime ?? 0, {
		allDay
	});

	const counterDate = useGetDateRangeConvertedToTimezone(
		proposedStartTime ? moment(proposedStartTime).valueOf() : 0,
		proposedEndTime ? moment(proposedEndTime).valueOf() : 0,
		{
			allDay,
			timeZone
		}
	);

	const showTimezoneIndicator = convertedDate !== originalDate;

	const timezoneTooltip = useMemo(
		() => (
			<>
				{t('creation_timezone_tooltip', 'Date and time on creation timezone:')}
				<br />
				{originalDate}
			</>
		),
		[originalDate, t]
	);

	return (
		<>
			<Row width="fill" mainAlignment="flex-start" padding={{ bottom: 'extrasmall' }}>
				{method === MESSAGE_METHOD.COUNTER && (
					<Text weight="light" size="large">
						{mailMsg.subject}
					</Text>
				)}
				{method !== MESSAGE_METHOD.COUNTER && (
					<Trans
						i18nKey="message.organizer_invited_you"
						values={{
							organizer: invite.organizer?.d ?? invite.organizer?.a,
							title: mailMsg.subject ?? invite?.name
						}}
						defaults="<text>{{organizer}} invited you to an event <bold>{{title}}</bold></text>"
						components={{ bold: <strong />, text: <Text /> }}
						t={t}
					/>
				)}
			</Row>
			<Row width="100%" mainAlignment="flex-start">
				{method === MESSAGE_METHOD.COUNTER && mailMsg.parent !== FOLDERS.SENT && (
					<Text overflow="ellipsis" color="secondary" weight="bold" size="small">
						{counterDate}
					</Text>
				)}
				{method !== MESSAGE_METHOD.COUNTER && (
					<Text overflow="ellipsis" color="secondary" weight="bold" size="small">
						{originalDate}
					</Text>
				)}

				{showTimezoneIndicator && (
					<Tooltip label={timezoneTooltip}>
						<Padding left="small">
							<Icon icon="GlobeOutline" color="gray1" />
						</Padding>
					</Tooltip>
				)}
			</Row>
		</>
	);
};

export default InviteHeaderPart;
