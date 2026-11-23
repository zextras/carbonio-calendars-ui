/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { type DragEvent, useCallback, useMemo } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import { INLINE_IMAGE_DRAG_TYPE } from './nodes/image-types';

/**
 * Returns the function that reports a dropped file the editor cannot insert,
 * with the error the previous TinyMCE composer showed.
 */
export function useReportUnsupportedFileDrop(): () => void {
	const createSnackbar = useSnackbar();
	return useCallback((): void => {
		createSnackbar({
			key: 'editor-unsupported-file-drop',
			replace: true,
			severity: 'error',
			label: t('snackbar.dropped_file_type_not_supported', 'Dropped file type is not supported'),
			autoHideTimeout: 3000,
			hideButton: true
		});
	}, [createSnackbar]);
}

/**
 * Whether the event drags files from outside the page over a part of the
 * editor that does not handle them: anything but the editable text, whose
 * drags are left to the editor (it inserts the dropped files and keeps the
 * native drop caret).
 */
function isStrayFileDrag(event: DragEvent<HTMLElement>): boolean {
	const { dataTransfer, target } = event;
	if (event.isDefaultPrevented() || !dataTransfer) {
		return false;
	}
	const types = new Set(dataTransfer.types);
	// An inline image dragged out of the text: there is no file to open
	if (types.has(INLINE_IMAGE_DRAG_TYPE)) {
		return false;
	}
	if (!types.has('Files') && dataTransfer.files.length === 0) {
		return false;
	}
	return !(target instanceof Element && target.closest('[contenteditable="true"]'));
}

export type FileDropGuardHandlers = {
	onDragOver: (event: DragEvent<HTMLElement>) => void;
	onDrop: (event: DragEvent<HTMLElement>) => void;
};

/**
 * Handlers, for the element wrapping the whole editor, that keep the browser
 * from opening a file dropped on the editor out of its editable text (on the
 * toolbar, or anywhere while the editor is read-only), which would leave the
 * application and lose the changes. The drop is reported as unsupported, as the
 * previous TinyMCE composer did (`block_unsupported_drop`).
 */
export function useFileDropGuard(): FileDropGuardHandlers {
	const reportUnsupportedFileDrop = useReportUnsupportedFileDrop();
	return useMemo(
		() => ({
			onDragOver: (event): void => {
				if (isStrayFileDrag(event)) {
					// Accept the drop, so that the browser does not handle it
					event.preventDefault();
				}
			},
			onDrop: (event): void => {
				if (isStrayFileDrag(event)) {
					event.preventDefault();
					reportUnsupportedFileDrop();
				}
			}
		}),
		[reportUnsupportedFileDrop]
	);
}
