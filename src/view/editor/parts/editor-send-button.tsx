/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button } from '@zextras/carbonio-design-system';
import { getBridgedFunctions } from '@zextras/carbonio-shell-ui';
import React, { ReactElement, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
	selectEditorAttendees,
	selectEditorIsNew,
	selectEditorOptionalAttendees
} from '../../../store/selectors/editor';
import { EditorProps } from '../../../types/editor';

export const EditorSendButton = ({ editorId, callbacks }: EditorProps): ReactElement => {
	const [t] = useTranslation();
	const attendees = useSelector(selectEditorAttendees(editorId));
	const optionalAttendees = useSelector(selectEditorOptionalAttendees(editorId));
	const isNew = useSelector(selectEditorIsNew(editorId));

	const { onSend, closeCurrentEditor } = callbacks;
	const disabled = useMemo(
		() => !attendees?.length && !optionalAttendees?.length,
		[attendees?.length, optionalAttendees?.length]
	);

	const onClick = useCallback(() => {
		onSend(isNew).then(({ response }) => {
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
		});
	}, [closeCurrentEditor, isNew, onSend, t]);

	return (
		<Button
			label={t('action.send', 'Send')}
			icon="PaperPlane"
			disabled={disabled}
			onClick={onClick}
		/>
	);
};
