/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, createEditor, type LexicalEditor } from 'lexical';

import { $createImageNode, $isImageNode, ImageNode, type SerializedImageNode } from '../image-node';

function createTestEditor(): LexicalEditor {
	return createEditor({
		namespace: 'ImageNodeTest',
		nodes: [ImageNode],
		onError: (error: Error): void => {
			throw error;
		}
	});
}

describe('ImageNode', () => {
	it('defaults altText to "Image" and dimensions to "inherit" when not provided', () => {
		const editor = createTestEditor();
		editor.update(() => {
			const node = $createImageNode('https://example.com/pic.png');
			expect(node.getAltText()).toBe('Image');
			expect(node.getWidth()).toBe('inherit');
			expect(node.getHeight()).toBe('inherit');
			expect(node.getSrc()).toBe('https://example.com/pic.png');
		});
	});

	it('$isImageNode narrows an ImageNode and rejects other nodes', () => {
		const editor = createTestEditor();
		editor.update(() => {
			const node = $createImageNode('https://example.com/pic.png');
			expect($isImageNode(node)).toBe(true);
			expect($isImageNode($getRoot())).toBe(false);
			expect($isImageNode(null)).toBe(false);
			expect($isImageNode(undefined)).toBe(false);
		});
	});

	it('exportJSON/importJSON round-trips src/altText/width/height with no cidUrl or alignment keys', () => {
		const editor = createTestEditor();
		let serialized: SerializedImageNode | undefined;

		editor.update(() => {
			const node = $createImageNode('https://example.com/pic.png', 'a picture', 100, 50);
			serialized = node.exportJSON();
		});

		expect(serialized).toBeDefined();
		// Lock in the trim: the serialized shape must never carry cid/alignment bookkeeping.
		expect(Object.keys(serialized as SerializedImageNode).sort()).toEqual(
			['altText', 'height', 'src', 'type', 'version', 'width'].sort()
		);
		expect(serialized).not.toHaveProperty('cidUrl');
		expect(serialized).not.toHaveProperty('alignment');

		editor.update(() => {
			const imported = ImageNode.importJSON(serialized as SerializedImageNode);
			expect(imported.getSrc()).toBe('https://example.com/pic.png');
			expect(imported.getAltText()).toBe('a picture');
			expect(imported.getWidth()).toBe(100);
			expect(imported.getHeight()).toBe(50);
		});
	});

	it('importDOM parses a plain <img> tag (e.g. authored by another calendar client) into an ImageNode', () => {
		const editor = createTestEditor();
		const dom = new DOMParser().parseFromString(
			'<img src="https://example.com/legacy.png" alt="legacy pic" width="320" height="240" />',
			'text/html'
		);

		editor.update(() => {
			const nodes = $generateNodesFromDOM(editor, dom);
			const imageNode = nodes.find($isImageNode);
			expect(imageNode).toBeDefined();
			expect(imageNode?.getSrc()).toBe('https://example.com/legacy.png');
			expect(imageNode?.getAltText()).toBe('legacy pic');
			expect(imageNode?.getWidth()).toBe(320);
			expect(imageNode?.getHeight()).toBe(240);
		});
	});

	it('importDOM reads width/height from inline style when attributes are absent', () => {
		const editor = createTestEditor();
		const dom = new DOMParser().parseFromString(
			'<img src="https://example.com/styled.png" alt="styled" style="width: 150px; height: 75px;" />',
			'text/html'
		);

		editor.update(() => {
			const nodes = $generateNodesFromDOM(editor, dom);
			const imageNode = nodes.find($isImageNode);
			expect(imageNode?.getWidth()).toBe(150);
			expect(imageNode?.getHeight()).toBe(75);
		});
	});

	it('exportDOM serializes src/alt/width/height only, never data-pnsrc/data-mce-src/float/margin', () => {
		const editor = createTestEditor();

		editor.update(() => {
			const root = $getRoot();
			root.clear();
			const node = $createImageNode('https://example.com/pic.png', 'a picture', 100, 50);
			root.append(node);
		});

		let html = '';
		editor.read(() => {
			html = $generateHtmlFromNodes(editor, null);
		});

		expect(html).toContain('src="https://example.com/pic.png"');
		expect(html).toContain('alt="a picture"');
		expect(html).toContain('width: 100px');
		expect(html).toContain('height: 50px');
		expect(html).not.toContain('data-pnsrc');
		expect(html).not.toContain('data-mce-src');
		expect(html).not.toContain('float');
		expect(html).not.toContain('margin');
	});

	it('clone preserves src/altText/width/height', () => {
		const editor = createTestEditor();
		editor.update(() => {
			const node = $createImageNode('https://example.com/pic.png', 'alt', 10, 20);
			const cloned = ImageNode.clone(node);
			expect(cloned.getSrc()).toBe('https://example.com/pic.png');
			expect(cloned.getAltText()).toBe('alt');
			expect(cloned.getWidth()).toBe(10);
			expect(cloned.getHeight()).toBe(20);
		});
	});
});
