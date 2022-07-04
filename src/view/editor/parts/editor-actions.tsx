/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';
import { Row, Padding } from '@zextras/carbonio-design-system';
import { EditorProps } from '../../../types/editor';
import { EditorAttachmentsButton } from './editor-attachments';
import { EditorRichTextButton } from './editor-richtext-button';
import { EditorSaveButton } from './editor-save-button';
import { EditorSendButton } from './editor-send-button';

export const EditorActions = ({ editorId, callbacks }: EditorProps): ReactElement => (
	<Row
		orientation="horizontal"
		padding={{ top: 'small', bottom: 'small' }}
		height="fit"
		width="fill"
		mainAlignment="flex-end"
	>
		<EditorRichTextButton editorId={editorId} callbacks={callbacks} />
		<EditorAttachmentsButton editorId={editorId} callbacks={callbacks} />
		<EditorSaveButton editorId={editorId} callbacks={callbacks} />
		<Padding left="medium" />
		<EditorSendButton editorId={editorId} callbacks={callbacks} />
	</Row>
);
