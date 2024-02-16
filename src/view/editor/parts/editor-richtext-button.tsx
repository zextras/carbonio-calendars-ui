/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback } from 'react';

import { Tooltip } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import { ResizedIconCheckbox } from './editor-styled-components';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import { selectEditorDisabled, selectEditorIsRichText } from '../../../store/selectors/editor';
import { editIsRichText } from '../../../store/slices/editor-slice';

export const EditorRichTextButton = ({ editorId }: { editorId: string }): ReactElement => {
	const isRichText = useAppSelector(selectEditorIsRichText(editorId));
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const dispatch = useAppDispatch();

	const onClick = useCallback(() => {
		dispatch(editIsRichText({ id: editorId, isRichText: !isRichText }));
	}, [dispatch, editorId, isRichText]);

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
