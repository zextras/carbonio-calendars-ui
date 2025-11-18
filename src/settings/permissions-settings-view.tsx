/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import styled from '@emotion/styled';
import {
	Container,
	Text,
	Row,
	Checkbox,
	FormSection,
	FormSubSection
} from '@zextras/carbonio-design-system';
import { getUserAccount, t, useIntegratedComponent } from '@zextras/carbonio-shell-ui';
import { ContactInputProps } from '@zextras/carbonio-ui-commons';
import { AccountSettingsPrefs } from '@zextras/carbonio-ui-soap-lib';

import { permissionsSubSection } from './sub-sections';
import { PermissionsRightsOptions } from '../constants/api';

const AttendeesContainer = styled.div`
	width: 100%;
	height: fit-content;
	background: ${({ theme }): string => theme.palette.gray5.regular};
	border-bottom: 0.0625rem solid ${({ theme }): string => theme.palette.gray2.regular};
	[class^='Chip__ChipComp'] {
		[class^='Text__Comp'] {
			color: ${({ theme }): string => theme.palette.text.regular};
		}
	}
`;

export default function PermissionsSettings({
	activeFreeBusyOptn,
	activeInviteOptn,
	setAllowedFBUsers,
	handlePermissionChange,
	handleInviteRightChange,
	setAllowedInviteUsers,
	settingsObj,
	updateSettings,
	allowedFBUsers,
	allowedInviteUsers
}: {
	activeFreeBusyOptn: PermissionsRightsOptions;
	activeInviteOptn: PermissionsRightsOptions;
	setAllowedFBUsers: React.Dispatch<React.SetStateAction<ContactInputProps['defaultValue']>>;
	handlePermissionChange: (permission: PermissionsRightsOptions) => () => void;
	handleInviteRightChange: (right: PermissionsRightsOptions) => () => void;
	setAllowedInviteUsers: React.Dispatch<React.SetStateAction<ContactInputProps['defaultValue']>>;
	settingsObj: AccountSettingsPrefs;
	updateSettings: (e: {
		target: {
			name: string;
			value: string;
		};
	}) => void;
	allowedFBUsers: ContactInputProps['defaultValue'];
	allowedInviteUsers: ContactInputProps['defaultValue'];
}): React.JSX.Element {
	const [ContactInput] = useIntegratedComponent('contact-input');
	const sectionTitlePermissions = useMemo(() => permissionsSubSection(), []);

	return (
		<FormSection label={sectionTitlePermissions.label} id={sectionTitlePermissions.id}>
			<FormSubSection>
				<Container orientation="horizontal" crossAlignment="baseline" mainAlignment="flex-start">
					<Row padding={{ right: 'small' }}>
						<Text weight="bold">Note:</Text>
					</Row>
					<Row>
						<Text overflow="break-word">
							{t('settings.permissions_description', {
								defaultValue:
									'Users provide below must be on this mail system ({{domain}}). You may use the full e-mail address or just the username.',
								domain: getUserAccount()?.name.split('@')?.[1]
							})}
						</Text>
					</Row>
				</Container>
			</FormSubSection>
			<FormSubSection label={t('label.free_busy', 'Free/Busy')}>
				<Container
					gap={'0.5rem'}
					mainAlignment={'flex-start'}
					crossAlignment={'flex-start'}
					height={'fit'}
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
						<AttendeesContainer>
							<ContactInput
								placeholder={t('label.email_input_message', 'Enter e-mail addresses')}
								onChange={setAllowedFBUsers}
								defaultValue={allowedFBUsers}
							/>
						</AttendeesContainer>
					)}
				</Container>
			</FormSubSection>
			<FormSubSection label={t('label.invites', 'Invites')}>
				<Container
					gap={'0.5rem'}
					mainAlignment={'flex-start'}
					crossAlignment={'flex-start'}
					height={'fit'}
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
						<AttendeesContainer>
							<ContactInput
								placeholder={t('label.email_input_message', 'Enter e-mail addresses')}
								onChange={setAllowedInviteUsers}
								defaultValue={allowedInviteUsers}
							/>
						</AttendeesContainer>
					)}

					<Row orientation="vertical" mainAlignment="flex-start" crossAlignment="baseline">
						<Checkbox
							value={settingsObj.zimbraPrefCalendarSendInviteDeniedAutoReply === 'TRUE'}
							onClick={(): void =>
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
			</FormSubSection>
		</FormSection>
	);
}
