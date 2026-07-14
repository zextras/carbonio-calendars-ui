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
import {
	getAppointmentCreatorEmail,
	isAppointmentCreatedBy,
	isSentOnBehalfOf
} from 'utils/organizer';

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

	const isSentOnBehalf = useMemo(() => isSentOnBehalfOf(organizer), [organizer]);
	const creatorEmail = useMemo(() => getAppointmentCreatorEmail(organizer) ?? '', [organizer]);
	// SENT-BY only carries an address, so the delegate has no display name to fall back on
	const creatorName = useMemo(
		() => (isSentOnBehalf ? '' : organizer.d),
		[isSentOnBehalf, organizer.d]
	);
	const creatorLabel = useMemo(
		() => creatorName || creatorEmail || organizer.url || '',
		[creatorEmail, creatorName, organizer.url]
	);
	const iAmTheCreator = useMemo(
		() => isAppointmentCreatedBy(organizer, account.name),
		[account.name, organizer]
	);

	const organizerChip = (
		<Row
			mainAlignment="flex-start"
			width="100%"
			padding={{ top: 'extrasmall', bottom: 'extrasmall' }}
		>
			<Chip
				label={creatorEmail || creatorName}
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
						onClick: () => sendMsg(creatorEmail, creatorName)
					},
					{
						id: 'action2',
						label: t('message.copy', 'Copy'),
						type: 'button',
						icon: 'Copy',
						onClick: () => copyEmailToClipboard(creatorEmail, createSnackbar)
					}
				]}
			/>
		</Row>
	);

	const onBehalfOfRow = isSentOnBehalf ? (
		<Row mainAlignment="flex-start" width="100%" data-testid={'OnBehalfOf'}>
			<Text color="secondary" size="small" overflow="break-word">
				<Trans
					i18nKey="message.on_behalf_of"
					defaults="on behalf of <strong>{{owner}}</strong>"
					values={{ owner: organizer.a || organizer.d }}
				/>
			</Text>
		</Row>
	) : null;

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
			{iAmTheCreator && (
				<Row mainAlignment="flex-start" crossAlignment="center" width="fill">
					<Avatar
						size={isSummary ? 'small' : 'large'}
						label={account.name ?? account.displayName ?? ''}
					/>
					<Container
						orientation="vertical"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						width="fit"
						height="fit"
						padding={{ horizontal: 'small' }}
					>
						<Text size={fontSize}>
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
						{onBehalfOfRow}
					</Container>
				</Row>
			)}
			{showAttendeePerspective ? (
				<Row mainAlignment="flex-start" crossAlignment="flex-start" padding={{ vertical: 'small' }}>
					<Avatar label={creatorLabel} size={isSummary ? 'small' : 'large'} />
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
										somebody: creatorLabel,
										owner: calendarOwner
									}}
								/>
							) : (
								<Trans
									i18nKey="message.somebody_invited_you"
									defaults="<strong>{{somebody}}</strong> invited you"
									values={{ somebody: creatorLabel }}
								/>
							)}
						</Text>
						{organizerChip}
						{onBehalfOfRow}
					</Row>
				</Row>
			) : (
				!iAmTheCreator &&
				!iAmAttendee && (
					<Row mainAlignment="flex-start" crossAlignment="center" width="fill">
						<Avatar size={isSummary ? 'small' : 'large'} label={creatorLabel} />
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
									values={{ somebody: creatorLabel }}
								/>
							</Text>
							{organizerChip}
							{onBehalfOfRow}
						</Row>
					</Row>
				)
			)}
		</Container>
	);
};
