/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { map } from 'lodash';
import React, { ReactElement, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
	selectEditorAttachmentFiles,
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
	const attachmentFiles = useSelector(selectEditorAttachmentFiles(editorId));
	const inviteId = useSelector(selectEditorInviteId(editorId));
	const title = useSelector(selectEditorTitle(editorId));
	const { onAttachmentsChange } = callbacks;

	return attachmentFiles?.length > 0 && title && inviteId ? (
		<AttachmentsBlock
			attachments={attachmentFiles}
			id={inviteId}
			onAttachmentsChange={onAttachmentsChange}
			isEditor
			subject={title}
		/>
	) : null;
};
