/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorAttachmentFiles,
	selectEditorDisabled,
	selectEditorInviteId,
	selectEditorTitle
} from '../../../store/selectors/editor';
import { editEditorAttachments } from '../../../store/slices/editor-slice';
import { AttachmentsBlock } from '../../event-panel-view/attachments-part';

type EditorAttachmentsProps = {
	editorId: string;
	expanded: boolean | undefined;
};

export const EditorAttachments = ({ editorId }: EditorAttachmentsProps): ReactElement | null => {
	const attachmentFiles = useAppSelector(selectEditorAttachmentFiles(editorId));
	const inviteId = useAppSelector(selectEditorInviteId(editorId));
	const title = useAppSelector(selectEditorTitle(editorId)) ?? '';
	const dispatch = useAppDispatch();

	const onAttachmentsChange = useCallback(
		(attach, attachments) => {
			dispatch(
				editEditorAttachments({
					id: editorId,
					attach,
					attachmentFiles: attachments
				})
			);
		},
		[dispatch, editorId]
	);
	const disabled = useAppSelector(selectEditorDisabled(editorId));

	return attachmentFiles?.length > 0 ? (
		<AttachmentsBlock
			attachments={attachmentFiles}
			id={inviteId}
			onAttachmentsChange={onAttachmentsChange}
			isEditor
			subject={title}
			disabled={disabled?.attachments}
		/>
	) : null;
};
