/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PRINT_PAGE_CSP, renderPrintDocument, renderPrintMessage } from './print-document';
import { PrintModel } from './print-model';

const XSS = '<img src=x onerror="window.pwned()"><script>window.pwned()</script>';

const hostileModel = (): PrintModel => ({
	lang: 'en',
	title: `Title ${XSS}`,
	fields: [
		{ label: 'When', value: 'Friday' },
		// eslint-disable-next-line no-script-url -- deliberate hostile payload
		{ label: 'Location', value: `</dd><a href="javascript:window.pwned()">x</a>` }
	],
	attendees: { label: 'Attendees', values: [`Evil ${XSS} <evil@example.com>`] },
	description: `Line 1\n${XSS}\n<style>body{background:url(https://evil.example)}</style>`
});

const newDocument = (): Document => document.implementation.createHTMLDocument('');

// jest-dom matchers reject nodes of another document realm, so read the values directly
const attr = (element: Element, name: string): string | null => element.getAttribute(name);
const text = (node: Node): string | null => node.textContent;

describe('renderPrintDocument', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('puts the restrictive CSP first in the head, before any content', () => {
		const doc = newDocument();
		renderPrintDocument(doc, hostileModel());

		const first = doc.head.firstElementChild as HTMLMetaElement;
		expect(first.tagName).toBe('META');
		expect(first.httpEquiv).toBe('Content-Security-Policy');
		expect(first.content).toBe(PRINT_PAGE_CSP);
		expect(PRINT_PAGE_CSP).toContain("default-src 'none'");
		expect(PRINT_PAGE_CSP).not.toContain('script-src');
	});

	it('writes untrusted values as text only: no element comes from the data', () => {
		const doc = newDocument();
		renderPrintDocument(doc, hostileModel());

		expect(doc.querySelectorAll('script, img, a, iframe, object, embed, link, svg')).toHaveLength(
			0
		);
		// the only style element is the static one in the head
		expect(doc.querySelectorAll('style')).toHaveLength(1);
		expect(doc.body.querySelector('style')).toBeNull();
		expect(doc.querySelector('h1')?.textContent).toBe(`Title ${XSS}`);
		expect(doc.querySelector('dd:last-of-type')?.textContent).toContain('<a href=');
		expect(doc.querySelector('li')?.textContent).toBe(`Evil ${XSS} <evil@example.com>`);
		expect(doc.querySelector('.description')?.textContent).toContain('<style>');
	});

	it('does not run any script from the data', () => {
		const pwned = vi.fn();
		vi.stubGlobal('pwned', pwned);
		const doc = newDocument();

		renderPrintDocument(doc, hostileModel());

		expect(pwned).not.toHaveBeenCalled();
	});

	it('uses the title as document title and sets the language', () => {
		const doc = newDocument();
		renderPrintDocument(doc, hostileModel());

		expect(doc.title).toBe(`Title ${XSS}`);
		expect(attr(doc.documentElement, 'lang')).toBe('en');
	});

	it('drops bidi controls from the tab title but keeps them, isolated, in the page', () => {
		const doc = newDocument();
		const spoofed = 'invoice\u202Efdp.exe\u2066x\u2069';
		renderPrintDocument(doc, { ...hostileModel(), title: spoofed });

		expect(doc.title).toBe('invoicefdp.exex');
		expect(doc.querySelector('h1')?.textContent).toBe(spoofed);
	});

	it('isolates the direction of every value', () => {
		const doc = newDocument();
		renderPrintDocument(doc, hostileModel());

		doc.body.querySelectorAll('h1, dt, dd, li, .description').forEach((element) => {
			expect(attr(element, 'dir')).toBe('auto');
		});
	});

	it('skips the empty sections', () => {
		const doc = newDocument();
		renderPrintDocument(doc, {
			lang: 'en',
			title: 'Only title',
			fields: [],
			attendees: { label: 'Attendees', values: [] },
			description: ''
		});

		expect(doc.querySelector('dl')).toBeNull();
		expect(doc.querySelector('ul')).toBeNull();
		expect(doc.querySelector('.description')).toBeNull();
	});

	it('replaces any previous content of the page', () => {
		const doc = newDocument();
		doc.body.innerHTML = '<p id="old">old</p>';

		renderPrintDocument(doc, hostileModel());

		expect(doc.getElementById('old')).toBeNull();
	});
});

describe('renderPrintMessage', () => {
	it('shows only the message, with the same CSP', () => {
		const doc = newDocument();
		renderPrintMessage(doc, 'Something went wrong', 'en');

		expect(text(doc.body)).toBe('Something went wrong');
		expect((doc.head.firstElementChild as HTMLMetaElement).content).toBe(PRINT_PAGE_CSP);
	});
});
