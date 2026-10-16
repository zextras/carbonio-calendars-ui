/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState } from 'react';

import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button, Container, Dropdown, Row, Tooltip } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { INDENT_CONTENT_COMMAND, OUTDENT_CONTENT_COMMAND } from 'lexical';

import { ColorPickerToolbarButton } from './color-picker-toolbar-button';
import { ImageModal } from './image-modal';
import { LinkModal } from './link-modal';
import { useAlignmentAndDirection } from './rich-toolbar-plugin-hooks/use-alignment-and-direction';
import { useBlockType } from './rich-toolbar-plugin-hooks/use-block-type';
import { useFontAndSizeSelects } from './rich-toolbar-plugin-hooks/use-font-and-size-selects';
import { useImageActions } from './rich-toolbar-plugin-hooks/use-image-actions';
import { useStylePatching } from './rich-toolbar-plugin-hooks/use-style-patching';
import { useTableInsert } from './rich-toolbar-plugin-hooks/use-table-insert';
import { useTextFormatting } from './rich-toolbar-plugin-hooks/use-text-formatting';
import { useToolbarSelectionSync } from './rich-toolbar-plugin-hooks/use-toolbar-selection-sync';
import { type BlockType } from './rich-toolbar-plugin-model';
import { SourceCodeModal } from './source-code-modal';
import { ToolbarDivider } from './toolbar-divider';
import { ToolbarIconButton } from './toolbar-icon-button';
import { ToolbarSelect } from './toolbar-select';
import { editorIcon } from '../icons/editor-icons';

type RichToolbarPluginProps = {
	/** Account's default font family, used as the font selector's default value. */
	fontFamily?: string;
	/** Account's default font size, used as the size selector's default value. */
	fontSize?: string;
	/** Whether block-level elements are outlined for visual debugging. */
	showBlocks: boolean;
	/** Toggles {@link showBlocks}. */
	onToggleShowBlocks: () => void;
};

/**
 * The calendars-ui rich-text toolbar: font/size/block-type selects, text and
 * background color, inline text formatting, paragraph alignment/direction/
 * indentation, lists, links, tables, images, a block-outline view aid and a
 * raw HTML source editor.
 */
export const RichToolbarPlugin = ({
	fontFamily,
	fontSize,
	showBlocks,
	onToggleShowBlocks
}: RichToolbarPluginProps): React.JSX.Element => {
	const [editor] = useLexicalComposerContext();
	const [linkModalOpen, setLinkModalOpen] = useState(false);
	const [sourceCodeModalOpen, setSourceCodeModalOpen] = useState(false);
	const { openImageModal, imageModalOpen, setImageModalOpen } = useImageActions(editor);
	const { tableItems, tableLabel, tableMenuOpen, setTableMenuOpen } = useTableInsert(editor);

	const {
		currentBlock,
		activeFormatting,
		currentFont,
		currentFontSize,
		currentTextColor,
		currentBackgroundColor,
		lastRangeSelectionRef
	} = useToolbarSelectionSync(editor);

	const { patchStyle } = useStylePatching(editor, lastRangeSelectionRef);
	const { formatText, clearFormatting } = useTextFormatting(editor, lastRangeSelectionRef);
	const { formatAlign, setDirection } = useAlignmentAndDirection(editor);
	const { formatBlock, blockSelectItems, selectedBlock } = useBlockType(editor, currentBlock);
	const { fontSelectItems, fontSizeSelectItems, selectedFont, selectedFontSize } =
		useFontAndSizeSelects(currentFont, currentFontSize, fontFamily, fontSize);

	const textColorLabel = t('lexical-label.text_color', 'Text color');
	const backgroundColorLabel = t('lexical-label.background_color', 'Background color');

	return (
		<>
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				wrap="wrap"
				padding={{ vertical: 'extrasmall' }}
				gap="0.25rem"
				width="fill"
			>
				<Container width="11.375rem" height="fit">
					<ToolbarSelect
						items={fontSelectItems}
						selection={selectedFont}
						onChange={(value): void => {
							if (value) {
								patchStyle({ 'font-family': value });
							}
						}}
						showCheckbox={false}
						dropdownWidth="12.5rem"
					/>
				</Container>
				<Container width="9.375rem" height="fit">
					<ToolbarSelect
						items={fontSizeSelectItems}
						selection={selectedFontSize}
						onChange={(value): void => {
							if (value) {
								patchStyle({ 'font-size': value });
							}
						}}
						showCheckbox={false}
					/>
				</Container>
				<Container width="9.375rem" height="fit">
					<ToolbarSelect<BlockType>
						items={blockSelectItems}
						selection={selectedBlock}
						onChange={(value): void => {
							if (value) {
								formatBlock(value);
							}
						}}
						showCheckbox={false}
					/>
				</Container>

				<ToolbarDivider />

				{/* Text and background color */}
				<ColorPickerToolbarButton
					icon={editorIcon('text-color')}
					label={textColorLabel}
					color={currentTextColor}
					onColorChange={(color): void => patchStyle({ color })}
				/>
				<ColorPickerToolbarButton
					icon={editorIcon('highlight-bg-color')}
					label={backgroundColorLabel}
					color={currentBackgroundColor}
					onColorChange={(color): void => patchStyle({ 'background-color': color })}
				/>

				<ToolbarDivider />

				{/* Inline text formatting */}
				<ToolbarIconButton
					icon={editorIcon('bold')}
					label={t('lexical-label.bold', 'Bold')}
					onClick={(): void => formatText('bold')}
					active={activeFormatting.formats.bold}
				/>
				<ToolbarIconButton
					icon={editorIcon('italic')}
					label={t('lexical-label.italic', 'Italic')}
					onClick={(): void => formatText('italic')}
					active={activeFormatting.formats.italic}
				/>
				<ToolbarIconButton
					icon={editorIcon('underline')}
					label={t('lexical-label.underline', 'Underline')}
					onClick={(): void => formatText('underline')}
					active={activeFormatting.formats.underline}
				/>
				<ToolbarIconButton
					icon={editorIcon('strike-through')}
					label={t('lexical-label.strikethrough', 'Strikethrough')}
					onClick={(): void => formatText('strikethrough')}
					active={activeFormatting.formats.strikethrough}
				/>
				<ToolbarIconButton
					icon={editorIcon('remove-formatting')}
					label={t('lexical-label.remove_format', 'Clear formatting')}
					onClick={clearFormatting}
				/>

				<ToolbarDivider />

				{/* Paragraph alignment */}
				<ToolbarIconButton
					icon={editorIcon('align-left')}
					label={t('lexical-label.align_left', 'Align left')}
					onClick={(): void => formatAlign('left')}
					active={activeFormatting.align === 'left'}
				/>
				<ToolbarIconButton
					icon={editorIcon('align-center')}
					label={t('lexical-label.align_center', 'Center')}
					onClick={(): void => formatAlign('center')}
					active={activeFormatting.align === 'center'}
				/>
				<ToolbarIconButton
					icon={editorIcon('align-right')}
					label={t('lexical-label.align_right', 'Align right')}
					onClick={(): void => formatAlign('right')}
					active={activeFormatting.align === 'right'}
				/>
				<ToolbarIconButton
					icon={editorIcon('align-justify')}
					label={t('lexical-label.align_justify', 'Justify')}
					onClick={(): void => formatAlign('justify')}
					active={activeFormatting.align === 'justify'}
				/>

				{/* Indentation */}
				<ToolbarIconButton
					icon={editorIcon('outdent')}
					label={t('lexical-label.indent_decrease', 'Decrease indent')}
					onClick={(): void => {
						editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
					}}
				/>
				<ToolbarIconButton
					icon={editorIcon('indent')}
					label={t('lexical-label.indent_increase', 'Increase indent')}
					onClick={(): void => {
						editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
					}}
				/>

				{/* Text direction */}
				<ToolbarIconButton
					icon={editorIcon('ltr')}
					label={t('lexical-label.ltr', 'Left to right')}
					onClick={(): void => setDirection('ltr')}
					active={activeFormatting.direction === 'ltr'}
				/>
				<ToolbarIconButton
					icon={editorIcon('rtl')}
					label={t('lexical-label.rtl', 'Right to left')}
					onClick={(): void => setDirection('rtl')}
					active={activeFormatting.direction === 'rtl'}
				/>

				<ToolbarDivider />

				{/* Lists */}
				<ToolbarIconButton
					icon={editorIcon('unordered-list')}
					label={t('lexical-label.bullet_list', 'Bulleted list')}
					onClick={(): void => {
						editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
					}}
					active={activeFormatting.list === 'bullet'}
				/>
				<ToolbarIconButton
					icon={editorIcon('ordered-list')}
					label={t('lexical-label.numbered_list', 'Numbered list')}
					onClick={(): void => {
						editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
					}}
					active={activeFormatting.list === 'number'}
				/>

				<ToolbarDivider />

				{/* Link */}
				<ToolbarIconButton
					icon={editorIcon('link')}
					label={t('lexical-label.insert_link', 'Insert link')}
					onClick={(): void => setLinkModalOpen(true)}
				/>

				<Tooltip label={tableLabel}>
					<Dropdown
						items={tableItems}
						forceOpen={tableMenuOpen}
						onClose={(): void => setTableMenuOpen(false)}
						disableAutoFocus
					>
						<Button
							icon={editorIcon('table')}
							color="text"
							type="ghost"
							size="large"
							aria-label={tableLabel}
							onClick={(): void => setTableMenuOpen((open) => !open)}
						/>
					</Dropdown>
				</Tooltip>

				{/* Image */}
				<ToolbarIconButton
					icon={editorIcon('image')}
					label={t('lexical-label.insert_image_url', 'Insert image')}
					onClick={openImageModal}
				/>

				<ToolbarDivider />

				{/* View aids */}
				<ToolbarIconButton
					icon={editorIcon('visualblocks')}
					label={t('lexical-label.show_blocks', 'Show blocks')}
					onClick={onToggleShowBlocks}
					active={showBlocks}
				/>
				<ToolbarIconButton
					icon={editorIcon('sourcecode')}
					label={t('lexical-label.source_code', 'Source code')}
					onClick={(): void => setSourceCodeModalOpen(true)}
				/>
			</Row>
			<LinkModal
				editor={editor}
				open={linkModalOpen}
				onClose={(): void => setLinkModalOpen(false)}
			/>
			<ImageModal
				editor={editor}
				open={imageModalOpen}
				onClose={(): void => setImageModalOpen(false)}
			/>
			<SourceCodeModal
				editor={editor}
				open={sourceCodeModalOpen}
				onClose={(): void => setSourceCodeModalOpen(false)}
			/>
		</>
	);
};
