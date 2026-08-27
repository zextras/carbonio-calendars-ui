/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { RefObject, useEffect } from 'react';

/**
 * While `active` is true, marks every document click landing OUTSIDE `contentRef` as
 * `defaultPrevented` (capture phase, before the click reaches any ancestor). Use it to stop a
 * design-system `CustomModal`'s backdrop-click handler (which only closes when
 * `!event.defaultPrevented`) from closing an outer modal because of a genuine backdrop click
 * while an inner popover/overlay owned by this component is still open.
 *
 * Clicks inside `contentRef` are left untouched: the design-system `Button` component also
 * skips its own `onClick` when `event.defaultPrevented` is already true, so preventing every
 * click indiscriminately would silently break buttons (e.g. Save/Cancel) inside the popover.
 */
export const usePreventBackdropClose = (
	active: boolean,
	contentRef: RefObject<HTMLElement>
): void => {
	useEffect(() => {
		if (!active) {
			return undefined;
		}
		const preventOutsideDefault = (event: MouseEvent): void => {
			if (
				event.target instanceof Node &&
				contentRef.current &&
				!contentRef.current.contains(event.target)
			) {
				event.preventDefault();
			}
		};
		document.addEventListener('click', preventOutsideDefault, { capture: true });
		return () => document.removeEventListener('click', preventOutsideDefault, { capture: true });
	}, [active, contentRef]);
};
