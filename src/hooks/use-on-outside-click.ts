/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { RefObject, useEffect } from 'react';

/**
 * While `active` is true, calls `onOutsideClick` on any click landing outside both `contentRef`
 * and `anchorRef` (capture phase, before it reaches any ancestor). `anchorRef` is excluded so
 * clicking the element that opened the popover is left to that element's own toggle handler
 * instead of being treated as an outside click too.
 *
 * The capture phase matters when the caller sits inside a design-system `CustomModal`: its
 * backdrop-click handler (`onClick` on its outermost node) unconditionally calls
 * `stopPropagation()` on every click within the modal, so a bubble-phase listener (e.g. the one
 * `Popover`/`Popper` add on `document` to auto-close) never fires. A capture-phase listener runs
 * before that handler, so it isn't affected.
 */
export const useOnOutsideClick = (
	active: boolean,
	contentRef: RefObject<HTMLElement>,
	anchorRef: RefObject<HTMLElement>,
	onOutsideClick: () => void
): void => {
	useEffect(() => {
		if (!active) {
			return undefined;
		}
		const handleOutsideClick = (event: MouseEvent): void => {
			if (!(event.target instanceof Node)) {
				return;
			}
			const { target } = event;
			if (!contentRef.current?.contains(target) && !anchorRef.current?.contains(target)) {
				onOutsideClick();
			}
		};
		document.addEventListener('click', handleOutsideClick, { capture: true });
		return () => document.removeEventListener('click', handleOutsideClick, { capture: true });
	}, [active, contentRef, anchorRef, onOutsideClick]);
};
