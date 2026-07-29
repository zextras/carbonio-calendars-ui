/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, ReactElement, useMemo } from 'react';

import { Icon, Padding, Row, Tooltip, Text } from '@zextras/carbonio-design-system';
import { FOLDERS } from '@zextras/carbonio-ui-commons';
import { Trans, useTranslation } from 'react-i18next';

import { MESSAGE_METHOD } from 'constants/api';
import { useGetDateRangeConvertedToTimezone } from 'hooks/use-get-date-range-converted-to-timezone';
import { Invite } from 'types/store/invite';
import { parseDateFromICS } from 'utils/dates';
import { isSentOnBehalfOf } from 'utils/organizer';

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
		() => invite.start?.u ?? (invite.start?.d ? parseDateFromICS(invite.start.d).getTime() : 0),
		[invite.start?.d, invite.start?.u]
	);

	const localEndTime = useMemo(
		() => invite.end?.u ?? (invite.end?.d ? parseDateFromICS(invite.end.d).getTime() : 0),
		[invite.end?.d, invite.end?.u]
	);

	const originalDate = useGetDateRangeConvertedToTimezone(localStartTime ?? 0, localEndTime ?? 0, {
		allDay,
		timeZone
	});

	const convertedDate = useGetDateRangeConvertedToTimezone(localStartTime ?? 0, localEndTime ?? 0, {
		allDay
	});

	const proposedStart = useMemo(
		() => (proposedStartTime ? parseDateFromICS(proposedStartTime).getTime() : 0),
		[proposedStartTime]
	);

	const proposedEnd = useMemo(
		() => (proposedEndTime ? parseDateFromICS(proposedEndTime).getTime() : 0),
		[proposedEndTime]
	);

	const counterDate = useGetDateRangeConvertedToTimezone(proposedStart, proposedEnd, {
		allDay,
		timeZone
	});

	// In a counter proposal the invite holds the current appointment times, while the
	// mail message holds the attendee's proposed ones: show both when they differ.
	const showOriginalTime =
		method === MESSAGE_METHOD.COUNTER &&
		mailMsg.parent !== FOLDERS.SENT &&
		localStartTime !== 0 &&
		(proposedStart !== localStartTime || proposedEnd !== localEndTime);

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
				{method !== MESSAGE_METHOD.COUNTER &&
					(isSentOnBehalfOf(invite.organizer) ? (
						<Trans
							i18nKey="message.organizer_invited_you_on_behalf_of"
							values={{
								organizer: invite.organizer?.sentBy,
								owner: invite.organizer?.a,
								title: mailMsg.subject ?? invite?.name
							}}
							defaults="<text>{{organizer}} invited you to an event <bold>{{title}}</bold> on behalf of <bold>{{owner}}</bold></text>"
							components={{ bold: <strong />, text: <Text /> }}
							t={t}
						/>
					) : (
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
					))}
			</Row>
			{method === MESSAGE_METHOD.COUNTER && mailMsg.parent !== FOLDERS.SENT && (
				<>
					{showOriginalTime && (
						<Row width="100%" mainAlignment="flex-start" padding={{ bottom: 'small' }}>
							<Text color="gray1" weight="bold" size="small">
								{t('label.original', 'Original')}:
							</Text>
							<Padding left="extrasmall">
								<Text overflow="ellipsis" color="gray1" weight="bold" size="small">
									{originalDate}
								</Text>
							</Padding>
						</Row>
					)}
					<Row width="100%" mainAlignment="flex-start">
						<Text color="warning.focus" size="small">
							{t('label.proposed', 'Proposed')}:
						</Text>
						<Padding left="extrasmall">
							<Text overflow="ellipsis" color="warning.focus" size="small">
								{counterDate}
							</Text>
						</Padding>
						{showTimezoneIndicator && (
							<Tooltip label={timezoneTooltip}>
								<Padding left="small">
									<Icon icon="GlobeOutline" color="gray1" />
								</Padding>
							</Tooltip>
						)}
					</Row>
				</>
			)}
			{method !== MESSAGE_METHOD.COUNTER && (
				<Row width="100%" mainAlignment="flex-start">
					<Text overflow="ellipsis" color="secondary" weight="bold" size="small">
						{convertedDate}
					</Text>

					{showTimezoneIndicator && (
						<Tooltip label={timezoneTooltip}>
							<Padding left="small">
								<Icon icon="GlobeOutline" color="gray1" />
							</Padding>
						</Tooltip>
					)}
				</Row>
			)}
		</>
	);
};

export default InviteHeaderPart;
