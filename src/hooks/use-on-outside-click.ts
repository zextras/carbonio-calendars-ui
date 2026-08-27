/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { RefObject, useEffect, useRef } from 'react';

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
 *
 * A click is also ignored if the gesture that produced it *started* (on `mousedown`) inside
 * `contentRef`, even if it ends outside — e.g. dragging a `react-colorful` picker handle past the
 * popover's edge and releasing there. The browser's native `click` targets wherever `mouseup`
 * landed, not where the drag began, so without this the drag would otherwise read as an outside
 * click and close the popover mid-interaction.
 */
export const useOnOutsideClick = (
	active: boolean,
	contentRef: RefObject<HTMLElement>,
	anchorRef: RefObject<HTMLElement>,
	onOutsideClick: () => void
): void => {
	const dragStartedInsideRef = useRef(false);

	useEffect(() => {
		if (!active) {
			return undefined;
		}
		const handleMouseDown = (event: MouseEvent): void => {
			dragStartedInsideRef.current =
				event.target instanceof Node && !!contentRef.current?.contains(event.target);
		};
		const handleOutsideClick = (event: MouseEvent): void => {
			const startedInside = dragStartedInsideRef.current;
			dragStartedInsideRef.current = false;
			if (startedInside || !(event.target instanceof Node)) {
				return;
			}
			const { target } = event;
			if (!contentRef.current?.contains(target) && !anchorRef.current?.contains(target)) {
				onOutsideClick();
			}
		};
		document.addEventListener('mousedown', handleMouseDown, { capture: true });
		document.addEventListener('click', handleOutsideClick, { capture: true });
		return () => {
			document.removeEventListener('mousedown', handleMouseDown, { capture: true });
			document.removeEventListener('click', handleOutsideClick, { capture: true });
		};
	}, [active, contentRef, anchorRef, onOutsideClick]);
};
