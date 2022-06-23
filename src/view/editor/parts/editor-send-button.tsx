/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button } from '@zextras/carbonio-design-system';
import { getBridgedFunctions } from '@zextras/carbonio-shell-ui';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
	selectEditorAttendees,
	selectEditorIsNew,
	selectEditorOptionalAttendees
} from '../../../store/selectors/editor';
import { EditorProps } from '../../../types/editor';

export const EditorSendButton = ({ editorId, callbacks }: EditorProps): JSX.Element => {
	const [t] = useTranslation();
	const attendees = useSelector(selectEditorAttendees(editorId));
	const optionalAttendees = useSelector(selectEditorOptionalAttendees(editorId));
	const isNew = useSelector(selectEditorIsNew(editorId));

	const { onSend } = callbacks;
	const disabled = useMemo(
		() => !attendees?.length && !optionalAttendees?.length,
		[attendees?.length, optionalAttendees?.length]
	);

	const onClick = useCallback(() => {
		onSend(isNew).then((res: { type: string | string[] }) => {
			if (res?.type) {
				const success = res.type.includes('fulfilled');
				getBridgedFunctions().createSnackbar({
					key: `calendar-moved-root`,
					replace: true,
					type: success ? 'info' : 'warning',
					hideButton: true,
					label: !success
						? t('label.error_try_again', 'Something went wrong, please try again')
						: t('message.snackbar.calendar_edits_saved', 'Edits saved correctly'),
					autoHideTimeout: 3000
				});
			}
		});
	}, [isNew, onSend, t]);

	return (
		<Button
			label={t('action.send', 'Send')}
			icon="PaperPlane"
			disabled={disabled}
			onClick={onClick}
		/>
	);
};
