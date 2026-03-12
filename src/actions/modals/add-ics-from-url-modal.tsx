/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo, useState } from 'react';

import { Container, Input, Padding, Select, Text } from '@zextras/carbonio-design-system';
import { useFoldersMap } from '@zextras/carbonio-ui-commons';
import { includes, map } from 'lodash';
import { useTranslation } from 'react-i18next';

import ModalFooter from '../../commons/modal-footer';
import { buildCalendarColorItems, CalendarColorLabelFactory } from 'commons/calendar-color-picker';
import { ModalHeader } from 'commons/modal-header';

export const AddIcsFromUrlModal = ({ onClose }: { onClose: () => void }): JSX.Element => {
	const [t] = useTranslation();
	const folders = useFoldersMap();
	const [icsUrl, setIcsUrl] = useState('');
	const [calendarName, setCalendarName] = useState('');
	const [selectedColor, setSelectedColor] = useState('0');

	const appointmentFolderNames = useMemo(
		() =>
			map(folders, (folder) =>
				folder.view === 'appointment' ? folder.name.trim().toLowerCase() : null
			),
		[folders]
	);

	const isDuplicateCalendarName = useMemo(
		() => includes(appointmentFolderNames, calendarName.trim().toLowerCase()),
		[appointmentFolderNames, calendarName]
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

	const onConfirm = (): void => onClose();

	return (
		<Container
			data-testid={'add-ics-from-url-modal'}
			padding={{ all: 'small' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader onClose={onClose} title={t('action.add_ics_from_url', 'Add ICS from URL')} />
			<Text size="small" color="secondary">
				{t(
					'add_ics_from_url.description',
					'Paste the ICS URL of the calendar you would like to add.'
				)}
			</Text>
			<Padding top="small" />
			<Input
				label={t('add_ics_from_url.ics_url', 'Calendar ICS URL*')}
				background={'gray5'}
				hasError={!!urlError}
				description={urlError}
				value={icsUrl}
				onChange={(event): void => setIcsUrl(event.target.value)}
			/>
			{!urlError && (
				<>
					<Padding top="extrasmall" />
					<Text size="small" color="secondary">
						{t(
							'add_ics_from_url.sync_info',
							'This calendar will be read-only and will sync automatically every 12 hours'
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
				onChange={(event): void => setCalendarName(event.target.value)}
			/>
			<Padding top="medium" />
			<Select
				label={t('label.select_color', 'Select color')}
				items={colorItems}
				defaultSelection={colorItems[0]}
				LabelFactory={CalendarColorLabelFactory}
				onChange={(value): void => {
					if (value) {
						setSelectedColor(value);
					}
				}}
			/>
			<Padding top="medium" />
			<ModalFooter
				onConfirm={onConfirm}
				secondaryAction={onClose}
				secondaryBtnType={'outlined'}
				label={t('label.add', 'Add')}
				secondaryLabel={t('label.cancel', 'Cancel')}
				disabled={
					!icsUrl.trim() ||
					!calendarName.trim() ||
					selectedColor === '' ||
					!!urlError ||
					isDuplicateCalendarName
				}
			/>
		</Container>
	);
};
