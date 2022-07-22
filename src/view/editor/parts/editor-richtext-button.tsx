/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Tooltip } from '@zextras/carbonio-design-system';
import React, { ReactElement, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectEditorIsRichText } from '../../../store/selectors/editor';
import { EditorProps } from '../../../types/editor';
import { ResizedIconCheckbox } from './editor-styled-components';

export const EditorRichTextButton = ({ editorId, callbacks }: EditorProps): ReactElement => {
	const [t] = useTranslation();
	const { onToggleRichText } = callbacks;
	const isRichText = useSelector(selectEditorIsRichText(editorId));

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
			/>
		</Tooltip>
	);
};
