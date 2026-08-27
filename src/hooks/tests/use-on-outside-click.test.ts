/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { RefObject } from 'react';

import { renderHook } from '@testing-library/react';

import { useOnOutsideClick } from '../use-on-outside-click';

describe('useOnOutsideClick', () => {
	let contentEl: HTMLDivElement;
	let anchorEl: HTMLDivElement;
	let outsideEl: HTMLDivElement;
	let contentRef: RefObject<HTMLElement>;
	let anchorRef: RefObject<HTMLElement>;

	beforeEach(() => {
		contentEl = document.createElement('div');
		anchorEl = document.createElement('div');
		outsideEl = document.createElement('div');
		document.body.appendChild(contentEl);
		document.body.appendChild(anchorEl);
		document.body.appendChild(outsideEl);
		contentRef = { current: contentEl };
		anchorRef = { current: anchorEl };
	});

	afterEach(() => {
		contentEl.remove();
		anchorEl.remove();
		outsideEl.remove();
	});

	it('calls onOutsideClick on a click outside both contentRef and anchorRef while active', () => {
		const onOutsideClick = vi.fn();
		renderHook(() => useOnOutsideClick(true, contentRef, anchorRef, onOutsideClick));

		outsideEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(onOutsideClick).toHaveBeenCalledTimes(1);
	});

	it('does not call onOutsideClick on a click inside contentRef while active', () => {
		const onOutsideClick = vi.fn();
		renderHook(() => useOnOutsideClick(true, contentRef, anchorRef, onOutsideClick));

		contentEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(onOutsideClick).not.toHaveBeenCalled();
	});

	it('does not call onOutsideClick on a click on anchorRef while active', () => {
		const onOutsideClick = vi.fn();
		renderHook(() => useOnOutsideClick(true, contentRef, anchorRef, onOutsideClick));

		anchorEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(onOutsideClick).not.toHaveBeenCalled();
	});

	it('does not call onOutsideClick on an outside click while inactive', () => {
		const onOutsideClick = vi.fn();
		renderHook(() => useOnOutsideClick(false, contentRef, anchorRef, onOutsideClick));

		outsideEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(onOutsideClick).not.toHaveBeenCalled();
	});

	it('removes the listener on unmount so outside clicks no longer trigger it', () => {
		const onOutsideClick = vi.fn();
		const { unmount } = renderHook(() =>
			useOnOutsideClick(true, contentRef, anchorRef, onOutsideClick)
		);

		unmount();
		outsideEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(onOutsideClick).not.toHaveBeenCalled();
	});
});
