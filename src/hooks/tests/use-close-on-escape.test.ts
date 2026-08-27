/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { renderHook } from '@testing-library/react';

import { useCloseOnEscape } from '../use-close-on-escape';

describe('useCloseOnEscape', () => {
	it('calls onEscape exactly once when Escape is pressed while active', () => {
		const onEscape = vi.fn();
		renderHook(() => useCloseOnEscape(true, onEscape));

		const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true, bubbles: true });
		document.dispatchEvent(event);

		expect(onEscape).toHaveBeenCalledTimes(1);
	});

	it('calls preventDefault and stopPropagation on the Escape event while active', () => {
		const onEscape = vi.fn();
		renderHook(() => useCloseOnEscape(true, onEscape));

		const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true, bubbles: true });
		const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
		const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');
		document.dispatchEvent(event);

		expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
		expect(stopPropagationSpy).toHaveBeenCalledTimes(1);
	});

	it('does not call onEscape when a non-Escape key is pressed while active', () => {
		const onEscape = vi.fn();
		renderHook(() => useCloseOnEscape(true, onEscape));

		const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true, bubbles: true });
		document.dispatchEvent(event);

		expect(onEscape).not.toHaveBeenCalled();
	});

	it('does not call onEscape when Escape is pressed while inactive', () => {
		const onEscape = vi.fn();
		renderHook(() => useCloseOnEscape(false, onEscape));

		const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true, bubbles: true });
		document.dispatchEvent(event);

		expect(onEscape).not.toHaveBeenCalled();
	});

	it('removes the listener on unmount so onEscape is not called afterwards', () => {
		const onEscape = vi.fn();
		const { unmount } = renderHook(() => useCloseOnEscape(true, onEscape));

		unmount();

		const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true, bubbles: true });
		document.dispatchEvent(event);

		expect(onEscape).not.toHaveBeenCalled();
	});
});
