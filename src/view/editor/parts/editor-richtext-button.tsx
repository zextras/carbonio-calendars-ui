/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Tooltip } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import React, { ReactElement, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectEditorDisabled, selectEditorIsRichText } from '../../../store/selectors/editor';
import { EditorProps } from '../../../types/editor';
import { ResizedIconCheckbox } from './editor-styled-components';

export const EditorRichTextButton = ({ editorId, callbacks }: EditorProps): ReactElement => {
	const { onToggleRichText } = callbacks;
	const isRichText = useSelector(selectEditorIsRichText(editorId));
	const disabled = useSelector(selectEditorDisabled(editorId));

	const onClick = useCallback(() => {
		onToggleRichText(!isRichText);
	}, [isRichText, onToggleRichText]);

	return (
		<Tooltip label={t('tooltip.enable_disable_rich_text', 'Enable/Disable rich text editor')}>
			<ResizedIconCheckbox
				icon="Text"
				value={isRichText}
				onClick={onClick}
				onChange={(): null => null}
				disabled={disabled?.richTextButton}
			/>
		</Tooltip>
	);
};
