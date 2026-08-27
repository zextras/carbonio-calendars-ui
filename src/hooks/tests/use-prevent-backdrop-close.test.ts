/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { RefObject } from 'react';

import { renderHook } from '@testing-library/react';

import { usePreventBackdropClose } from '../use-prevent-backdrop-close';

describe('usePreventBackdropClose', () => {
	let contentEl: HTMLDivElement;
	let outsideEl: HTMLDivElement;
	let contentRef: RefObject<HTMLElement>;

	beforeEach(() => {
		contentEl = document.createElement('div');
		outsideEl = document.createElement('div');
		document.body.appendChild(contentEl);
		document.body.appendChild(outsideEl);
		contentRef = { current: contentEl };
	});

	afterEach(() => {
		contentEl.remove();
		outsideEl.remove();
	});

	it('calls preventDefault on a click outside contentRef while active', () => {
		renderHook(() => usePreventBackdropClose(true, contentRef));

		const event = new MouseEvent('click', { bubbles: true, cancelable: true });
		outsideEl.dispatchEvent(event);

		expect(event.defaultPrevented).toBe(true);
	});

	it('does not call preventDefault on a click inside contentRef while active', () => {
		renderHook(() => usePreventBackdropClose(true, contentRef));

		const event = new MouseEvent('click', { bubbles: true, cancelable: true });
		contentEl.dispatchEvent(event);

		expect(event.defaultPrevented).toBe(false);
	});

	it('does not call preventDefault on an outside click while inactive', () => {
		renderHook(() => usePreventBackdropClose(false, contentRef));

		const event = new MouseEvent('click', { bubbles: true, cancelable: true });
		outsideEl.dispatchEvent(event);

		expect(event.defaultPrevented).toBe(false);
	});

	it('removes the listener on unmount so outside clicks are no longer prevented', () => {
		const { unmount } = renderHook(() => usePreventBackdropClose(true, contentRef));

		unmount();

		const event = new MouseEvent('click', { bubbles: true, cancelable: true });
		outsideEl.dispatchEvent(event);

		expect(event.defaultPrevented).toBe(false);
	});
});
