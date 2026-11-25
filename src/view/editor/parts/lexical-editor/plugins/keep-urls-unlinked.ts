/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { $createAutoLinkNode, $isLinkNode } from '@lexical/link';
import { $isTextNode, type LexicalNode, type NodeKey, type TextNode } from 'lexical';

import { findFirstAutoLink } from './auto-link-plugin';

type LinkRange = { start: number; end: number; url: string };

type RunPiece = { node: TextNode; start: number; end: number };

const $isRunNode = (node: LexicalNode | null): node is TextNode =>
	$isTextNode(node) && node.isSimpleText();

/**
 * The simple text siblings around `textNode`: the auto-link plugin matches them as
 * one text, so a link can span several of them (e.g. a URL partly in bold).
 */
function $runAround(textNode: TextNode): Array<TextNode> {
	let first = textNode;
	let previous = first.getPreviousSibling();
	while ($isRunNode(previous)) {
		first = previous;
		previous = first.getPreviousSibling();
	}
	const run: Array<TextNode> = [];
	let node: LexicalNode | null = first;
	while ($isRunNode(node)) {
		run.push(node);
		node = node.getNextSibling();
	}
	return run;
}

const piecesOf = (nodes: Array<TextNode>): Array<RunPiece> => {
	let offset = 0;
	return nodes.map((node) => {
		const start = offset;
		offset += node.getTextContentSize();
		return { node, start, end: offset };
	});
};

/**
 * Every link the auto-link plugin ends up creating in `text`. The first matcher
 * decides, so an email address before a URL is found only once the URL is linked
 * and the text before it is matched again: both sides of a match are matched again
 * here as well. A match whose neighbours do not allow a link is left to the plugin,
 * which unwraps such a link.
 */
function findAutoLinks(text: string, offset = 0): Array<LinkRange> {
	const match = findFirstAutoLink(text);
	if (!match) {
		return [];
	}
	const end = match.index + match.length;
	return [
		...findAutoLinks(text.slice(0, match.index), offset),
		{ start: offset + match.index, end: offset + end, url: match.url },
		...findAutoLinks(text.slice(end), offset + end)
	];
}

/**
 * Wraps the links of `run` that overlap a removed node into unlinked auto-links,
 * splitting the text nodes at their edges so the formatting of each part is kept.
 */
function $wrapRemovedLinks(run: Array<TextNode>, removed: Set<NodeKey>): void {
	const pieces = piecesOf(run);
	const ranges = findAutoLinks(run.map((node) => node.getTextContent()).join('')).filter(
		({ start, end }) =>
			pieces.some(
				(piece) => removed.has(piece.node.getKey()) && piece.start < end && piece.end > start
			)
	);
	if (ranges.length === 0) {
		return;
	}
	const cuts = ranges.flatMap(({ start, end }) => [start, end]);
	const splitPieces = piecesOf(
		pieces.flatMap(({ node, start, end }) => {
			const offsets = cuts.filter((cut) => cut > start && cut < end).map((cut) => cut - start);
			return offsets.length > 0 ? node.splitText(...offsets) : [node];
		})
	);
	ranges.forEach(({ start, end, url }) => {
		const inside = splitPieces
			.filter((piece) => piece.start >= start && piece.end <= end)
			.map(({ node }) => node);
		const autoLink = $createAutoLinkNode(url, { isUnlinked: true });
		inside[0].insertBefore(autoLink);
		autoLink.append(...inside);
	});
}

/**
 * Wraps every link the auto-link plugin would create from `textNodes`, the text of
 * a link that has just been unwrapped, into an unlinked auto-link: otherwise the
 * plugin would turn that text into a link again. The text around them is matched
 * too, as the plugin does: a link may start before the removed one (e.g. when
 * `https://` sits right before it). Must run inside an editor update.
 */
export function $keepUrlsUnlinked(textNodes: Array<TextNode>): void {
	const removed = new Set(textNodes.map((node) => node.getKey()));
	const matched = new Set<NodeKey>();
	textNodes.forEach((textNode) => {
		if (
			matched.has(textNode.getKey()) ||
			!textNode.isAttached() ||
			!textNode.isSimpleText() ||
			// The plugin never links the text of a link.
			$isLinkNode(textNode.getParent())
		) {
			return;
		}
		const run = $runAround(textNode);
		run.forEach((node) => matched.add(node.getKey()));
		$wrapRemovedLinks(run, removed);
	});
}
