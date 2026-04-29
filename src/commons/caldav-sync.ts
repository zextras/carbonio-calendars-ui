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

/** Cancellation tokens keyed by dsId — set by triggerCaldavSync, cleared on cancel or completion. */
const activeSyncs = new Map<string, { cancelled: boolean }>();

/**
 * Cancels an in-flight CalDAV sync for the given data-source id.
 * Safe to call even if no sync is running.
 */
export const cancelCaldavSync = (dsId: string): void => {
	const token = activeSyncs.get(dsId);
	if (token) {
		token.cancelled = true;
		activeSyncs.delete(dsId);
	}
};

/**
 * Triggers a CalDAV sync for the given data-source id:
 *  1. Shows a "sync started" snackbar (first-sync variant when isFirstSync=true).
 *  2. Calls importData for the data source.
 *  3. Polls getImportStatus every POLL_INTERVAL_MS until the job finishes
 *     and replaces the snackbar with a success / error message.
 *     Polling stops immediately on any API error or when cancelCaldavSync is called.
 */
export const triggerCaldavSync = (
	dsId: string,
	createSnackbar: CreateSnackbarFn,
	{ isFirstSync = false }: { isFirstSync?: boolean } = {}
): void => {
	const token = { cancelled: false };
	activeSyncs.set(dsId, token);

	if (isFirstSync) {
		const closeSnackbar = createSnackbar({
			key: 'caldav-calendar-sync',
			replace: true,
			severity: 'info',
			hideButton: false,
			label: t(
				'message.snackbar.caldav_first_sync_started',
				"First sync has started and may take a while. You will be notified once it's complete"
			),
			disableAutoHide: true,
			actionLabel: t('label.ok', 'Ok'),
			onActionClick: () => closeSnackbar()
		});
	} else {
		createSnackbar({
			key: 'caldav-calendar-sync',
			replace: true,
			severity: 'info',
			hideButton: true,
			label: t('message.snackbar.caldav_calendars_syncing', 'Calendars sync has started'),
			autoHideTimeout: 5000
		});
	}

	const pollImportStatus = (attempt: number): void => {
		if (token.cancelled) return;

		getImportStatusRequest()
			.then((statusResponse) => {
				if (token.cancelled) return;

				const entry = statusResponse.caldav?.find((e) => e.id === dsId);

				if (!entry || entry.isRunning) {
					// Still in progress – keep polling indefinitely until done
					setTimeout(() => pollImportStatus(attempt + 1), POLL_INTERVAL_MS);
					return;
				}

				activeSyncs.delete(dsId);

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
				if (token.cancelled) return;
				activeSyncs.delete(dsId);
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
			if (token.cancelled) return;
			activeSyncs.delete(dsId);
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
