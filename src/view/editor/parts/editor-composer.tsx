/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useIntegratedComponent } from '@zextras/carbonio-shell-ui';
import { throttle } from 'lodash';
import React, { ReactElement, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { selectEditorPlainText, selectEditorRichText } from '../../../store/selectors/editor';
import { EditorCallbacks } from '../../../types/editor';

const TextArea = styled.textarea`
	box-sizing: border-box;
	padding: ${(props): string => props.theme.sizes.padding.large};
	background: ${(props): string => props.theme.palette.gray5.regular};
	height: fit-content;
	min-height: 150px;
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
	const [t] = useTranslation();
	const { onTextChange } = callbacks;
	const isRichText = true;
	const richText = useSelector(selectEditorRichText(editorId));
	const plainText = useSelector(selectEditorPlainText(editorId));
	const [plainTextValue, setPlainTextValue] = useState(plainText);

	const textAreaLabel = useMemo(
		() => t('messages.format_as_plain_text', 'Format as Plain Text'),
		[t]
	);

	const throttleInput = useMemo(
		() =>
			throttle(onTextChange, 500, {
				trailing: true,
				leading: false
			}),
		[onTextChange]
	);

	const onRichTextChange = useCallback(
		(e) => {
			throttleInput(e);
		},
		[throttleInput]
	);

	const onPlainTextChange = useCallback(
		(e) => {
			setPlainTextValue(e[0]);
			throttleInput(e);
		},
		[throttleInput]
	);

	return (
		<>
			{composerIsAvailable && isRichText ? (
				<EditorWrapper>
					{/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
					{/* @ts-ignore */}
					<Composer value={richText} onEditorChange={onRichTextChange} minHeight={200} />
				</EditorWrapper>
			) : (
				<TextArea
					placeholder={textAreaLabel}
					value={plainTextValue}
					onChange={(ev): void => {
						// eslint-disable-next-line no-param-reassign
						ev.target.style.height = 'auto';
						// eslint-disable-next-line no-param-reassign
						ev.target.style.height = `${25 + ev.target.scrollHeight}px`;
						onPlainTextChange([ev.target.value, ev.target.value]);
					}}
				/>
			)}
		</>
	);
};
