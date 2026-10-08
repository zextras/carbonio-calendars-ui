/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { sanitizeEditorHtml } from '../sanitize-html';

describe('sanitizeEditorHtml', () => {
	it('strips <script> tags entirely', () => {
		const result = sanitizeEditorHtml('<p>hello</p><script>alert(1)</script>');
		expect(result).not.toContain('<script');
		expect(result).not.toContain('alert');
		expect(result).toContain('<p>hello</p>');
	});

	it('strips event-handler attributes such as onerror', () => {
		const result = sanitizeEditorHtml('<img src="x" onerror="alert(1)" alt="pic">');
		expect(result).not.toContain('onerror');
		expect(result).toContain('<img');
	});

	it('strips javascript: hrefs', () => {
		const dangerousProtocol = ['java', 'script:alert(1)'].join('');
		const result = sanitizeEditorHtml(`<a href="${dangerousProtocol}">click</a>`);
		expect(result).not.toContain(dangerousProtocol);
	});

	it('keeps allowed formatting tags and inline style attributes', () => {
		const html = '<p><span style="color: rgb(255, 0, 0); font-family: Arial">red text</span></p>';
		const result = sanitizeEditorHtml(html);
		expect(result).toContain('color: rgb(255, 0, 0)');
		expect(result).toContain('font-family: Arial');
	});

	it('keeps tables and images with allowed attributes', () => {
		const html =
			'<table><tr><td colspan="2">cell</td></tr></table><img src="https://example.com/a.png" alt="a" width="10" height="10">';
		const result = sanitizeEditorHtml(html);
		expect(result).toContain('<table>');
		expect(result).toContain('colspan="2"');
		expect(result).toContain('src="https://example.com/a.png"');
	});

	it('drops disallowed tags like iframe while keeping their text content out', () => {
		const result = sanitizeEditorHtml('<iframe src="https://evil.example"></iframe><p>safe</p>');
		expect(result).not.toContain('<iframe');
		expect(result).toContain('<p>safe</p>');
	});
});
