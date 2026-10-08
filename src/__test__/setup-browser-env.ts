/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { vi } from 'vitest';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}))
});

// jsdom has no layout engine, so neither Range nor Element implement
// getBoundingClientRect's geometry — but Lexical's reconciler calls
// `selectionTarget.getBoundingClientRect()` on every DOM selection update
// (not just from floating-UI positioning code), so without a stub any test
// that types into a Lexical editor throws "getBoundingClientRect is not a
// function" from inside Lexical's commit phase.
if (typeof Range.prototype.getBoundingClientRect !== 'function') {
	Range.prototype.getBoundingClientRect = function getBoundingClientRect(): DOMRect {
		return {
			bottom: 0,
			height: 0,
			left: 0,
			right: 0,
			top: 0,
			width: 0,
			x: 0,
			y: 0,
			toJSON: () => ({})
		};
	};
}

// Mock DOMMatrix for pdfjs-dist
if (typeof globalThis.DOMMatrix === 'undefined') {
	globalThis.DOMMatrix = class DOMMatrix {
		a: number;

		b: number;

		c: number;

		d: number;

		e: number;

		f: number;

		constructor() {
			this.a = 1;
			this.b = 0;
			this.c = 0;
			this.d = 1;
			this.e = 0;
			this.f = 0;
		}
	} as any;
}
