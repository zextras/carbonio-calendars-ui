/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect } from 'react';

/**
 * While `active` is true, intercepts every Escape keydown (capture phase, before it reaches any
 * ancestor) and calls `onEscape` instead of letting it propagate.
 *
 * This exists because the design-system `CustomModal` closes on Escape via its own listener
 * (`useKeyboard(modalRef, ...)`, a plain `addEventListener` on the modal's own DOM node) that
 * unconditionally calls the modal's `onClose` whenever the key matches — unlike its backdrop-click
 * handler, it never checks `event.defaultPrevented`. So a `preventDefault()`-only guard (as used
 * for backdrop clicks) can't stop it: the Escape keydown still bubbles from a focused element
 * inside an inner popover up through the modal's own node and closes the whole modal too. Only
 * `stopPropagation()`, called before the event reaches that node, prevents this — which is exactly
 * what this hook does, closing just the popover ourselves instead.
 */
export const useCloseOnEscape = (active: boolean, onEscape: () => void): void => {
	useEffect(() => {
		if (!active) {
			return undefined;
		}
		const closeOnEscape = (event: KeyboardEvent): void => {
			if (event.key === 'Escape') {
				event.preventDefault();
				event.stopPropagation();
				onEscape();
			}
		};
		document.addEventListener('keydown', closeOnEscape, { capture: true });
		return () => document.removeEventListener('keydown', closeOnEscape, { capture: true });
	}, [active, onEscape]);
};
