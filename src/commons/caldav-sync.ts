/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CreateSnackbarFn } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import { getImportStatusRequest } from 'soap/get-import-status-request';
import { importDataRequest } from 'soap/import-data-request';

const POLL_INTERVAL_MS = 10000;

/**
 * Triggers a CalDAV sync for the given data-source id:
 *  1. Shows a "sync started" snackbar (first-sync variant when isFirstSync=true).
 *  2. Calls importData for the data source.
 *  3. Polls getImportStatus every POLL_INTERVAL_MS until the job finishes
 *     and replaces the snackbar with a success / error message.
 *     Polling stops immediately on any API error.
 */
export const triggerCaldavSync = (
	dsId: string,
	createSnackbar: CreateSnackbarFn,
	{ isFirstSync = false }: { isFirstSync?: boolean } = {}
): void => {
	createSnackbar({
		key: 'caldav-calendar-sync',
		replace: true,
		severity: 'info',
		hideButton: true,
		label: isFirstSync
			? t(
					'message.snackbar.caldav_first_sync_started',
					"First sync has started and may take a while. You will be notified once it's complete"
				)
			: t('message.snackbar.caldav_calendars_syncing', 'Calendars sync has started'),
		autoHideTimeout: 5000
	});

	const pollImportStatus = (attempt: number): void => {
		getImportStatusRequest()
			.then((statusResponse) => {
				const entry = statusResponse.caldav?.find((e) => e.id === dsId);

				if (!entry || entry.isRunning) {
					// Still in progress – keep polling indefinitely until done
					setTimeout(() => pollImportStatus(attempt + 1), POLL_INTERVAL_MS);
					return;
				}

				if (entry.success === false) {
					// Sync reported failure – stop polling and notify the user
					createSnackbar({
						key: 'caldav-calendar-sync-error',
						replace: true,
						severity: 'error',
						hideButton: true,
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000
					});
				} else {
					createSnackbar({
						key: 'caldav-calendar-sync',
						replace: true,
						severity: 'success',
						hideButton: true,
						label: t('message.snackbar.caldav_calendars_synced', 'Calendars synced successfully'),
						autoHideTimeout: 3000
					});
				}
			})
			.catch(() => {
				// API error – stop polling and notify the user
				createSnackbar({
					key: 'caldav-calendar-sync-error',
					replace: true,
					severity: 'error',
					hideButton: true,
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000
				});
			});
	};

	importDataRequest(dsId)
		.then(() => {
			pollImportStatus(0);
		})
		.catch(() => {
			createSnackbar({
				key: 'caldav-calendar-sync-error',
				replace: true,
				severity: 'error',
				hideButton: true,
				label: t('label.error_try_again', 'Something went wrong, please try again'),
				autoHideTimeout: 3000
			});
		});
};
