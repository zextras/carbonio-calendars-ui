/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { Container, Text, useSnackbar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';
import { deleteAppointmentPermanent } from '../../store/actions/delete-appointment-permanent';
import { useAppDispatch } from '../../store/redux/hooks';
import { EventType } from '../../types/event';

type DeletePermanentlyProps = {
	onClose: () => void;
	event: EventType;
};

export const DeletePermanently = ({ onClose, event }: DeletePermanentlyProps): JSX.Element => {
	const [t] = useTranslation();
	const dispatch = useAppDispatch();
	const createSnackbar = useSnackbar();

	const title = useMemo(
		() =>
			t(
				'message.sure_to_delete_appointment_permanently',
				'Are you sure you want to delete this appointment permanently?'
			),
		[t]
	);

	const label = useMemo(() => t('label.delete_permanently', 'Delete permanently'), [t]);

	const description = useMemo(
		() =>
			event.resource.isRecurrent
				? t(
						'message.modal.delete.sure_delete_appointment_all_instances_permanently',
						'This will delete all occurrences of this appointment and you will not be able to recover it again, continue?'
					)
				: t(
						'message.modal.delete.sure_delete_appointment_permanently',
						'By deleting permanently this appointment you will not be able to recover it anymore, continue?'
					),
		[event.resource.isRecurrent, t]
	);
	const onConfirm = useCallback(() => {
		dispatch(
			deleteAppointmentPermanent({
				id: event.resource.id
			})
		).then((res) => {
			onClose();
			if (res.type.includes('fulfilled')) {
				createSnackbar({
					key: `delete-permanently`,
					replace: true,
					severity: 'success',
					hideButton: true,
					label: t(
						'message.snackbar.appointment_permanently_deleted_succesfully',
						'Permanent deletion completed successfully'
					),
					autoHideTimeout: 3000
				});
			} else {
				createSnackbar({
					key: `delete-permanently`,
					replace: true,
					severity: 'error',
					hideButton: true,
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000
				});
			}
		});
	}, [createSnackbar, dispatch, event.resource.id, onClose, t]);

	return (
		<Container
			padding={{ all: 'large' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader title={title} onClose={onClose} />
			<Container padding={{ top: 'large', bottom: 'large' }} crossAlignment="flex-start">
				<Text overflow="break-word">{description}</Text>
			</Container>
			<ModalFooter onConfirm={onConfirm} label={label} color="error" />
		</Container>
	);
};
