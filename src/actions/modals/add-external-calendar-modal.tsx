/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo, useState } from 'react';

import { Container, Padding, Select, useSnackbar } from '@zextras/carbonio-design-system';
import { FOLDERS, useFoldersMap } from '@zextras/carbonio-ui-commons';
import { includes, map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { AddExternalCalendarModalCaldavFlow } from './add-external-calendar-modal-caldav-flow';
import { AddExternalCalendarModalIcsFlow } from './add-external-calendar-modal-ics-flow';
import ModalFooter from '../../commons/modal-footer';
import { buildCalendarColorItems } from 'commons/calendar-color-picker';
import { ModalHeader } from 'commons/modal-header';
import { FOLDER_OPERATIONS } from 'constants/api';
import { CALENDARS_STANDARD_COLORS } from 'constants/calendar';
import {
	createCalDavDataSourceRequest,
	testCalDavDataSourceRequest
} from 'soap/create-data-source-request';
import { createFolderRequest } from 'soap/create-folder-request';
import { folderAction } from 'store/actions/calendar-actions';

const CALENDAR_TYPE_ICS = 'ics' as const;
const CALENDAR_TYPE_CALDAV = 'caldav' as const;

type CalendarType = typeof CALENDAR_TYPE_ICS | typeof CALENDAR_TYPE_CALDAV;

export const AddExternalCalendarModal = ({ onClose }: { onClose: () => void }): JSX.Element => {
	const [t] = useTranslation();
	const folders = useFoldersMap();
	const createSnackbar = useSnackbar();

	const calendarTypeItems = useMemo(
		() => [
			{ value: CALENDAR_TYPE_ICS, label: 'ICS' },
			{ value: CALENDAR_TYPE_CALDAV, label: 'CalDAV' }
		],
		[]
	);

	const [calendarType, setCalendarType] = useState<CalendarType>(CALENDAR_TYPE_ICS);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// ── ICS state ──────────────────────────────────────────────────────────────
	const [calendarUrl, setCalendarUrl] = useState('');
	const [calendarName, setCalendarName] = useState('');
	const [selectedColor, setSelectedColor] = useState('0');

	// ── CalDAV state ───────────────────────────────────────────────────────────
	const [caldavHost, setCaldavHost] = useState('');
	const [caldavFolderName, setCaldavFolderName] = useState('');
	const [noCredentials, setNoCredentials] = useState(false);
	const [caldavUsername, setCaldavUsername] = useState('');
	const [caldavPassword, setCaldavPassword] = useState('');

	// ── ICS validation ─────────────────────────────────────────────────────────
	const appointmentFolderNames = useMemo(
		() =>
			map(folders, (folder) =>
				folder.view === 'appointment' ? folder.name.trim().toLowerCase() : null
			),
		[folders]
	);

	const duplicateCalendar = useMemo(
		() =>
			Object.values(folders).find(
				(folder) =>
					folder.view === 'appointment' &&
					folder.url?.trim().toLowerCase() === calendarUrl.trim().toLowerCase()
			),
		[folders, calendarUrl]
	);

	const isDuplicateCalendarName = useMemo(
		() =>
			isSubmitting ? false : includes(appointmentFolderNames, calendarName.trim().toLowerCase()),
		[appointmentFolderNames, calendarName, isSubmitting]
	);

	const isDuplicateCalendarUrl = useMemo(
		() => !!duplicateCalendar && !isSubmitting,
		[duplicateCalendar, isSubmitting]
	);

	const isDuplicateInTrash = useMemo(
		() => duplicateCalendar?.l === FOLDERS.TRASH,
		[duplicateCalendar]
	);

	const isDuplicateCaldavFolderName = useMemo(
		() =>
			isSubmitting
				? false
				: includes(appointmentFolderNames, caldavFolderName.trim().toLowerCase()),
		[appointmentFolderNames, caldavFolderName, isSubmitting]
	);

	const icsUrlError = useMemo(() => {
		const trimmedUrl = calendarUrl.trim();
		if (!trimmedUrl) {
			return undefined;
		}

		const looksLikeMissingProtocol = !trimmedUrl.includes('://') && /\./.test(trimmedUrl);
		if (looksLikeMissingProtocol) {
			return t(
				'add_external_calendar.error.protocol',
				"The URL should begin with 'http://' or 'https://'"
			);
		}

		try {
			const parsedUrl = new URL(trimmedUrl);
			if (!/^https?:$/i.test(parsedUrl.protocol)) {
				return t(
					'add_external_calendar.error.protocol',
					"The URL should begin with 'http://' or 'https://'"
				);
			}

			if (!/\.ics$/i.test(parsedUrl.pathname)) {
				return t(
					'add_ics_from_url.error.invalid_ics_link',
					'Invalid URL. Make sure it links directly to an .ics calendar file'
				);
			}
		} catch {
			return t(
				'add_external_calendar.error.invalid_url',
				'Invalid URL. Please enter a valid http or https address'
			);
		}

		return undefined;
	}, [calendarUrl, t]);

	// keep urlError as an alias so the variable name used in the JSX below is unchanged
	const urlError = calendarType === CALENDAR_TYPE_ICS ? icsUrlError : undefined;

	const colorItems = useMemo(
		() => buildCalendarColorItems((colorLabel) => t(`colors.${colorLabel}`)),
		[t]
	);

	const selectedRgb = useMemo(
		() =>
			CALENDARS_STANDARD_COLORS[Number(selectedColor)]?.color ?? CALENDARS_STANDARD_COLORS[0].color,
		[selectedColor]
	);

	// ── Submit ─────────────────────────────────────────────────────────────────
	const onConfirm = (): void => {
		if (isSubmitting) {
			return;
		}

		setIsSubmitting(true);

		if (calendarType === CALENDAR_TYPE_ICS) {
			// ICS flow: create a synced folder from a remote .ics URL
			createFolderRequest({
				l: FOLDERS.USER_ROOT,
				name: calendarName.trim(),
				url: calendarUrl.trim(),
				rgb: selectedRgb,
				f: '#',
				view: 'appointment',
				sync: 0 // do not sync at the same time – for big calendars the notify handling takes time
			})
				.then((createFolderResponse) => {
					folderAction({
						id: createFolderResponse.folder[0].id,
						op: FOLDER_OPERATIONS.SYNC
					}).then(() => {
						createSnackbar({
							key: 'external-calendar-created',
							replace: true,
							severity: 'success',
							hideButton: true,
							label: t('message.snackbar.new_calendar_added', 'Calendar added successfully'),
							autoHideTimeout: 3000
						});
						onClose();
					});
				})
				.catch(() => {
					setIsSubmitting(false);
					createSnackbar({
						key: 'external-calendar-create-error',
						replace: true,
						severity: 'error',
						hideButton: true,
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000
					});
				});
		} else {
			// CalDAV flow:
			// 1. Test CalDAV connectivity and credentials before creating anything.
			// 2. Create an empty appointment folder to hold the synced calendar items.
			// 3. Create a CalDAV data source that points to that folder.
			const caldavPayload = {
				name: caldavFolderName.trim(),
				host: caldavHost.trim(),
				port: '443' as const,
				connectionType: 'ssl' as const,
				username: caldavUsername.trim(),
				...(noCredentials ? {} : { password: caldavPassword }),
				a: {
					n: 'zimbraDataSourceAttribute',
					_content: 'p:/principals/users/_USERNAME_/'
				}
			};

			testCalDavDataSourceRequest(caldavPayload)
				.then(() =>
					createFolderRequest({
						l: FOLDERS.USER_ROOT,
						name: caldavFolderName.trim(),
						view: 'appointment',
						f: '#'
					})
				)
				.then((createFolderResponse) => {
					const folderId = createFolderResponse.folder[0].id;

					return createCalDavDataSourceRequest({
						...caldavPayload,
						pollingInterval: '12h',
						isEnabled: '1',
						importOnly: '1',
						l: folderId
					});
				})
				.then(() => {
					createSnackbar({
						key: 'caldav-calendar-created',
						replace: true,
						severity: 'success',
						hideButton: true,
						label: t('message.snackbar.new_calendar_added', 'Calendar added successfully'),
						autoHideTimeout: 3000
					});
					onClose();
				})
				.catch(() => {
					setIsSubmitting(false);
					createSnackbar({
						key: 'caldav-calendar-create-error',
						replace: true,
						severity: 'error',
						hideButton: true,
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000
					});
				});
		}
	};

	// ── ICS url description (error/duplicate text) ─────────────────────────────
	let urlDescription: string | undefined = urlError;
	if (!urlDescription && isDuplicateCalendarUrl) {
		if (isDuplicateInTrash) {
			urlDescription = t(
				'add_ics_from_url.error.duplicate_calendar_url_trash',
				'A calendar with the same URL is in Trash. Permanently delete it to proceed'
			);
		} else {
			urlDescription = t(
				'add_ics_from_url.error.duplicate_calendar_url',
				'A calendar with the same URL has already been added'
			);
		}
	}

	// ── ADD button disabled logic ──────────────────────────────────────────────
	const isAddDisabled = useMemo(() => {
		if (isSubmitting) return true;
		if (calendarType === CALENDAR_TYPE_ICS) {
			return (
				!calendarUrl.trim() ||
				!calendarName.trim() ||
				selectedColor === '' ||
				!!urlError ||
				isDuplicateCalendarName ||
				isDuplicateCalendarUrl
			);
		}
		// CalDAV
		const credentialsMissing = !caldavUsername.trim() || (!noCredentials && !caldavPassword.trim());
		return (
			!caldavHost.trim() ||
			!caldavFolderName.trim() ||
			credentialsMissing ||
			isDuplicateCaldavFolderName
		);
	}, [
		isSubmitting,
		calendarType,
		calendarUrl,
		calendarName,
		selectedColor,
		urlError,
		isDuplicateCalendarName,
		isDuplicateCalendarUrl,
		noCredentials,
		caldavUsername,
		caldavPassword,
		caldavHost,
		caldavFolderName,
		isDuplicateCaldavFolderName
	]);

	return (
		<Container
			data-testid={'add-external-calendar-modal'}
			padding={{ all: 'small' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader
				onClose={onClose}
				title={t('action.add_external_calendars', 'Add external calendars')}
			/>
			<Padding top="medium" />
			<Select
				label={`${t('label.type', 'Type')}*`}
				items={calendarTypeItems}
				defaultSelection={calendarTypeItems[0]}
				disabled={isSubmitting}
				onChange={(value): void => {
					if (value) {
						setCalendarType(value as CalendarType);
						setCalendarUrl('');
					}
				}}
			/>
			<Padding top="medium" />

			{calendarType === CALENDAR_TYPE_ICS ? (
				<AddExternalCalendarModalIcsFlow
					calendarUrl={calendarUrl}
					urlError={urlError}
					urlDescription={urlDescription}
					isDuplicateCalendarUrl={isDuplicateCalendarUrl}
					isSubmitting={isSubmitting}
					calendarName={calendarName}
					isDuplicateCalendarName={isDuplicateCalendarName}
					selectedColor={selectedColor}
					colorItems={colorItems}
					onCalendarUrlChange={setCalendarUrl}
					onCalendarNameChange={setCalendarName}
					onSelectedColorChange={setSelectedColor}
				/>
			) : (
				<AddExternalCalendarModalCaldavFlow
					caldavHost={caldavHost}
					caldavFolderName={caldavFolderName}
					isDuplicateCaldavFolderName={isDuplicateCaldavFolderName}
					noCredentials={noCredentials}
					caldavUsername={caldavUsername}
					caldavPassword={caldavPassword}
					isSubmitting={isSubmitting}
					onCaldavHostChange={setCaldavHost}
					onCaldavFolderNameChange={setCaldavFolderName}
					onNoCredentialsChange={setNoCredentials}
					onCaldavUsernameChange={setCaldavUsername}
					onCaldavPasswordChange={setCaldavPassword}
				/>
			)}

			<Padding top="medium" />
			<ModalFooter onConfirm={onConfirm} label={t('label.add', 'Add')} disabled={isAddDisabled} />
		</Container>
	);
};
