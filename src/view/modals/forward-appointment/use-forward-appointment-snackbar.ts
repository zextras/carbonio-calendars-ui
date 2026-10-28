/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { SoapFault } from '@zextras/carbonio-ui-soap-lib';

import { getAppointmentSendErrorLabel } from 'soap/errors/send-to-distribution-list-denied';

type SnackbarHandlers = {
	showErrorSnackbar: (fault?: SoapFault) => void;
	showSuccessSnackbar: () => void;
};

export const useForwardAppointmentSnackbar = (): SnackbarHandlers => {
	const createSnackbar = useSnackbar();

	const showErrorSnackbar = useCallback(
		(fault?: SoapFault): void => {
			createSnackbar({
				key: 'forward-appointment-error',
				replace: true,
				severity: 'error',
				label: getAppointmentSendErrorLabel(t, fault),
				autoHideTimeout: 3000
			});
		},
		[createSnackbar]
	);

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
