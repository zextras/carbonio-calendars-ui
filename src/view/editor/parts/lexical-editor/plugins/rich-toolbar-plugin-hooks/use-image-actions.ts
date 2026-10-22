/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useEffect, useState } from 'react';

import { COMMAND_PRIORITY_LOW, type LexicalEditor } from 'lexical';

import { OPEN_IMAGE_MODAL_COMMAND } from '../image-plugin';

type ImageActions = {
	openImageModal: () => void;
	imageModalOpen: boolean;
	setImageModalOpen: (open: boolean) => void;
};

export function useImageActions(editor: LexicalEditor): ImageActions {
	const [imageModalOpen, setImageModalOpen] = useState(false);

	useEffect(
		() =>
			editor.registerCommand(
				OPEN_IMAGE_MODAL_COMMAND,
				() => {
					setImageModalOpen(true);
					return true;
				},
				COMMAND_PRIORITY_LOW
			),
		[editor]
	);

	const openImageModal = useCallback((): void => {
		setImageModalOpen(true);
	}, []);

	return { openImageModal, imageModalOpen, setImageModalOpen };
}
