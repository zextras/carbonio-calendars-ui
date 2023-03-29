/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';
import { useAppSelector } from '../../../hooks/redux';
import {
	selectEditorAttachmentFiles,
	selectEditorDisabled,
	selectEditorInviteId,
	selectEditorTitle
} from '../../../store/selectors/editor';
import { EditorCallbacks } from '../../../types/editor';
import { AttachmentsBlock } from '../../event-panel-view/attachments-part';

type EditorAttachmentsProps = {
	editorId: string;
	callbacks: EditorCallbacks;
	expanded: boolean | undefined;
};

export const EditorAttachments = ({
	editorId,
	callbacks
}: EditorAttachmentsProps): ReactElement | null => {
	const attachmentFiles = useAppSelector(selectEditorAttachmentFiles(editorId));
	const inviteId = useAppSelector(selectEditorInviteId(editorId));
	const title = useAppSelector(selectEditorTitle(editorId));
	const { onAttachmentsChange } = callbacks;
	const disabled = useAppSelector(selectEditorDisabled(editorId));

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
