/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Text } from '@zextras/carbonio-design-system';
import { getBridgedFunctions, t } from '@zextras/carbonio-shell-ui';
import React, { useCallback, useMemo } from 'react';
import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';

type ModalProps = {
	onClose: () => void;
	action: any;
	isNew?: boolean;
	draft?: boolean;
	isSending?: boolean;
	closeCurrentEditor: any;
};

export const SeriesEditWarningModal = ({
	onClose,
	action,
	isSending = false,
	isNew,
	draft,
	closeCurrentEditor
}: ModalProps): JSX.Element => {
	const message = useMemo(
		() =>
			t(
				'message.edit_series_warning',
				'As you proceed with the series modification, all previously deleted or modified instances will be restored with the new series settings.'
			),
		[]
	);

	const title = useMemo(() => t('label.warning', 'Warning'), []);
	const label = useMemo(() => t('label.continue', 'Continue'), []);
	const secondaryActionLabel = useMemo(() => t('label.discard_changes', 'Discard Changes'), []);
	const onConfirm = useCallback(() => {
		isSending
			? action(isNew).then(({ response }: any) => {
					if (response) {
						closeCurrentEditor();
					}
					getBridgedFunctions().createSnackbar({
						key: `calendar-moved-root`,
						replace: true,
						type: response ? 'info' : 'warning',
						hideButton: true,
						label: !response
							? t('label.error_try_again', 'Something went wrong, please try again')
							: t('message.appointment_invitation_sent', 'Appointment invitation sent'),
						autoHideTimeout: 3000
					});
					onClose();
			  })
			: action({ draft, isNew }).then(({ response }: any) => {
					getBridgedFunctions().createSnackbar({
						key: `calendar-moved-root`,
						replace: true,
						type: response ? 'info' : 'warning',
						hideButton: true,
						label: !response
							? t('label.error_try_again', 'Something went wrong, please try again')
							: t('message.snackbar.calendar_edits_saved', 'Edits saved correctly'),
						autoHideTimeout: 3000
					});
					onClose();
			  });
	}, [action, closeCurrentEditor, draft, isNew, isSending, onClose]);

	const onDiscard = useCallback(() => {
		onClose();
		closeCurrentEditor();
	}, [closeCurrentEditor, onClose]);
	return (
		<Container
			padding={{ all: 'large' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader title={title} onClose={onClose} />
			<Container padding={{ top: 'large', bottom: 'large' }} crossAlignment="flex-start">
				<Text overflow="break-word">{message}</Text>
			</Container>
			<ModalFooter
				onConfirm={onConfirm}
				label={label}
				secondaryAction={onDiscard}
				secondaryLabel={secondaryActionLabel}
				secondaryBtnType="outlined"
				secondaryColor="primary"
				additionalAction={onClose}
			/>
		</Container>
	);
};
