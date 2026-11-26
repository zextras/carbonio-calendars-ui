/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DRAG_DROP_PASTE } from '@lexical/rich-text';
import { mediaFileReader, mergeRegister } from '@lexical/utils';
import {
	$insertNodes,
	COMMAND_PRIORITY_EDITOR,
	COMMAND_PRIORITY_LOW,
	DROP_COMMAND,
	type LexicalEditor,
	PASTE_COMMAND
} from 'lexical';

import { $createImageNode } from './nodes/image-node';

/**
 * Image formats that are embedded in the description: the ones of the default
 * `images_file_types` of the previous TinyMCE composer (jpeg, jpg, jpe, jfi,
 * jif, jfif, png, gif, bmp, webp), matched exactly on the file type as TinyMCE
 * did.
 */
export const EMBEDDABLE_IMAGE_TYPES = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/bmp',
	'image/webp'
];

/**
 * Embeds the image files dropped on, or pasted into, the editor
 * ({@link DRAG_DROP_PASTE}, dispatched by the rich text plugin once it has
 * placed the selection at the drop point) as `data:` images, as the previous
 * TinyMCE composer did with the options set by Carbonio (`paste_data_images`,
 * `images_file_types` and `block_unsupported_drop` left to their default, no
 * upload handler, file names not reused):
 * - only the {@link EMBEDDABLE_IMAGE_TYPES} files are inserted, whatever their
 *   size; the other files of the drop or paste are ignored;
 * - a drop without any such image is reported through `onUnsupportedDrop`,
 *   while such a paste is silently ignored;
 * - nothing is inserted when the files cannot be read.
 *
 * All the images of a drop or paste are inserted in a single update, hence a
 * single undo step.
 */
export function registerImageFileInsertion(
	editor: LexicalEditor,
	onUnsupportedDrop: () => void
): () => void {
	let registered = true;
	// The rich text plugin dispatches DRAG_DROP_PASTE both for drops and pastes
	let filesFromDrop = false;

	const insertImageFiles = (files: Array<File>, isDrop: boolean): void => {
		const images = files.filter((file) => EMBEDDABLE_IMAGE_TYPES.includes(file.type));
		if (images.length === 0) {
			if (isDrop) {
				onUnsupportedDrop();
			}
			return;
		}
		mediaFileReader(images, EMBEDDABLE_IMAGE_TYPES)
			.then((results) => {
				// The editor may have been closed, or turned read-only, meanwhile
				if (!registered || !editor.isEditable() || results.length === 0) {
					return;
				}
				editor.update(() => {
					$insertNodes(results.map(({ result }) => $createImageNode(result)));
				});
			})
			.catch(() => {
				// As in TinyMCE, nothing is inserted when a file cannot be read
			});
	};

	return mergeRegister(
		editor.registerCommand(
			DROP_COMMAND,
			() => {
				filesFromDrop = true;
				return false;
			},
			COMMAND_PRIORITY_LOW
		),
		editor.registerCommand(
			PASTE_COMMAND,
			() => {
				filesFromDrop = false;
				return false;
			},
			COMMAND_PRIORITY_LOW
		),
		editor.registerCommand(
			DRAG_DROP_PASTE,
			(files) => {
				const isDrop = filesFromDrop;
				filesFromDrop = false;
				insertImageFiles(files, isDrop);
				return true;
			},
			COMMAND_PRIORITY_EDITOR
		),
		() => {
			registered = false;
		}
	);
}
