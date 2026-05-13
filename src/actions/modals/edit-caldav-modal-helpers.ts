/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CreateSnackbarFn } from '@zextras/carbonio-design-system';
import { useFoldersMap } from '@zextras/carbonio-ui-commons';
import { includes, map } from 'lodash';
import { useMemo } from 'react';

type TranslationFn = (key: string, defaultValue: string) => string;

type DuplicateNameValidationProps = {
	folderId: string;
	calendarName: string;
	normalizedCurrentName: string;
};

const SNACKBAR_TIMEOUT_MS = 3000;

export const useDuplicateCalendarNameValidation = ({
	folderId,
	calendarName,
	normalizedCurrentName
}: DuplicateNameValidationProps): boolean => {
	const folders = useFoldersMap();

	const appointmentFolderNames = useMemo(
		() =>
			map(folders, (folder) =>
				folder.view === 'appointment' && folder.id !== folderId
					? folder.name.trim().toLowerCase()
					: null
			),
		[folders, folderId]
	);

	return useMemo(() => {
		const normalizedInputName = calendarName.trim().toLowerCase();
		if (normalizedInputName === normalizedCurrentName) {
			return false;
		}

		return includes(appointmentFolderNames, normalizedInputName);
	}, [appointmentFolderNames, calendarName, normalizedCurrentName]);
};

export const showErrorTryAgainSnackbar = (
	createSnackbar: CreateSnackbarFn,
	snackbarKey: string,
	t: TranslationFn
): void => {
	createSnackbar({
		key: snackbarKey,
		replace: true,
		severity: 'error',
		hideButton: true,
		label: t('label.error_try_again', 'Something went wrong, please try again'),
		autoHideTimeout: SNACKBAR_TIMEOUT_MS
	});
};

export const showChangesSavedSnackbar = (
	createSnackbar: CreateSnackbarFn,
	snackbarKey: string,
	t: TranslationFn
): void => {
	createSnackbar({
		key: snackbarKey,
		replace: true,
		severity: 'success',
		hideButton: true,
		label: t('label.changes_saved', 'Changes saved'),
		autoHideTimeout: SNACKBAR_TIMEOUT_MS
	});
};
