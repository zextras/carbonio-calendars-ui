/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Text } from '@zextras/carbonio-design-system';
import {
	closeBoard,
	getBridgedFunctions,
	replaceHistory,
	useBoard,
	t
} from '@zextras/carbonio-shell-ui';
import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';
import { selectEditorAttendees, selectEditorPanel } from '../../store/selectors/editor';
import { Editor } from '../../types/editor';

type ModalProps = {
	onClose: () => void;
	action: any;
	isNew?: boolean;
	isSending?: boolean;
	editorId: string;
	editor: Editor;
};

export const SeriesEditWarningModal = ({
	onClose,
	action,
	isSending = false,
	isNew,
	editorId,
	editor
}: ModalProps): JSX.Element => {
	const message = useMemo(
		() =>
			t(
				'message.edit_series_warning',
				'As you proceed with the series modification, all previously deleted or modified instances will be restored with the new series settings.'
			),
		[]
	);

	const board = useBoard();
	const panel = useSelector(selectEditorPanel(editorId));
	const attendeesLength = useSelector(selectEditorAttendees)?.length;

	const title = useMemo(() => t('label.warning', 'Warning'), []);
	const label = useMemo(() => t('label.continue', 'Continue'), []);
	const secondaryActionLabel = useMemo(() => t('label.discard_changes', 'Discard Changes'), []);
	const dispatch = useDispatch();

	const onConfirm = useCallback(() => {
		isSending
			? action({ isNew, editor, dispatch }).then(({ response }: any) => {
					if (panel && response) {
						replaceHistory('');
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
			: action({ draft: !attendeesLength, isNew, editor, dispatch }).then(({ response }: any) => {
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
	}, [action, attendeesLength, dispatch, editor, isNew, isSending, onClose, panel]);

	const onDiscard = useCallback(() => {
		onClose();
		if (panel) {
			replaceHistory('');
		} else if (board) {
			closeBoard(board?.id);
		}
	}, [board, onClose, panel]);
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
