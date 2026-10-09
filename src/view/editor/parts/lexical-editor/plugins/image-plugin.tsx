/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand, type LexicalCommand } from 'lexical';

import { $createImageNode } from './nodes/image-node';
import { type ImageDimension } from './nodes/image-types';

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
 * current selection. Calendars-ui only supports inserting an image by URL (no
 * device upload), so the payload only carries the src to display, the alt text
 * and the dimensions.
 */
export const ImagePlugin = (): null => {
	const [editor] = useLexicalComposerContext();

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
				)
			),
		[editor]
	);

	return null;
};
