/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo, useState } from 'react';

import {
	Container,
	Input,
	Padding,
	Select,
	Text,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { FOLDERS, useFoldersMap } from '@zextras/carbonio-ui-commons';
import { includes, map } from 'lodash';
import { useTranslation } from 'react-i18next';

import ModalFooter from '../../commons/modal-footer';
import { buildCalendarColorItems, CalendarColorLabelFactory } from 'commons/calendar-color-picker';
import { ModalHeader } from 'commons/modal-header';
import { FOLDER_OPERATIONS } from 'constants/api';
import { CALENDARS_STANDARD_COLORS } from 'constants/calendar';
import { createFolderRequest } from 'soap/create-folder-request';
import { folderAction } from 'store/actions/calendar-actions';

export const AddIcsFromUrlModal = ({ onClose }: { onClose: () => void }): JSX.Element => {
	const [t] = useTranslation();
	const folders = useFoldersMap();
	const createSnackbar = useSnackbar();
	const [icsUrl, setIcsUrl] = useState('');
	const [calendarName, setCalendarName] = useState('');
	const [selectedColor, setSelectedColor] = useState('0');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const TRASH_FOLDER_ID = '3'; // Zimbra default trash folder id

	const appointmentFolderNames = useMemo(
		() =>
			map(folders, (folder) =>
				folder.view === 'appointment' ? folder.name.trim().toLowerCase() : null
			),
		[folders]
	);
	useMemo(
		() =>
			map(folders, (folder) =>
				folder.view === 'appointment' && folder.url ? folder.url.trim().toLowerCase() : null
			),
		[folders]
	);

	const duplicateCalendar = useMemo(
		() =>
			Object.values(folders).find(
				(folder) =>
					folder.view === 'appointment' &&
					folder.url &&
					folder.url.trim().toLowerCase() === icsUrl.trim().toLowerCase()
			),
		[folders, icsUrl]
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
		() => duplicateCalendar?.l === TRASH_FOLDER_ID,
		[duplicateCalendar]
	);

	const urlError = useMemo(() => {
		const trimmedUrl = icsUrl.trim();
		if (!trimmedUrl) {
			return undefined;
		}

		const looksLikeMissingProtocol = !trimmedUrl.includes('://') && /\./.test(trimmedUrl);
		if (looksLikeMissingProtocol) {
			return t(
				'add_ics_from_url.error.protocol',
				"The URL should begin with 'http://' or 'https://'"
			);
		}

		try {
			const parsedUrl = new URL(trimmedUrl);
			if (!/^https?:$/i.test(parsedUrl.protocol)) {
				return t(
					'add_ics_from_url.error.protocol',
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
				'add_ics_from_url.error.invalid_ics_link',
				'Invalid URL. Make sure it links directly to an .ics calendar file'
			);
		}

		return undefined;
	}, [icsUrl, t]);

	const colorItems = useMemo(
		() => buildCalendarColorItems((colorLabel) => t(`colors.${colorLabel}`)),
		[t]
	);

	const selectedRgb = useMemo(
		() =>
			CALENDARS_STANDARD_COLORS[Number(selectedColor)]?.color ?? CALENDARS_STANDARD_COLORS[0].color,
		[selectedColor]
	);

	const onConfirm = (): void => {
		if (isSubmitting) {
			return;
		}

		setIsSubmitting(true);
		createFolderRequest({
			l: FOLDERS.USER_ROOT,
			name: calendarName.trim(),
			url: icsUrl.trim(),
			rgb: selectedRgb,
			f: '#',
			view: 'appointment',
			sync: 0 // do not sync at the same time, for big/huge calendars the notify handling takes a lot of time and the folder appear very late
		})
			.then((createFolderResponse) => {
				folderAction({ id: createFolderResponse.folder[0].id, op: FOLDER_OPERATIONS.SYNC }).then(
					() => {
						createSnackbar({
							key: 'ics-url-calendar-created',
							replace: true,
							severity: 'success',
							hideButton: true,
							label: t('message.snackbar.new_calendar_added', 'Calendar added successfully'),
							autoHideTimeout: 3000
						});
						onClose();
					}
				);
			})
			.catch(() => {
				setIsSubmitting(false);
				createSnackbar({
					key: 'ics-url-calendar-create-error',
					replace: true,
					severity: 'error',
					hideButton: true,
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000
				});
			});
	};

	let urlDescription: string | undefined = urlError;
	if (!urlDescription && isDuplicateCalendarUrl) {
		if (isDuplicateInTrash) {
			urlDescription = t(
				'add_ics_from_url.error.duplicate_calendar_url_trash',
				'A calendar with the same URL already exists in your Trash. Please restore it or permanently delete it before adding again.'
			);
		} else {
			urlDescription = t(
				'add_ics_from_url.error.duplicate_calendar_url',
				'A calendar with the same URL has already been added'
			);
		}
	}

	return (
		<Container
			data-testid={'add-ics-from-url-modal'}
			padding={{ all: 'small' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader onClose={onClose} title={t('action.add_ics_from_url', 'Add ICS from URL')} />
			<Padding top="medium" />
			<Text size="small" color="secondary">
				{t(
					'add_ics_from_url.description',
					'Paste the .ics URL of the calendar you would like to add.'
				)}
			</Text>
			<Padding top="16px" />
			<Input
				label={t('add_ics_from_url.url', 'Calendar URL*')}
				background={'gray5'}
				hasError={!!urlError || isDuplicateCalendarUrl}
				description={urlDescription}
				value={icsUrl}
				disabled={isSubmitting}
				onChange={(event): void => setIcsUrl(event.target.value)}
			/>
			{!urlError && !isDuplicateCalendarUrl && (
				<>
					<Padding top="extrasmall" />
					<Text size="small" color="secondary">
						{t(
							'add_ics_from_url.sync_info',
							'This calendar will be read-only and will sync every 12 hours'
						)}
					</Text>
				</>
			)}
			<Padding top="medium" />
			<Input
				label={t('add_ics_from_url.calendar_name', 'Calendar name*')}
				background={'gray5'}
				hasError={isDuplicateCalendarName}
				description={
					isDuplicateCalendarName
						? t(
								'add_ics_from_url.error.duplicate_calendar_name',
								'A calendar with the same name already exists'
							)
						: undefined
				}
				value={calendarName}
				disabled={isSubmitting}
				onChange={(event): void => setCalendarName(event.target.value)}
			/>
			<Padding top="medium" />
			<Select
				label={t('label.select_color', 'Select color')}
				items={colorItems}
				defaultSelection={colorItems[0]}
				LabelFactory={CalendarColorLabelFactory}
				disabled={isSubmitting}
				onChange={(value): void => {
					if (value) {
						setSelectedColor(value);
					}
				}}
			/>
			<Padding top="medium" />
			<ModalFooter
				onConfirm={onConfirm}
				label={t('label.add', 'Add')}
				disabled={
					!icsUrl.trim() ||
					!calendarName.trim() ||
					selectedColor === '' ||
					isSubmitting ||
					!!urlError ||
					isDuplicateCalendarName ||
					isDuplicateCalendarUrl
				}
			/>
		</Container>
	);
};
