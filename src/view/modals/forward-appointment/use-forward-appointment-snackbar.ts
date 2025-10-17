/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

type SnackbarHandlers = {
	showErrorSnackbar: () => void;
	showSuccessSnackbar: () => void;
};

export const useForwardAppointmentSnackbar = (): SnackbarHandlers => {
	const createSnackbar = useSnackbar();

	const showErrorSnackbar = useCallback((): void => {
		createSnackbar({
			key: 'forward-appointment-error',
			replace: true,
			severity: 'error',
			label: t('label.error_try_again', 'Something went wrong, please try again'),
			autoHideTimeout: 3000
		});
	}, [createSnackbar]);

	const showSuccessSnackbar = useCallback((): void => {
		createSnackbar({
			key: 'forward-appointment-success',
			replace: true,
			severity: 'info',
			hideButton: false,
			label: t('snackbar.forwardAppointment.success', 'Appointment forwarded'),
			autoHideTimeout: 3000
		});
	}, [createSnackbar]);

	return {
		showErrorSnackbar,
		showSuccessSnackbar
	};
};
