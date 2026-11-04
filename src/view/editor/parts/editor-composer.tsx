/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useState } from 'react';

import styled from '@emotion/styled';
import { t } from '@zextras/carbonio-shell-ui';
import { debounce } from 'lodash';

import { RichTextEditorContainer } from './lexical-editor/rich-text-editor-container';
import { useAppDispatch, useAppSelector } from 'store/redux/hooks';
import {
	selectEditorDisabled,
	selectEditorIsRichText,
	selectEditorPlainText
} from 'store/selectors/editor';
import { editEditorText } from 'store/slices/editor-slice';

const TextArea = styled.textarea`
	box-sizing: border-box;
	padding: ${(props): string => props.theme.sizes.padding.large};
	background: ${(props): string => props.theme.palette.gray5.regular};
	height: fit-content;
	min-height: 9.375rem;
	flex-grow: 1;
	width: 100%;
	border: none;
	resize: none;
	& :focus,
	:active {
		box-shadow: none;
		border: none;
		outline: none;
	}
`;

const PlainComposer = ({ editorId }: { editorId: string }): JSX.Element => {
	const plainText = useAppSelector(selectEditorPlainText(editorId));
	const disabled = useAppSelector(selectEditorDisabled(editorId));

	const dispatch = useAppDispatch();

	const [plainTextValue, setPlainTextValue] = useState(plainText ?? '');

	const debounceInput = useMemo(
		() =>
			debounce(
				([plain, htmlText]) => {
					dispatch(editEditorText({ id: editorId, richText: htmlText, plainText: plain }));
				},
				500,
				{
					trailing: true,
					leading: false
				}
			),
		[dispatch, editorId]
	);

	const textAreaLabel = useMemo(
		() => t('messages.format_as_plain_text', 'Format as Plain Text'),
		[]
	);

	const onPlainTextChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setPlainTextValue(e.target.value);
			debounceInput([e.target.value, e.target.value]);
		},
		[debounceInput]
	);

	return (
		<TextArea
			placeholder={textAreaLabel}
			value={plainTextValue}
			onChange={onPlainTextChange}
			disabled={disabled?.composer}
			data-testid="editor-textArea"
		/>
	);
};

const HtmlComposer = ({ editorId }: { editorId: string }): React.JSX.Element => (
	<RichTextEditorContainer editorId={editorId} />
);

export const EditorComposer = ({ editorId }: { editorId: string }): ReactElement | null => {
	const isRichText = useAppSelector(selectEditorIsRichText(editorId));

	return (
		<>{isRichText ? <HtmlComposer editorId={editorId} /> : <PlainComposer editorId={editorId} />}</>
	);
};
