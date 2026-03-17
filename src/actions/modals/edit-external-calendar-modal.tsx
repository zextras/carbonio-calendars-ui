/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo, useState, useCallback } from 'react';

import { Container, Input, Padding, Select, useSnackbar } from '@zextras/carbonio-design-system';
import { useFolder, useFoldersMap } from '@zextras/carbonio-ui-commons';
import { compact, includes, map } from 'lodash';
import { useTranslation } from 'react-i18next';

import ModalFooter from '../../commons/modal-footer';
import { buildCalendarColorItems, CalendarColorLabelFactory } from 'commons/calendar-color-picker';
import { ModalHeader } from 'commons/modal-header';
import { FOLDER_OPERATIONS } from 'constants/api';
import { CALENDARS_STANDARD_COLORS } from 'constants/calendar';
import { folderAction } from 'store/actions/calendar-actions';

type EditExternalCalendarModalProps = {
	folderId: string;
	onClose: () => void;
};

// Derive a CALENDARS_STANDARD_COLORS index string from a folder that may carry
// only an `rgb` hex string (as external ICS calendars do) rather than a numeric
// `color` index.
const resolveColorIndex = (color: number | undefined, rgb: string | undefined): string => {
	if (color !== undefined) {
		return color.toString();
	}
	if (rgb) {
		const idx = CALENDARS_STANDARD_COLORS.findIndex(
			(c) => c.color.toLowerCase() === rgb.toLowerCase()
		);
		if (idx !== -1) return idx.toString();
	}
	return '0';
};

export const EditExternalCalendarModal = ({
	folderId,
	onClose
}: EditExternalCalendarModalProps): JSX.Element => {
	const [t] = useTranslation();
	const folder = useFolder(folderId);
	const folders = useFoldersMap();
	const createSnackbar = useSnackbar();

	const [calendarName, setCalendarName] = useState(folder?.name ?? '');
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Initialise from rgb when color index is absent (typical for ICS-from-URL calendars).
	const originalColorIndex = useMemo(() => resolveColorIndex(folder?.color, folder?.rgb), [folder]);
	const [selectedColor, setSelectedColor] = useState(originalColorIndex);

	const appointmentFolderNames = useMemo(
		() =>
			map(folders, (f) =>
				f.view === 'appointment' && f.id !== folderId ? f.name.trim().toLowerCase() : null
			),
		[folders, folderId]
	);

	const isDuplicateCalendarName = useMemo(
		() =>
			!isSubmitting ? includes(appointmentFolderNames, calendarName.trim().toLowerCase()) : false,
		[appointmentFolderNames, calendarName, isSubmitting]
	);

	const colorItems = useMemo(
		() => buildCalendarColorItems((colorLabel) => t(`colors.${colorLabel}`)),
		[t]
	);

	const selectedRgb = useMemo(
		() =>
			CALENDARS_STANDARD_COLORS[Number(selectedColor)]?.color ?? CALENDARS_STANDARD_COLORS[0].color,
		[selectedColor]
	);

	const onConfirm = useCallback((): void => {
		if (isSubmitting || !folder) {
			return;
		}

		const hasNameChanged = calendarName.trim() !== folder.name;
		// Compare against the derived original index so rgb-only folders detect changes correctly.
		const hasColorChanged = selectedColor !== originalColorIndex;

		if (!hasNameChanged && !hasColorChanged) {
			onClose();
			return;
		}

		setIsSubmitting(true);

		const actions = compact([
			hasNameChanged
				? { op: FOLDER_OPERATIONS.RENAME, name: calendarName.trim(), id: folderId }
				: undefined,
			hasColorChanged ? { op: FOLDER_OPERATIONS.COLOR, rgb: selectedRgb, id: folderId } : undefined
		]);

		if (actions.length > 0) {
			folderAction(actions.length > 1 ? actions : actions[0])
				.then((res: { Fault?: string }) => {
					if (!res.Fault) {
						createSnackbar({
							key: 'edit-external-calendar-success',
							replace: true,
							severity: 'success',
							hideButton: true,
							label: t('label.changes_saved', 'Changes saved'),
							autoHideTimeout: 3000
						});
					} else {
						createSnackbar({
							key: 'edit-external-calendar-error',
							replace: true,
							severity: 'error',
							hideButton: true,
							label: t('label.error_try_again', 'Something went wrong, please try again'),
							autoHideTimeout: 3000
						});
					}
					onClose();
				})
				.catch(() => {
					setIsSubmitting(false);
					createSnackbar({
						key: 'edit-external-calendar-error',
						replace: true,
						severity: 'error',
						hideButton: true,
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000
					});
				});
		} else {
			onClose();
		}
	}, [
		isSubmitting,
		folder,
		calendarName,
		selectedColor,
		originalColorIndex,
		folderId,
		onClose,
		createSnackbar,
		t,
		selectedRgb
	]);

	if (!folder) {
		return <Container>{t('label.loading', 'Loading...')}</Container>;
	}

	return (
		<Container
			data-testid={'edit-external-calendar-modal'}
			padding={{ all: 'small' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader onClose={onClose} title={t('action.edit_calendar', 'Edit calendar')} />
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
				defaultSelection={colorItems[Number(originalColorIndex)]}
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
				secondaryAction={onClose}
				secondaryBtnType={'outlined'}
				label={t('label.ok', 'OK')}
				secondaryLabel={t('label.cancel', 'Cancel')}
				primaryMinWidth={'6.5rem'}
				secondaryMinWidth={'6.5rem'}
				disabled={!calendarName.trim() || isSubmitting || isDuplicateCalendarName}
			/>
		</Container>
	);
};
