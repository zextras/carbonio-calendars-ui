/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback } from 'react';

import { Button, Tooltip, useModal, useSnackbar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { useEditorResourcesState, useEditorSaveButtonState } from './editor-button-hooks';
import { onSave } from 'commons/editor-save-send-fns';
import { StoreProvider } from 'store/redux';
import { useAppDispatch, useAppSelector } from 'store/redux/hooks';
import {
	selectEditor,
	selectEditorAttendees,
	selectEditorIsNew,
	selectOriginalEditorAttendees,
	selectOriginalEditorOptionalAttendees
} from 'store/selectors/editor';
import { EditorProps, NotifyAttendeesOverride } from 'types/editor';
import { getNewlyAddedAttendees, haveAttendeesChanged } from 'utils/attendees';
import {
	SendUpdateModal,
	SEND_UPDATE_OPTIONS,
	SendUpdateOption
} from 'view/modals/send-update-modal';
import { SeriesEditWarningModal } from 'view/modals/series-edit-warning-modal';

export const EditorSaveButton = ({ editorId }: EditorProps): ReactElement => {
	const isNew = useAppSelector(selectEditorIsNew(editorId));
	const editor = useAppSelector(selectEditor(editorId));
	const originalAttendees = useAppSelector(selectOriginalEditorAttendees(editorId));
	const originalOptionalAttendees = useAppSelector(selectOriginalEditorOptionalAttendees(editorId));
	const { createModal, closeModal } = useModal();
	const createSnackbar = useSnackbar();
	const attendeesLength = useAppSelector(selectEditorAttendees(editorId))?.length;

	const { isDisabled: isSaveDisabled, tooltip: disabledTooltipLabel } =
		useEditorSaveButtonState(editorId);
	const { meetingRooms, equipments } = useEditorResourcesState(editorId);

	const [t] = useTranslation();

	const meetingRoomLength = meetingRooms.length;
	const equipmentsLength = equipments.length;

	const dispatch = useAppDispatch();

	const proceedWithSave = useCallback(
		(notifyAttendees?: NotifyAttendeesOverride, draftOverride?: boolean) => {
			if (editor.isSeries && !isNew && !editor.isInstance) {
				const modalId = 'series-edit-warning';
				createModal(
					{
						id: modalId,
						size: 'large',
						children: (
							<StoreProvider>
								<SeriesEditWarningModal
									action={onSave}
									isSending={false}
									onClose={(): void => closeModal(modalId)}
									isNew={isNew}
									editorId={editorId}
									editor={editor}
									notifyAttendees={notifyAttendees}
									draftOverride={draftOverride}
								/>
							</StoreProvider>
						),
						onClose: () => {
							closeModal(modalId);
						}
					},
					true
				);
			} else {
				onSave({
					draft: draftOverride ?? (!!attendeesLength || !!meetingRoomLength || !!equipmentsLength),
					isNew,
					editor,
					dispatch,
					notifyAttendees
				}).then(({ response }) => {
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
				});
			}
		},
		[
			editor,
			isNew,
			createModal,
			editorId,
			closeModal,
			attendeesLength,
			meetingRoomLength,
			equipmentsLength,
			dispatch,
			createSnackbar,
			t
		]
	);

	const onClick = useCallback(() => {
		const attendeesChanged =
			!isNew &&
			(haveAttendeesChanged(editor.attendees, originalAttendees) ||
				haveAttendeesChanged(editor.optionalAttendees, originalOptionalAttendees));

		if (attendeesChanged) {
			const modalId = 'send-update';
			const onConfirm = (option: SendUpdateOption): void => {
				closeModal(modalId);
				if (option === SEND_UPDATE_OPTIONS.SAVE_WITHOUT_SENDING) {
					proceedWithSave(undefined, true);
					return;
				}
				proceedWithSave(
					option === SEND_UPDATE_OPTIONS.ADDED_OR_REMOVED
						? {
								attendees: getNewlyAddedAttendees(editor.attendees, originalAttendees),
								optionalAttendees: getNewlyAddedAttendees(
									editor.optionalAttendees,
									originalOptionalAttendees
								)
							}
						: undefined,
					false
				);
			};
			createModal(
				{
					id: modalId,
					size: 'medium',
					children: (
						<StoreProvider>
							<SendUpdateModal
								onClose={(): void => closeModal(modalId)}
								onConfirm={onConfirm}
								showSaveWithoutSendingOption
							/>
						</StoreProvider>
					),
					onClose: () => {
						closeModal(modalId);
					}
				},
				true
			);
		} else {
			proceedWithSave();
		}
	}, [
		closeModal,
		createModal,
		editor.attendees,
		editor.optionalAttendees,
		isNew,
		originalAttendees,
		originalOptionalAttendees,
		proceedWithSave
	]);

	return (
		<Tooltip label={disabledTooltipLabel} disabled={!isSaveDisabled}>
			<Button
				label={t('label.save', 'Save')}
				icon="SaveOutline"
				disabled={isSaveDisabled}
				onClick={onClick}
				type="outlined"
			/>
		</Tooltip>
	);
};
