/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo, useState, useCallback } from 'react';

import {
	Button,
	Container,
	Input,
	Padding,
	Text,
	Tooltip,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { copyToClipboard, useFolder, useFoldersMap } from '@zextras/carbonio-ui-commons';
import { compact, includes, map } from 'lodash';
import { useTranslation } from 'react-i18next';

import ModalFooter from '../../commons/modal-footer';
import { CalendarColorPicker, resolveCalendarColorHex } from 'commons/calendar-color-picker';
import { ModalHeader } from 'commons/modal-header';
import { FOLDER_OPERATIONS } from 'constants/api';
import { folderAction } from 'store/actions/calendar-actions';

type EditExternalCalendarModalProps = {
	folderId: string;
	onClose: () => void;
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

	const defaultColorHex = useMemo(
		() => resolveCalendarColorHex(folder?.color, folder?.rgb),
		[folder?.color, folder?.rgb]
	);
	const [selectedColorHex, setSelectedColorHex] = useState(defaultColorHex);
	const genericErrorLabel = t('label.error_try_again', 'Something went wrong, please try again');

	const appointmentFolderNames = useMemo(
		() =>
			map(folders, (f) =>
				f.view === 'appointment' && f.id !== folderId ? f.name.trim().toLowerCase() : null
			),
		[folders, folderId]
	);

	const isDuplicateCalendarName = useMemo(
		() =>
			isSubmitting ? false : includes(appointmentFolderNames, calendarName.trim().toLowerCase()),
		[appointmentFolderNames, calendarName, isSubmitting]
	);

	const onCopyUrl = useCallback((): void => {
		if (!folder?.url) {
			return;
		}

		copyToClipboard(folder.url)
			.then(() => {
				createSnackbar({
					key: 'edit-external-calendar-url-copied',
					replace: true,
					severity: 'success',
					hideButton: true,
					label: t('snackbar.url_copied', {
						title: t('label.url', 'URL'),
						defaultValue: '{{title}} copied'
					}),
					autoHideTimeout: 3000
				});
			})
			.catch(() => {
				createSnackbar({
					key: 'edit-external-calendar-url-copy-error',
					replace: true,
					severity: 'error',
					hideButton: true,
					label: genericErrorLabel,
					autoHideTimeout: 3000
				});
			});
	}, [folder?.url, createSnackbar, t, genericErrorLabel]);

	const onConfirm = useCallback((): void => {
		if (isSubmitting || !folder) {
			return;
		}

		const hasNameChanged = calendarName.trim() !== folder.name;
		const hasColorChanged = selectedColorHex !== defaultColorHex;

		function successSnackbar(): void {
			createSnackbar({
				key: 'edit-external-calendar-success',
				replace: true,
				severity: 'success',
				hideButton: true,
				label: t('label.changes_saved', 'Changes saved'),
				autoHideTimeout: 3000
			});
		}

		if (!hasNameChanged && !hasColorChanged) {
			onClose();
			successSnackbar();
			return;
		}

		setIsSubmitting(true);

		const actions = compact([
			hasNameChanged
				? { op: FOLDER_OPERATIONS.RENAME, name: calendarName.trim(), id: folderId }
				: undefined,
			hasColorChanged
				? { op: FOLDER_OPERATIONS.COLOR, rgb: selectedColorHex, id: folderId }
				: undefined
		]);

		if (actions.length > 0) {
			folderAction(actions.length > 1 ? actions : actions[0])
				.then((res: { Fault?: string }) => {
					if (res.Fault) {
						createSnackbar({
							key: 'edit-external-calendar-error',
							replace: true,
							severity: 'error',
							hideButton: true,
							label: genericErrorLabel,
							autoHideTimeout: 3000
						});
					} else {
						successSnackbar();
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
						label: genericErrorLabel,
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
		selectedColorHex,
		defaultColorHex,
		genericErrorLabel,
		folderId,
		onClose,
		createSnackbar,
		t
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
			<Padding top={'small'} />
			<Container orientation="horizontal" width="fill" mainAlignment="space-between">
				<Tooltip label={folder.url ?? '-'} placement="right" maxWidth="100%">
					<Text
						style={{
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis'
						}}
					>
						{t('label.url', 'URL')}: {folder.url ?? '-'}
					</Text>
				</Tooltip>
				<Padding horizontal={'extrasmall'} />
				<Tooltip label={t('tooltip.copy_url', 'Copy URL')} placement="top">
					<Button
						type="ghost"
						color="primary"
						icon="Copy"
						onClick={onCopyUrl}
						disabled={!folder.url}
						style={{ width: 'max-content' }}
					/>
				</Tooltip>
			</Container>
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
			<CalendarColorPicker
				value={selectedColorHex}
				onChange={setSelectedColorHex}
				disabled={isSubmitting}
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
