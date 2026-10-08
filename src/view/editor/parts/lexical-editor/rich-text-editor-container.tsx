/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import styled from '@emotion/styled';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { useUserSettings } from '@zextras/carbonio-shell-ui';

import { AutoLinkPlugin } from './plugins/auto-link-plugin';
import { ControlledContentPlugin } from './plugins/controlled-content-plugin';
import { EditableSyncPlugin } from './plugins/editable-sync-plugin';
import { FloatingLinkEditorPlugin } from './plugins/floating-link-editor-plugin';
import { STYLE_PRESERVING_HTML_IMPORT } from './plugins/html-import-style';
import { ImagePlugin } from './plugins/image-plugin';
import { ListMarkdownShortcutPlugin } from './plugins/list-markdown-shortcut-plugin';
import { ImageNode } from './plugins/nodes/image-node';
import { RichToolbarPlugin } from './plugins/rich-toolbar-plugin';
import { TableActionMenuPlugin } from './plugins/table-action-menu-plugin';
import { TableCellResizerPlugin } from './plugins/table-cell-resizer-plugin';
import { TableHoverActionsPlugin } from './plugins/table-hover-actions-plugin';
import { useAppSelector } from '../../../../store/redux/hooks';
import { selectEditorDisabled } from '../../../../store/selectors/editor';

const DEFAULT_FONT_FAMILY = 'arial, helvetica, sans-serif';

export const LexicalWrapper = styled.div<{
	$fontFamily: string;
	$fontSize?: string;
	$color?: string;
}>`
	display: flex;
	flex-direction: column;
	flex: 1 0 auto;
	width: 100%;
	height: 100%;
	overflow-y: auto;
	position: relative;

	.cal-lexical-toolbar {
		position: sticky;
		top: 0;
		z-index: 1;
		background-color: ${({ theme }): string => theme.palette.gray4.regular};
		border-radius: ${({ theme }): string => theme.borderRadius};
	}

	.cal-lexical-editor-inner {
		position: relative;
		display: flex;
		flex-direction: column;
		flex: 1 0 auto;
	}

	.cal-lexical-content-editable {
		flex: 1 0 auto;
		min-height: 9.375rem;
		padding: ${({ theme }): string => theme.sizes.padding.large};
		outline: none;
		font-family: ${({ $fontFamily }): string => $fontFamily};
		${({ $fontSize }): string => ($fontSize ? `font-size: ${$fontSize};` : '')}
		${({ $color }): string => ($color ? `color: ${$color};` : '')}
	}

	.cal-lexical-content-editable p {
		margin: 0;
		padding: 0;
		margin-bottom: 1rem;
	}

	.cal-lexical-content-editable p:last-child {
		margin-bottom: 0;
	}

	.cal-lexical-placeholder {
		position: absolute;
		top: ${({ theme }): string => theme.sizes.padding.large};
		left: ${({ theme }): string => theme.sizes.padding.large};
		color: ${({ theme }): string => theme.palette.secondary.regular};
		font-family: ${({ $fontFamily }): string => $fontFamily};
		${({ $fontSize }): string => ($fontSize ? `font-size: ${$fontSize};` : '')}
		pointer-events: none;
		user-select: none;
	}

	/* "Show blocks" view aid is a stretch item, not implemented yet; class kept
	   reserved so it can be wired up later without another CSS pass. */
	.cal-lexical-show-blocks
		.cal-lexical-content-editable
		:is(p, h1, h2, h3, h4, h5, h6, blockquote, ul, ol, li, div, pre, table) {
		outline: 0.0625rem dashed ${({ theme }): string => theme.palette.gray3.regular};
		outline-offset: 0.125rem;
	}

	.cal-lexical-bold {
		font-weight: bold;
	}

	.cal-lexical-italic {
		font-style: italic;
	}

	.cal-lexical-underline {
		text-decoration: underline;
	}

	.cal-lexical-strikethrough {
		text-decoration: line-through;
	}

	.cal-lexical-underline-strikethrough {
		text-decoration: underline line-through;
	}

	.cal-lexical-image {
		display: inline-block;
		max-width: 100%;
	}

	.cal-lexical-image-wrapper {
		position: relative;
		display: inline-block;
		line-height: 0;
	}

	.cal-lexical-image-wrapper img {
		cursor: default;
	}

	.cal-lexical-image-selected img {
		outline: 0.125rem solid ${({ theme }): string => theme.palette.primary.regular};
		outline-offset: 0.0625rem;
	}

	.cal-lexical-image-resizer {
		position: absolute;
		width: 0.5rem;
		height: 0.5rem;
		padding: 0;
		border: 0.0625rem solid ${({ theme }): string => theme.palette.gray6.regular};
		background: ${({ theme }): string => theme.palette.primary.regular};
		appearance: none;
		z-index: 2;
	}

	.cal-lexical-image-resizer-nw {
		top: -0.25rem;
		left: -0.25rem;
		cursor: nwse-resize;
	}

	.cal-lexical-image-resizer-n {
		top: -0.25rem;
		left: 50%;
		transform: translateX(-50%);
		cursor: ns-resize;
	}

	.cal-lexical-image-resizer-ne {
		top: -0.25rem;
		right: -0.25rem;
		cursor: nesw-resize;
	}

	.cal-lexical-image-resizer-e {
		top: 50%;
		right: -0.25rem;
		transform: translateY(-50%);
		cursor: ew-resize;
	}

	.cal-lexical-image-resizer-se {
		bottom: -0.25rem;
		right: -0.25rem;
		cursor: nwse-resize;
	}

	.cal-lexical-image-resizer-s {
		bottom: -0.25rem;
		left: 50%;
		transform: translateX(-50%);
		cursor: ns-resize;
	}

	.cal-lexical-image-resizer-sw {
		bottom: -0.25rem;
		left: -0.25rem;
		cursor: nesw-resize;
	}

	.cal-lexical-image-resizer-w {
		top: 50%;
		left: -0.25rem;
		transform: translateY(-50%);
		cursor: ew-resize;
	}

	a.cal-lexical-link {
		color: ${({ theme }): string => theme.palette.primary.regular};
	}

	.cal-lexical-table {
		border-collapse: collapse;
		table-layout: fixed;
		width: 100%;
		margin: ${({ theme }): string => theme.sizes.padding.small} 0;
	}

	.cal-lexical-table td,
	.cal-lexical-table th {
		position: relative;
		border: 0.0625rem solid ${({ theme }): string => theme.palette.gray3.regular};
		padding: ${({ theme }): string => theme.sizes.padding.small}
			${({ theme }): string => theme.sizes.padding.medium};
		vertical-align: top;
		min-width: 2.5rem;
	}

	.cal-lexical-table th {
		background: ${({ theme }): string => theme.palette.gray5.regular};
		font-weight: bold;
		text-align: left;
	}

	.cal-lexical-table-cell-selected {
		background: ${({ theme }): string => theme.palette.highlight.regular};
	}

	.cal-lexical-table-cell-action-button {
		position: absolute;
		z-index: 2;
		transform: translate(-100%, 0);
	}

	.cal-lexical-table-resizer {
		position: absolute;
		z-index: 2;
		padding: 0;
		border: none;
		background: transparent;
		appearance: none;
	}

	.cal-lexical-table-resizer-column {
		width: 0.375rem;
		transform: translateX(-50%);
		cursor: col-resize;
	}

	.cal-lexical-table-resizer-row {
		height: 0.375rem;
		transform: translateY(-50%);
		cursor: row-resize;
	}

	.cal-lexical-table-resizer:hover {
		background: ${({ theme }): string => theme.palette.primary.regular};
	}

	.cal-lexical-table-resizer-guide {
		position: absolute;
		z-index: 3;
		background: ${({ theme }): string => theme.palette.primary.regular};
		pointer-events: none;
	}

	.cal-lexical-table-resizer-guide-column {
		top: 0;
		bottom: 0;
		width: 0.0625rem;
	}

	.cal-lexical-table-resizer-guide-row {
		left: 0;
		right: 0;
		height: 0.0625rem;
	}

	.cal-lexical-table-hover-action {
		position: absolute;
		z-index: 3;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		border: none;
		border-radius: 0.125rem;
		background: ${({ theme }): string => theme.palette.gray3.regular};
		color: ${({ theme }): string => theme.palette.gray0.regular};
		font-size: 0.875rem;
		line-height: 1;
		cursor: pointer;
		appearance: none;
	}

	.cal-lexical-table-hover-action:hover {
		background: ${({ theme }): string => theme.palette.primary.regular};
		color: ${({ theme }): string => theme.palette.gray6.regular};
	}

	.cal-lexical-table-hover-action-row {
		transform: translateY(0.1875rem);
	}

	.cal-lexical-table-hover-action-column {
		transform: translateX(0.1875rem);
	}
`;

type RichTextEditorContainerProps = {
	editorId: string;
};

export const RichTextEditorContainer = ({
	editorId
}: RichTextEditorContainerProps): React.JSX.Element => {
	const { prefs } = useUserSettings();
	const disabled = useAppSelector(selectEditorDisabled(editorId));

	const fontFamily =
		(prefs?.zimbraPrefHtmlEditorDefaultFontFamily as string) || DEFAULT_FONT_FAMILY;
	const fontSize = prefs?.zimbraPrefHtmlEditorDefaultFontSize as string | undefined;
	const color = prefs?.zimbraPrefHtmlEditorDefaultFontColor as string | undefined;

	const initialConfig = useMemo(
		() => ({
			namespace: 'CalendarsLexicalEditor',
			nodes: [
				HeadingNode,
				QuoteNode,
				ListNode,
				ListItemNode,
				LinkNode,
				AutoLinkNode,
				TableNode,
				TableRowNode,
				TableCellNode,
				ImageNode
			],
			theme: {
				text: {
					bold: 'cal-lexical-bold',
					italic: 'cal-lexical-italic',
					underline: 'cal-lexical-underline',
					strikethrough: 'cal-lexical-strikethrough',
					underlineStrikethrough: 'cal-lexical-underline-strikethrough'
				},
				link: 'cal-lexical-link',
				table: 'cal-lexical-table',
				tableCellSelected: 'cal-lexical-table-cell-selected',
				image: 'cal-lexical-image'
			},
			html: { import: STYLE_PRESERVING_HTML_IMPORT },
			onError: (error: Error): void => {
				throw error;
			}
		}),
		[]
	);

	return (
		<LexicalComposer initialConfig={initialConfig}>
			<LexicalWrapper $fontFamily={fontFamily} $fontSize={fontSize} $color={color}>
				{!disabled?.composer && (
					<div className="cal-lexical-toolbar">
						<RichToolbarPlugin fontFamily={fontFamily} fontSize={fontSize} />
					</div>
				)}
				<div className="cal-lexical-editor-inner">
					<RichTextPlugin
						contentEditable={
							<ContentEditable
								className="cal-lexical-content-editable"
								data-testid="editor-composer"
							/>
						}
						placeholder={<div className="cal-lexical-placeholder" />}
						ErrorBoundary={LexicalErrorBoundary}
					/>
				</div>
				<HistoryPlugin />
				<ListPlugin />
				<ListMarkdownShortcutPlugin />
				<LinkPlugin />
				<AutoLinkPlugin />
				<FloatingLinkEditorPlugin />
				<TablePlugin hasCellMerge hasCellBackgroundColor hasTabHandler />
				<TableActionMenuPlugin />
				<TableCellResizerPlugin />
				<TableHoverActionsPlugin />
				<ImagePlugin />
				<ControlledContentPlugin editorId={editorId} />
				<EditableSyncPlugin disabled={disabled?.composer} />
			</LexicalWrapper>
		</LexicalComposer>
	);
};
