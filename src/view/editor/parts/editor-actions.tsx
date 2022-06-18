/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EditorProps } from '../../../types/editor';
import { EditorAttachmentsButton } from './editor-attachments';
import { EditorRichTextButton } from './editor-richtext-button';
import { EditorSaveButton } from './editor-save-button';

export const EditorActions = ({ editorId, callbacks }: EditorProps): JSX.Element => {
	const [t] = useTranslation();
	return (
		<>
			<EditorRichTextButton editorId={editorId} callbacks={callbacks} />
			<EditorAttachmentsButton editorId={editorId} callbacks={callbacks} />
			<EditorSaveButton editorId={editorId} callbacks={callbacks} />
		</>
	);
};
/*
		<EditorSendButton /> */
