/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
	const attachmentFiles = useSelector(selectEditorAttachmentFiles(editorId));
	const inviteId = useSelector(selectEditorInviteId(editorId));
	const title = useSelector(selectEditorTitle(editorId));
	const disabled = useSelector(selectEditorDisabled(editorId));
	const dispatch = useDispatch();

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

	return attachmentFiles?.length > 0 && title ? (
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
