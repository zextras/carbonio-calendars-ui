/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState } from 'react';

import { Container, Input, Padding, Tooltip, useSnackbar } from '@zextras/carbonio-design-system';
import { useFolder } from '@zextras/carbonio-ui-commons';
import { compact } from 'lodash';
import { useTranslation } from 'react-i18next';

import ModalFooter from '../../commons/modal-footer';
import {
	showChangesSavedSnackbar,
	showErrorTryAgainSnackbar,
	useDuplicateCalendarNameValidation
} from './edit-caldav-modal-helpers';
import { ModalHeader } from 'commons/modal-header';
import { CalendarColorPicker, resolveCalendarColorHex } from 'commons/calendar-color-picker';
import { FOLDER_OPERATIONS } from 'constants/api';
import { folderAction } from 'store/actions/calendar-actions';

type EditCaldavChildCalendarModalProps = {
	folderId: string;
	onClose: () => void;
};

export const EditCaldavChildCalendarModal = ({
	folderId,
	onClose: onCloseProp
}: EditCaldavChildCalendarModalProps): JSX.Element => {
	const [t] = useTranslation();
	const folder = useFolder(folderId);
	const createSnackbar = useSnackbar();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
	const [calendarName, setCalendarName] = useState(folder?.name ?? '');

	const onClose = useCallback(() => {
		if (isColorPickerOpen) {
			return;
		}
		onCloseProp();
	}, [onCloseProp, isColorPickerOpen]);
	const defaultColorHex = useMemo(
		() => resolveCalendarColorHex(folder?.color, folder?.rgb),
		[folder?.color, folder?.rgb]
	);
	const [selectedColorHex, setSelectedColorHex] = useState(defaultColorHex);
	const normalizedCurrentName = (folder?.name ?? '').trim().toLowerCase();
	const isReadOnly = folder?.perm && !/w/.test(folder.perm);
	const nameDisabledTooltip = t(
		'cannot_edit_caldav_calendar',
		'You cannot edit the name of this calendar'
	);

	const isDuplicateCalendarName = useDuplicateCalendarNameValidation({
		folderId,
		calendarName,
		normalizedCurrentName
	});

	const onConfirm = (): void => {
		if (!folder || isSubmitting) {
			return;
		}

		const trimmedName = calendarName.trim();
		const hasNameChanged = trimmedName !== folder.name;
		const hasColorChanged = selectedColorHex !== defaultColorHex;

		if (!hasNameChanged && !hasColorChanged) {
			showChangesSavedSnackbar(createSnackbar, 'edit-caldav-child-calendar-success', t);
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
			hasColorChanged
				? { op: FOLDER_OPERATIONS.COLOR, rgb: selectedColorHex, id: folderId }
				: undefined
		]);

		if (actions.length > 0) {
			folderAction(actions.length > 1 ? actions : actions[0])
				.then((res: { Fault?: string }) => {
					if (res.Fault) {
						showErrorTryAgainSnackbar(createSnackbar, 'edit-caldav-child-calendar-error', t);
						setIsSubmitting(false);
						return;
					}

					showChangesSavedSnackbar(createSnackbar, 'edit-caldav-child-calendar-success', t);
					onClose();
				})
				.catch(() => {
					setIsSubmitting(false);
					showErrorTryAgainSnackbar(createSnackbar, 'edit-caldav-child-calendar-error', t);
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
					disabled={isSubmitting || isColorPickerOpen}
					onChange={(event): void => setCalendarName(event.target.value)}
				/>
			)}
			<Padding top="medium" />
			<CalendarColorPicker
				value={selectedColorHex}
				onChange={setSelectedColorHex}
				onOpenChange={setIsColorPickerOpen}
				disabled={isSubmitting}
			/>
			<Padding top="medium" />
			<ModalFooter
				onConfirm={onConfirm}
				label={t('label.save_changes', 'Save Changes')}
				disabled={
					!calendarName.trim() || isSubmitting || isDuplicateCalendarName || isColorPickerOpen
				}
			/>
		</Container>
	);
};
