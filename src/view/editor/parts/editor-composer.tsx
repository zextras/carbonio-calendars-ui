/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useRef, useState } from 'react';

import styled from '@emotion/styled';
import { t, useUserSettings } from '@zextras/carbonio-shell-ui';
import { Composer } from '@zextras/carbonio-ui-text-composer';
import { debounce } from 'lodash';

import { useAppDispatch, useAppSelector } from 'store/redux/hooks';
import {
	selectEditorDisabled,
	selectEditorIsRichText,
	selectEditorPlainText,
	selectEditorRichText
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

const HtmlComposer = ({ editorId }: { editorId: string }): React.JSX.Element => {
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const richText = useAppSelector(selectEditorRichText(editorId));
	const dispatch = useAppDispatch();

	const [richTextValue, setRichTextValue] = useState(richText ?? '');
	const hasTinyMCEFiredInit = useRef(false);

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

	const onRichTextChange = useCallback(
		(e: Array<string>) => {
			// TinyMCE fires onEditorChange once on init before loading content — skip it
			if (!hasTinyMCEFiredInit.current) {
				hasTinyMCEFiredInit.current = true;
				return;
			}
			setRichTextValue(e[1]);
			debounceInput(e);
		},
		[debounceInput]
	);

	const { prefs } = useUserSettings();

	return (
		<EditorWrapper>
			<Composer
				onEditorChange={onRichTextChange}
				value={richTextValue}
				disabled={disabled?.composer}
				data-testid="editor-composer"
				customInitOptions={{ auto_focus: false, base_url: `${BASE_PATH}` }}
				accountSettingsPrefs={{
					zimbraPrefLocale: prefs?.zimbraPrefLocale,
					zimbraPrefHtmlEditorDefaultFontFamily: prefs?.zimbraPrefHtmlEditorDefaultFontFamily,
					zimbraPrefHtmlEditorDefaultFontSize: prefs?.zimbraPrefHtmlEditorDefaultFontSize,
					zimbraPrefHtmlEditorDefaultFontColor: prefs?.zimbraPrefHtmlEditorDefaultFontColor
				}}
			/>
		</EditorWrapper>
	);
};

export const EditorComposer = ({ editorId }: { editorId: string }): ReactElement | null => {
	const isRichText = useAppSelector(selectEditorIsRichText(editorId));

	return (
		<>{isRichText ? <HtmlComposer editorId={editorId} /> : <PlainComposer editorId={editorId} />}</>
	);
};
