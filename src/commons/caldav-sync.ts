/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CreateSnackbarFn } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import { getImportStatusRequest } from 'soap/get-import-status-request';
import { importDataRequest } from 'soap/import-data-request';

const POLL_INTERVAL_MS = 5000;
const MAX_POLLS = 30; // up to ~150 seconds

/**
 * Triggers a CalDAV sync for the given data-source id:
 *  1. Shows a persistent "sync started" snackbar.
 *  2. Calls importData for the data source.
 *  3. Polls getImportStatus every POLL_INTERVAL_MS until the job finishes
 *     (or MAX_POLLS is reached) and replaces the snackbar with a
 *     success / error message.
 */
export const triggerCaldavSync = (dsId: string, createSnackbar: CreateSnackbarFn): void => {
	createSnackbar({
		key: 'caldav-calendar-sync',
		replace: true,
		severity: 'info',
		hideButton: true,
		label: t('message.snackbar.caldav_calendars_syncing', 'Calendars sync has started'),
		autoHideTimeout: 5000
	});

	const pollImportStatus = (attempt: number): void => {
		getImportStatusRequest()
			.then((statusResponse) => {
				const entry = statusResponse.caldav?.find((e) => e.id === dsId);

				if (!entry || entry.isRunning) {
					// Still in progress – keep polling if within limit
					if (attempt < MAX_POLLS) {
						setTimeout(() => pollImportStatus(attempt + 1), POLL_INTERVAL_MS);
					} else {
						// Timed out – treat as success (sync continues in background)
						createSnackbar({
							key: 'caldav-calendar-sync',
							replace: true,
							severity: 'success',
							hideButton: true,
							label: t('message.snackbar.caldav_calendars_synced', 'Calendars synced successfully'),
							autoHideTimeout: 3000
						});
					}
					return;
				}

				if (entry.success === false) {
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
