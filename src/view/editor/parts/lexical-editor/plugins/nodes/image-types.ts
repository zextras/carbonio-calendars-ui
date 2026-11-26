/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createCommand, type LexicalCommand } from 'lexical';

export type ImageDimension = number | 'inherit';

/**
 * Opens the Insert/Edit Image modal (dispatched e.g. on image double-click).
 * Lives here, on a dependency-free module, so both the image plugin/toolbar and
 * the image component can import it without creating an import cycle.
 */
export const OPEN_IMAGE_MODAL_COMMAND: LexicalCommand<void> = createCommand(
	'OPEN_IMAGE_MODAL_COMMAND'
);

/**
 * `DataTransfer` type carrying the inline image being dragged inside the
 * editor (see the `ImagePlugin`). Lowercase, as browsers normalize the
 * `DataTransfer.types` entries. Same value as in carbonio-mails-ui, so that an
 * image dragged between the two composers is ignored instead of being dropped
 * as a file or as HTML.
 */
export const INLINE_IMAGE_DRAG_TYPE = 'application/x-carbonio-inline-image';
