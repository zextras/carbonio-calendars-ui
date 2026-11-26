/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand, type LexicalCommand } from 'lexical';

import { registerImageDragAndDrop } from './image-drag-drop';
import { registerImageFileInsertion } from './image-file-insert';
import { $createImageNode } from './nodes/image-node';
import { type ImageDimension } from './nodes/image-types';
import { useReportUnsupportedFileDrop } from './unsupported-file-drop';

export { OPEN_IMAGE_MODAL_COMMAND } from './nodes/image-types';

export type InsertInlineImagePayload = {
	src: string;
	altText?: string;
	width?: ImageDimension;
	height?: ImageDimension;
};

export const INSERT_INLINE_IMAGE_COMMAND: LexicalCommand<InsertInlineImagePayload> = createCommand(
	'INSERT_INLINE_IMAGE_COMMAND'
);

/**
 * Registers the command that inserts an image ({@link ImageNode}) at the
 * current selection, used by the Insert/Edit Image dialog (image by URL).
 *
 * It also lets an image file be inserted directly, by dropping or pasting it
 * into the editor ({@link registerImageFileInsertion}), and an inline image be
 * moved inside the editor by drag and drop ({@link registerImageDragAndDrop}).
 */
export const ImagePlugin = (): null => {
	const [editor] = useLexicalComposerContext();
	const reportUnsupportedFileDrop = useReportUnsupportedFileDrop();

	useEffect(
		() =>
			mergeRegister(
				editor.registerCommand<InsertInlineImagePayload>(
					INSERT_INLINE_IMAGE_COMMAND,
					({ src, altText, width, height }) => {
						editor.update(() => {
							$insertNodes([$createImageNode(src, altText, width, height)]);
						});
						return true;
					},
					COMMAND_PRIORITY_EDITOR
				),
				registerImageDragAndDrop(editor)
			),
		[editor]
	);

	useEffect(
		() => registerImageFileInsertion(editor, reportUnsupportedFileDrop),
		[editor, reportUnsupportedFileDrop]
	);

	return null;
};
