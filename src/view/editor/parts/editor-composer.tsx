/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { t, useIntegratedComponent } from '@zextras/carbonio-shell-ui';
import { debounce } from 'lodash';
import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useAppSelector } from '../../../hooks/redux';
import {
	selectEditorDisabled,
	selectEditorIsRichText,
	selectEditorPlainText,
	selectEditorRichText
} from '../../../store/selectors/editor';
import { EditorCallbacks } from '../../../types/editor';

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

const EditorWrapper = styled.div`
	width: 100%;
	height: 100%;
	overflow-y: auto;
	position: relative;
	.tox .tox-editor-header {
		z-index: 0;
	}
	> .tox:not(.tox-tinymce-inline) {
		width: 100%;
		border: none;
		.tox-editor-header {
			background-color: ${(props): string => props.theme.palette.gray6.regular};
		}
		.tox-toolbar__primary {
			background: none;
			background-color: ${(props): string => props.theme.palette.gray4.regular};
			border-radius: ${(props): string => props.theme.borderRadius};
		}
	}
	> .tox {
		.tox-edit-area {
			margin-left: calc(-1rem + ${(props): string => props.theme.sizes.padding.large});
			overflow-y: auto;
			max-height: 100%;
		}
		.tox-edit-area__iframe {
			height: 100%;
			padding-bottom: ${(props): string => props.theme.sizes.padding.large};
		}
		&.tox-tinymce {
			height: 100%;
		}
	}
`;

type ComposerProps = {
	editorId: string;
	callbacks: EditorCallbacks;
};

export const EditorComposer = ({ editorId, callbacks }: ComposerProps): ReactElement | null => {
	const [Composer, composerIsAvailable] = useIntegratedComponent('composer');
	const { onTextChange } = callbacks;

	const isRichText = useAppSelector(selectEditorIsRichText(editorId));
	const richText = useAppSelector(selectEditorRichText(editorId));
	const plainText = useAppSelector(selectEditorPlainText(editorId));
	const disabled = useAppSelector(selectEditorDisabled(editorId));

	const [plainTextValue, setPlainTextValue] = useState(plainText ?? '');
	const [richTextValue, setRichTextValue] = useState(richText ?? '');

	const textAreaLabel = useMemo(
		() => t('messages.format_as_plain_text', 'Format as Plain Text'),
		[]
	);

	const debounceInput = useMemo(
		() =>
			debounce(onTextChange, 500, {
				trailing: true,
				leading: false
			}),
		[onTextChange]
	);

	const onRichTextChange = useCallback(
		(e) => {
			setRichTextValue(e[1]);
			setPlainTextValue(e[0]);
			debounceInput(e);
		},
		[debounceInput]
	);

	const onPlainTextChange = useCallback(
		(e) => {
			setPlainTextValue(e.target.value);
			debounceInput([e.target.value, e.target.value]);
		},
		[debounceInput]
	);

	useEffect(() => {
		if (plainText) {
			setPlainTextValue(plainText);
		}
	}, [plainText]);

	useEffect(() => {
		if (richText) {
			setRichTextValue(richText);
		}
	}, [richText]);

	return (
		<>
			{composerIsAvailable && isRichText ? (
				<EditorWrapper>
					<Composer
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						onEditorChange={onRichTextChange}
						minHeight="12.5rem"
						value={richTextValue}
						disabled={disabled?.composer}
						data-testid="editor-composer"
					/>
				</EditorWrapper>
			) : (
				<TextArea
					placeholder={textAreaLabel}
					value={plainTextValue}
					onChange={onPlainTextChange}
					disabled={disabled?.composer}
					data-testid="editor-textArea"
				/>
			)}
		</>
	);
};
