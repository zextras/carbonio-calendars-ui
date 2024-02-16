/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container, Text, Row, Checkbox } from '@zextras/carbonio-design-system';
import { t, useIntegratedComponent } from '@zextras/carbonio-shell-ui';
import styled from 'styled-components';

const AttendeesContainer = styled.div`
	width: calc(100% - ${({ hasTooltip }) => (hasTooltip ? `3rem` : '0rem')});
	height: fit-content;
	background: ${({ theme }) => theme.palette.gray5.regular};
	border-bottom: 0.0625rem solid ${({ theme }) => theme.palette.gray2.regular};
	[class^='Chip__ChipComp'] {
		[class^='Text__Comp'] {
			color: ${({ theme }) => theme.palette.text.regular};
		}
	}
`;

export default function PermisionsSettings({
	activeFreeBusyOptn,
	activeInviteOptn,
	setAllowedFBUsers,
	handlePermissionChange,
	handleInviteRightChange,
	setAllowedInivteUsers,
	settingsObj,
	updateSettings,
	defaultSelectedFreeBusyContacts,
	defaultSelectedInviteContacts
}) {
	const [ContactInput] = useIntegratedComponent('contact-input');
	return (
		<Container
			padding={{ all: 'medium' }}
			background="gray6"
			mainAlignment="baseline"
			crossAlignment="baseline"
		>
			<Container
				orientation="horizontal"
				crossAlignment="baseline"
				mainAlignment="baseline"
				padding={{ all: 'small' }}
			>
				<Row padding={{ right: 'small' }}>
					<Text weight="bold">Note:</Text>
				</Row>
				<Row>
					<Text overflow="break-word">
						{t(
							'settings.permissions_note',
							'Users provide below must be on this mail system (zextras.com). You may use the full e-mail address or just the username.'
						)}
					</Text>
				</Row>
			</Container>
			<Row padding={{ horizontal: 'small', top: 'small' }}>
				<Text size="large" weight="bold">
					{t('label.free_busy', 'Free/Busy')}
				</Text>
			</Row>
			<Container
				padding={{ all: 'small' }}
				mainAlignment="space-between"
				crossAlignment="baseline"
				width="100%"
			>
				<Checkbox
					value={activeFreeBusyOptn === 'allowInternalExternal'}
					onClick={handlePermissionChange('allowInternalExternal')}
					label={t(
						'settings.options.free_busy_opts.allow_all',
						'Allow both internal and external users to see my free/busy information'
					)}
				/>
				<Checkbox
					value={activeFreeBusyOptn === 'allowInternal'}
					onClick={handlePermissionChange('allowInternal')}
					label={t(
						'settings.options.free_busy_opts.allow_internal',
						'Allow only users of internal domains to see my free/busy information'
					)}
				/>
				<Checkbox
					value={activeFreeBusyOptn === 'allowDomainUsers'}
					onClick={handlePermissionChange('allowDomainUsers')}
					label={t(
						'settings.options.free_busy_opts.allow_domain',
						'Allow only users of my domain to see my free/busy information'
					)}
				/>
				<Checkbox
					value={activeFreeBusyOptn === 'allowNone'}
					onClick={handlePermissionChange('allowNone')}
					label={t(
						'settings.options.free_busy_opts.allow_none',
						"Don't let anyone see my free/busy information"
					)}
				/>
				<Checkbox
					value={activeFreeBusyOptn === 'allowFollowing'}
					onClick={handlePermissionChange('allowFollowing')}
					label={t(
						'settings.options.free_busy_opts.allow_following',
						'Allow only the following internal users to see my free/busy information'
					)}
				/>
				{activeFreeBusyOptn === 'allowFollowing' && (
					<Container padding={{ left: 'extralarge', top: 'medium' }}>
						<Container padding={{ left: 'small' }}>
							<AttendeesContainer>
								<ContactInput
									placeholder={t('label.email_input_message', 'Enter e-mail addresses')}
									onChange={(users) => {
										setAllowedFBUsers(users);
									}}
									defaultValue={defaultSelectedFreeBusyContacts}
								/>
							</AttendeesContainer>
						</Container>
					</Container>
				)}
			</Container>

			<Row padding={{ horizontal: 'small', top: 'small' }}>
				<Text size="large" weight="bold">
					{t('label.invites', 'Invites')}
				</Text>
			</Row>
			<Container
				padding={{ all: 'small' }}
				mainAlignment="space-between"
				crossAlignment="baseline"
				width="100%"
			>
				<Checkbox
					value={activeInviteOptn === 'allowInternalExternal'}
					onClick={handleInviteRightChange('allowInternalExternal')}
					label={t(
						'settings.options.invt_opts.allow_all',
						'Allow both internal and extrernal users to invite me to meetings'
					)}
				/>
				<Checkbox
					value={activeInviteOptn === 'allowInternal'}
					onClick={handleInviteRightChange('allowInternal')}
					label={t(
						'settings.options.invt_opts.allow_internal',
						'Allow only internal users to invite me to meetings'
					)}
				/>
				<Checkbox
					value={activeInviteOptn === 'allowNone'}
					onClick={handleInviteRightChange('allowNone')}
					label={t(
						'settings.options.invt_opts.allow_none',
						"Don't let anyone to invite me to meetings"
					)}
				/>
				<Checkbox
					value={activeInviteOptn === 'allowFollowing'}
					onClick={handleInviteRightChange('allowFollowing')}
					label={t(
						'settings.options.invt_opts.allow_following',
						'Allow only the following internal users to invite me to meetings'
					)}
				/>
				{activeInviteOptn === 'allowFollowing' && (
					<Container padding={{ left: 'extralarge', top: 'medium' }}>
						<Container padding={{ left: 'small' }}>
							<AttendeesContainer>
								<ContactInput
									placeholder={t('label.email_input_message', 'Enter e-mail addresses')}
									onChange={(users) => {
										setAllowedInivteUsers(users);
									}}
									defaultValue={defaultSelectedInviteContacts}
								/>
							</AttendeesContainer>
						</Container>
					</Container>
				)}
			</Container>

			<Row
				orientation="vertical"
				mainAlignment="baseline"
				crossAlignment="baseline"
				padding={{ all: 'small' }}
			>
				<Checkbox
					value={settingsObj.zimbraPrefCalendarSendInviteDeniedAutoReply === 'TRUE'}
					onClick={() =>
						updateSettings({
							target: {
								name: 'zimbraPrefCalendarSendInviteDeniedAutoReply',
								value:
									settingsObj.zimbraPrefCalendarSendInviteDeniedAutoReply === 'TRUE'
										? 'FALSE'
										: 'TRUE'
							}
						})
					}
					label={t(
						'settings.label.snd_autorply_users',
						'Send auto-reply to users who are not allowed to invite me'
					)}
				/>
			</Row>
		</Container>
	);
}
