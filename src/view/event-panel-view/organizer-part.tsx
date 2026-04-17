/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';

import {
	Avatar,
	Container,
	Row,
	Text,
	Chip,
	useSnackbar,
	Theme
} from '@zextras/carbonio-design-system';
import { useUserAccount, t } from '@zextras/carbonio-shell-ui';
import { useFolder, LinkFolder } from '@zextras/carbonio-ui-commons';
import { Trans } from 'react-i18next';

import { isIcsOrCaldavExternalFolder } from 'commons/utilities';
import { copyEmailToClipboard, sendMsg } from 'store/actions/participant-displayer-actions';
import { Invite, InviteOrganizer } from 'types/store/invite';

type OrganizerPartProps = {
	invite: Invite;
	calendarOwner?: string;
	organizer: InviteOrganizer;
	isSummary?: boolean;
	fontSize?: keyof typeof Theme.sizes.font;
};

export const OrganizerPart = ({
	invite,
	calendarOwner,
	organizer,
	isSummary,
	fontSize = 'medium'
}: OrganizerPartProps): ReactElement | null => {
	const account = useUserAccount();
	const calendar = useFolder(invite.ciFolder);
	const createSnackbar = useSnackbar();
	const isExternalCalendar = useMemo(() => isIcsOrCaldavExternalFolder(calendar ?? {}), [calendar]);
	const isLoggedInUserAttendee = useMemo(
		() =>
			invite?.attendees?.some(
				(attendee) => attendee?.a === account.name || attendee?.a === account.displayName
			) ?? false,
		[account.displayName, account.name, invite?.attendees]
	);
	const showAttendeePerspective = useMemo(
		() =>
			!invite.isOrganizer &&
			!(calendar as LinkFolder)?.owner &&
			(!isExternalCalendar || isLoggedInUserAttendee),
		[calendar, invite.isOrganizer, isExternalCalendar, isLoggedInUserAttendee]
	);
	const iAmAttendee = useMemo(() => showAttendeePerspective ?? false, [showAttendeePerspective]);

	const organizerChip = (
		<Row
			mainAlignment="flex-start"
			width="100%"
			padding={{ top: 'extrasmall', bottom: 'extrasmall' }}
		>
			<Chip
				label={organizer.a || organizer.d}
				background={'gray3'}
				color="text"
				data-testid={'Chip'}
				hasAvatar={false}
				actions={[
					{
						id: 'action1',
						label: t('message.send_email', 'Send e-mail'),
						type: 'button',
						icon: 'EmailOutline',
						onClick: () => sendMsg(organizer.a, organizer.d)
					},
					{
						id: 'action2',
						label: t('message.copy', 'Copy'),
						type: 'button',
						icon: 'Copy',
						onClick: () => copyEmailToClipboard(organizer.a, createSnackbar)
					}
				]}
			/>
		</Row>
	);

	return (
		<Container
			orientation="vertical"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			width="fill"
			height="fit"
			padding={isSummary ? { top: 'small' } : { horizontal: 'large', vertical: 'medium' }}
			background={'gray6'}
		>
			{invite?.organizer?.a === account.name && (
				<Row mainAlignment="flex-start" crossAlignment="center" width="fill">
					<Avatar
						size={isSummary ? 'small' : 'large'}
						label={account.name ?? account.displayName ?? ''}
					/>
					<Text style={{ padding: '0 0.5rem' }} size={fontSize}>
						<Trans
							i18nKey="message.you_are_organizer"
							defaults="<Row><Text> <BoldText> You  </BoldText> are the organizer </Text></Row>"
							components={{
								Row: <Row />,
								Text: <Text color="secondary" size={fontSize} />,
								BoldText: <span style={{ fontWeight: 'bold', color: '#333333' }} />
							}}
						/>
					</Text>
				</Row>
			)}
			{showAttendeePerspective ? (
				<Row mainAlignment="flex-start" crossAlignment="flex-start" padding={{ vertical: 'small' }}>
					<Avatar
						label={organizer.d ?? organizer.a ?? organizer.url ?? ''}
						size={isSummary ? 'small' : 'large'}
					/>
					<Row
						mainAlignment="flex-start"
						crossAlignment="center"
						takeAvailableSpace
						padding={{ left: 'small' }}
					>
						<Text size={fontSize}>
							{calendarOwner ? (
								<Trans
									i18nKey="message.somebody_invited_owner"
									defaults="<strong>{{somebody}}</strong> invited {{owner}}"
									values={{
										somebody: organizer.d || organizer.a || organizer.url,
										owner: calendarOwner
									}}
								/>
							) : (
								<Trans
									i18nKey="message.somebody_invited_you"
									defaults="<strong>{{somebody}}</strong> invited you"
									values={{ somebody: organizer.d || organizer.a || organizer.url }}
								/>
							)}
						</Text>
						{organizerChip}
					</Row>
				</Row>
			) : (
				invite?.organizer?.a !== account.name &&
				!iAmAttendee && (
					<Row mainAlignment="flex-start" crossAlignment="center" width="fill">
						<Avatar
							size={isSummary ? 'small' : 'large'}
							label={organizer.d ?? organizer.a ?? organizer.url ?? ''}
						/>
						<Row
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							takeAvailableSpace
							padding={{ left: 'small' }}
						>
							<Text size={fontSize}>
								<Trans
									i18nKey="message.somebody_is_organizer"
									defaults="<strong>{{somebody}}</strong> is the organizer"
									values={{ somebody: organizer.d || organizer.a }}
								/>
							</Text>
							{organizerChip}
						</Row>
					</Row>
				)
			)}
		</Container>
	);
};
