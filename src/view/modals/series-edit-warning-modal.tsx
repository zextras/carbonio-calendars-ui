/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo } from 'react';

import { Container, Text, useSnackbar } from '@zextras/carbonio-design-system';
import { closeBoard, useBoard, t } from '@zextras/carbonio-shell-ui';

import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';
import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import {
	selectEditorAttendees,
	selectEditorEquipment,
	selectEditorMeetingRoom
} from '../../store/selectors/editor';
import { Editor, NotifyAttendeesOverride } from '../../types/editor';

type ModalProps = {
	onClose: () => void;
	action: any;
	isNew?: boolean;
	isSending?: boolean;
	editorId: string;
	editor: Editor;
	notifyAttendees?: NotifyAttendeesOverride;
	draftOverride?: boolean;
};

export const SeriesEditWarningModal = ({
	onClose,
	action,
	isSending = false,
	isNew,
	editorId,
	editor,
	notifyAttendees,
	draftOverride
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
	const attendeesLength = useAppSelector(selectEditorAttendees(editorId))?.length;
	const meetingRoomLength = useAppSelector(selectEditorMeetingRoom(editorId))?.length;
	const equipmentsLength = useAppSelector(selectEditorEquipment(editorId))?.length;
	const dispatch = useAppDispatch();
	const createSnackbar = useSnackbar();

	const title = useMemo(() => t('label.warning', 'Warning'), []);
	const label = useMemo(() => t('label.continue', 'Continue'), []);
	const secondaryActionLabel = useMemo(() => t('label.discard_changes', 'Discard Changes'), []);

	const onConfirm = useCallback(() => {
		isSending
			? action({ isNew, editor, dispatch, notifyAttendees }).then(({ response }: any) => {
					createSnackbar({
						key: `calendar-moved-root`,
						replace: true,
						severity: response ? 'info' : 'warning',
						hideButton: true,
						label: !response
							? t('label.error_try_again', 'Something went wrong, please try again')
							: t('message.appointment_invitation_sent', 'Appointment invitation sent'),
						autoHideTimeout: 3000
					});
					onClose();
				})
			: action({
					draft: draftOverride ?? (!!attendeesLength || !!meetingRoomLength || !!equipmentsLength),
					isNew,
					editor,
					dispatch,
					notifyAttendees
				}).then(({ response }: any) => {
					createSnackbar({
						key: `calendar-moved-root`,
						replace: true,
						severity: response ? 'info' : 'warning',
						hideButton: true,
						label: !response
							? t('label.error_try_again', 'Something went wrong, please try again')
							: t('message.snackbar.calendar_edits_saved', 'Edits saved correctly'),
						autoHideTimeout: 3000
					});
					onClose();
				});
	}, [
		action,
		attendeesLength,
		createSnackbar,
		dispatch,
		draftOverride,
		editor,
		equipmentsLength,
		isNew,
		isSending,
		meetingRoomLength,
		notifyAttendees,
		onClose
	]);

	const onDiscard = useCallback(() => {
		onClose();
		if (board) {
			closeBoard(board?.id);
		}
	}, [board, onClose]);
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
