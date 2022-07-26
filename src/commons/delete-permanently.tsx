/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Text } from '@zextras/carbonio-design-system';
import { getBridgedFunctions } from '@zextras/carbonio-shell-ui';
import React, { ReactElement, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EventType } from '../types/event';
import ModalFooter from './modal-footer';
import { ModalHeader } from './modal-header';
import { deleteAppointmentPermanent } from '../store/actions/delete-appointment-permanent';
import { ActionsContext } from '../types/actions';

type DeletePermanentlyProps = {
	onClose: () => void;
	event: EventType;
	context: ActionsContext;
};

export const DeletePermanently = ({
	onClose,
	event,
	context
}: DeletePermanentlyProps): ReactElement => {
	const [t] = useTranslation();
	const title = useMemo(
		() =>
			t(
				'message.sure_to_delete_appointment_permanently',
				'Are you sure you want to delete this appointment permanently?'
			),
		[t]
	);

	const label = useMemo(() => t('label.delete_permanently', 'Delete permanently'), [t]);
	const onConfirm = useCallback(() => {
		context
			.dispatch(
				deleteAppointmentPermanent({
					inviteId: event.resource.inviteId
				})
			)
			.then((res: any) => {
				onClose();
				if (res.type.includes('fulfilled')) {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					getBridgedFunctions().createSnackbar({
						key: `delete-permanently`,
						replace: true,
						type: 'success',
						hideButton: true,
						label: getBridgedFunctions().t(
							'message.snackbar.appointment_permanently_deleted_succesfully',
							'Permanent deletion completed successfully'
						),
						autoHideTimeout: 3000
					});
				} else {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					getBridgedFunctions().createSnackbar({
						key: `delete-permanently`,
						replace: true,
						type: 'error',
						hideButton: true,
						label: getBridgedFunctions().t(
							'label.error_try_again',
							'Something went wrong, please try again'
						),
						autoHideTimeout: 3000
					});
				}
			});
	}, [context, event.resource.inviteId, onClose]);

	return (
		<Container
			padding={{ all: 'large' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader title={title} onClose={onClose} />
			<Container padding={{ top: 'large', bottom: 'large' }} crossAlignment="flex-start">
				{event?.resource?.isRecurrent ? (
					<Text overflow="break-word">
						{getBridgedFunctions().t(
							'message.modal.delete.sure_delete_appointment_all_instances_permanently',
							'This will delete all occurences of this appointment and you will not be able to recover it again, continue?'
						)}
					</Text>
				) : (
					<Text overflow="break-word">
						{getBridgedFunctions().t(
							'message.modal.delete.sure_delete_appointment_permanently',
							'By deleting permanently this appointment you will not be able to recover it anymore, continue?'
						)}
					</Text>
				)}
			</Container>
			<ModalFooter onConfirm={onConfirm} label={label} color="error" />
		</Container>
	);
};
