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
	Tooltip,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useFolder, useFoldersMap } from '@zextras/carbonio-ui-commons';
import { compact, includes, map } from 'lodash';
import { useTranslation } from 'react-i18next';

import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from 'commons/modal-header';
import { buildCalendarColorItems, CalendarColorLabelFactory } from 'commons/calendar-color-picker';
import { FOLDER_OPERATIONS } from 'constants/api';
import { CALENDARS_STANDARD_COLORS } from 'constants/calendar';
import { folderAction } from 'store/actions/calendar-actions';

type EditCaldavChildCalendarModalProps = {
	folderId: string;
	onClose: () => void;
};

export const EditCaldavChildCalendarModal = ({
	folderId,
	onClose
}: EditCaldavChildCalendarModalProps): JSX.Element => {
	const [t] = useTranslation();
	const folder = useFolder(folderId);
	const folders = useFoldersMap();
	const createSnackbar = useSnackbar();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [calendarName, setCalendarName] = useState(folder?.name ?? '');
	const [selectedColor, setSelectedColor] = useState(
		folder?.rgb
			? CALENDARS_STANDARD_COLORS.findIndex(
					(c) => c.color.toLowerCase() === folder.rgb?.toLowerCase()
				).toString()
			: '0'
	);
	const normalizedCurrentName = (folder?.name ?? '').trim().toLowerCase();
	const isReadOnly = folder?.perm && !/w/.test(folder.perm);
	const nameDisabledTooltip = t(
		'cannot_edit_caldav_readonly',
		'You cannot edit the name of a read-only calendar'
	);

	const originalColorIndex = folder?.rgb
		? CALENDARS_STANDARD_COLORS.findIndex(
				(c) => c.color.toLowerCase() === folder.rgb?.toLowerCase()
			).toString()
		: '0';

	const appointmentFolderNames = useMemo(
		() =>
			map(folders, (f) =>
				f.view === 'appointment' && f.id !== folderId ? f.name.trim().toLowerCase() : null
			),
		[folders, folderId]
	);

	const isDuplicateCalendarName = useMemo(() => {
		const normalizedInputName = calendarName.trim().toLowerCase();
		if (normalizedInputName === normalizedCurrentName) {
			return false;
		}

		return includes(appointmentFolderNames, normalizedInputName);
	}, [appointmentFolderNames, calendarName, normalizedCurrentName]);

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
		if (!folder || isSubmitting) {
			return;
		}

		const trimmedName = calendarName.trim();
		const hasNameChanged = trimmedName !== folder.name;
		const hasColorChanged = selectedColor !== originalColorIndex;

		if (!hasNameChanged && !hasColorChanged) {
			onClose();
			return;
		}

		if (hasNameChanged && (!trimmedName || isDuplicateCalendarName || isReadOnly)) {
			return;
		}

		setIsSubmitting(true);

		const actions = compact([
			hasNameChanged && !isReadOnly
				? { op: FOLDER_OPERATIONS.RENAME, name: trimmedName, id: folderId }
				: undefined,
			hasColorChanged ? { op: FOLDER_OPERATIONS.COLOR, rgb: selectedRgb, id: folderId } : undefined
		]);

		if (actions.length > 0) {
			folderAction(actions.length > 1 ? actions : actions[0])
				.then((res: { Fault?: string }) => {
					if (res.Fault) {
						createSnackbar({
							key: 'edit-caldav-child-calendar-error',
							replace: true,
							severity: 'error',
							hideButton: true,
							label: t('label.error_try_again', 'Something went wrong, please try again'),
							autoHideTimeout: 3000
						});
						setIsSubmitting(false);
						return;
					}

					createSnackbar({
						key: 'edit-caldav-child-calendar-success',
						replace: true,
						severity: 'success',
						hideButton: true,
						label: t('label.changes_saved', 'Changes saved'),
						autoHideTimeout: 3000
					});
					onClose();
				})
				.catch(() => {
					setIsSubmitting(false);
					createSnackbar({
						key: 'edit-caldav-child-calendar-error',
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
	};

	return (
		<Container
			data-testid={'edit-caldav-child-calendar-modal'}
			padding={{ all: 'small' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader onClose={onClose} title={t('action.edit_calendar', 'Edit calendar')} />
			<Padding top="medium" />
			{isReadOnly ? (
				<Tooltip label={nameDisabledTooltip} placement="top" maxWidth="fit-content">
					<Input
						label={`${t('label.calendars_name', "Calendars' name")}*`}
						background={'gray5'}
						value={calendarName}
						disabled
					/>
				</Tooltip>
			) : (
				<Input
					label={`${t('label.calendars_name', "Calendars' name")}*`}
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
			)}
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
				label={t('label.save_changes', 'Save Changes')}
				disabled={!calendarName.trim() || isSubmitting || isDuplicateCalendarName}
			/>
		</Container>
	);
};
