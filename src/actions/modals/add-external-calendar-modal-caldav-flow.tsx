/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Switch, Input, Padding, PasswordInput } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

type AddExternalCalendarModalCaldavFlowProps = {
	caldavHost: string;
	caldavHostError?: string;
	caldavFolderName: string;
	isDuplicateCaldavFolderName: boolean;
	noCredentials: boolean;
	caldavUsername: string;
	caldavPassword: string;
	isSubmitting: boolean;
	onCaldavHostChange: (value: string) => void;
	onCaldavFolderNameChange: (value: string) => void;
	onNoCredentialsChange: (value: boolean) => void;
	onCaldavUsernameChange: (value: string) => void;
	onCaldavPasswordChange: (value: string) => void;
};

export const AddExternalCalendarModalCaldavFlow = ({
	caldavHost,
	caldavHostError,
	caldavFolderName,
	isDuplicateCaldavFolderName,
	noCredentials,
	caldavUsername,
	caldavPassword,
	isSubmitting,
	onCaldavHostChange,
	onCaldavFolderNameChange,
	onNoCredentialsChange,
	onCaldavUsernameChange,
	onCaldavPasswordChange
}: AddExternalCalendarModalCaldavFlowProps): JSX.Element => {
	const [t] = useTranslation();

	return (
		<>
			<Input
				label={`${t('add_external_calendar.caldav.host', 'Host address (calendar.example.com)')}*`}
				background={'gray5'}
				hasError={!!caldavHostError}
				value={caldavHost}
				disabled={isSubmitting}
				description={
					caldavHostError ??
					t(
						'add_external_calendar.caldav.host_name_hint',
						'Added calendars will be read-only and will sync every 12 hours'
					)
				}
				onChange={(event): void => onCaldavHostChange(event.target.value)}
			/>
			<Padding top="medium" />
			<Input
				label={`${t('add_external_calendar.caldav.calendar_name', 'Calendars’ name')}*`}
				background={'gray5'}
				hasError={isDuplicateCaldavFolderName}
				value={caldavFolderName}
				description={
					isDuplicateCaldavFolderName
						? t(
								'add_ics_from_url.error.duplicate_calendar_name',
								'A calendar with the same name already exists'
							)
						: t(
								'add_external_calendar.caldav.calendar_name_hint',
								'Choose a name to identify all calendars from this host'
							)
				}
				disabled={isSubmitting}
				onChange={(event): void => onCaldavFolderNameChange(event.target.value)}
			/>
			<Padding top="medium" />
			<Input
				label={`${t('add_external_calendar.caldav.username', 'Username')}*`}
				background={'gray5'}
				value={caldavUsername}
				disabled={isSubmitting}
				onChange={(event): void => onCaldavUsernameChange(event.target.value)}
			/>
			<Padding top="medium" />
			<Switch
				value={noCredentials}
				label={t(
					'add_external_calendar.caldav.no_credentials',
					'This host does not require credentials'
				)}
				onClick={(): void => onNoCredentialsChange(!noCredentials)}
				disabled={isSubmitting}
			/>
			<Padding top="medium" />
			<PasswordInput
				label={`${t('add_external_calendar.caldav.password', 'Password')}*`}
				background={'gray5'}
				value={caldavPassword}
				disabled={isSubmitting || noCredentials}
				onChange={(event): void => onCaldavPasswordChange(event.target.value)}
			/>
		</>
	);
};
