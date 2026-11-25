/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect } from 'react';

import {
	$isAutoLinkNode,
	type AutoLinkNode,
	createLinkMatcherWithRegExp,
	type LinkMatcher,
	registerAutoLink
} from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { $isTextNode, type LexicalNode, TextNode } from 'lexical';

const URL_REGEX =
	// eslint-disable-next-line max-len
	/((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(?<![-.+():%])/;

const EMAIL_REGEX = /[^<>()[\]\\,;:\s@"]{1,64}@(?:[a-zA-Z\d-]{1,63}\.)+[a-zA-Z]{2,24}/;

// Auto-links open in a new window, the same default the "Insert/Edit Link" modal uses.
// `noopener noreferrer` keeps the opened page from reaching back to this tab.
const NEW_WINDOW_ATTRIBUTES = { target: '_blank', rel: 'noopener noreferrer' };

const createNewWindowLinkMatcher = (
	regExp: RegExp,
	urlTransformer: (text: string) => string
): LinkMatcher => {
	const matcher = createLinkMatcherWithRegExp(regExp, urlTransformer);
	return (text) => {
		const match = matcher(text);
		return match && { ...match, attributes: NEW_WINDOW_ATTRIBUTES };
	};
};

const MATCHERS = [
	createNewWindowLinkMatcher(URL_REGEX, (text) =>
		text.startsWith('http') ? text : `https://${text}`
	),
	createNewWindowLinkMatcher(EMAIL_REGEX, (text) => `mailto:${text}`)
];

/**
 * Returns the first auto-link match found in `text`: the first matcher that
 * matches decides, as in the auto-link plugin.
 */
export const findFirstAutoLink = (text: string): ReturnType<LinkMatcher> =>
	MATCHERS.reduce<ReturnType<LinkMatcher>>((found, matcher) => found ?? matcher(text), null);

/**
 * Returns the auto-link match of `text` only when the whole text is that link, the
 * condition under which the auto-link plugin keeps an existing auto-link.
 */
export const matchWholeAutoLink = (text: string): ReturnType<LinkMatcher> => {
	const match = findFirstAutoLink(text);
	return match?.text === text ? match : null;
};

/**
 * Returns the auto-link match that starts at the beginning of `text`: the first matcher
 * that matches there decides. Unlike `findFirstAutoLink`, a link that an earlier matcher
 * finds further on (e.g. a URL after an email address) does not hide it.
 */
const findAutoLinkAtStart = (text: string): ReturnType<LinkMatcher> =>
	MATCHERS.map((matcher) => matcher(text)).find((match) => match?.index === 0) ?? null;

// The characters the auto-link plugin wants around a link (its default `separatorRegex`).
const SEPARATOR_REGEX = /[.,;\s]/;

/** Returns where the text after the last separator of `text` starts. */
const startAfterLastSeparator = (text: string): number => {
	let start = text.length;
	while (start > 0 && !SEPARATOR_REGEX.test(text.charAt(start - 1))) {
		start -= 1;
	}
	return start;
};

const $isRemovedAutoLink = (node: LexicalNode | null): node is AutoLinkNode =>
	$isAutoLinkNode(node) && node.getIsUnlinked();

/**
 * Moves into `removedLink` the start of the content right after it, when there is no
 * separator in between and the auto-link matchers would make that start part of the
 * same link. Returns whether the content after it may be glued as well.
 */
function $absorbGluedContentAfter(removedLink: AutoLinkNode): boolean {
	const next = removedLink.getNextSibling();
	if (!(($isTextNode(next) && next.isSimpleText()) || $isRemovedAutoLink(next))) {
		return false;
	}
	const removedText = removedLink.getTextContent();
	const nextText = next.getTextContent();
	const match = findAutoLinkAtStart(removedText + nextText);
	const gluedLength = match ? match.length - removedText.length : 0;
	if (SEPARATOR_REGEX.test(nextText.charAt(0)) || gluedLength <= 0) {
		return false;
	}
	if ($isTextNode(next)) {
		const [glued] = gluedLength < nextText.length ? next.splitText(gluedLength) : [next];
		removedLink.append(glued);
		return gluedLength === nextText.length;
	}
	if (gluedLength < nextText.length) {
		return false;
	}
	removedLink.append(...next.getChildren());
	next.remove();
	return true;
}

/**
 * Moves into `removedLink` the end of the text right before it, when there is no
 * separator in between and the auto-link matchers would make that end and the removed
 * link a single link. Returns whether the text before it may be glued as well.
 *
 * A link starts only after a separator, so only the text after the last one can be
 * glued: an email address takes it in (`x` + `someone@domain.com`), a URL does not
 * (`x` + `https://domain.com`), unless it completes the URL (`https://` + `www.domain.com`).
 */
function $absorbGluedTextBefore(removedLink: AutoLinkNode): boolean {
	const previous = removedLink.getPreviousSibling();
	if (!$isTextNode(previous) || !previous.isSimpleText()) {
		return false;
	}
	const previousText = previous.getTextContent();
	const gluedStart = startAfterLastSeparator(previousText);
	const gluedText = previousText.slice(gluedStart);
	const linkText = gluedText + removedLink.getTextContent();
	const match = findFirstAutoLink(linkText);
	if (gluedText === '' || match?.index !== 0 || match.text !== linkText) {
		return false;
	}
	const glued = gluedStart > 0 ? previous.splitText(gluedStart)[1] : previous;
	removedLink.splice(0, 0, [glued]);
	return gluedStart === 0;
}

function $absorbGluedContentAround(removedLink: AutoLinkNode): void {
	while ($absorbGluedContentAfter(removedLink)) {
		// Each pass moves one node: the content after it may be glued too.
	}
	while ($absorbGluedTextBefore(removedLink)) {
		// Each pass moves one node: the text before it may be glued too.
	}
}

/**
 * Keeps a removed auto-link plain when content is glued to it with no separator in
 * between: text typed right after it (e.g. a path added to a URL), another removed
 * link right after it, or text right before it (e.g. a letter typed before an email
 * address).
 *
 * The auto-link plugin wants a separator around a removed link too. When it checks
 * the removed link again (on an edit of its text, and on every HTML load, such as
 * reopening an appointment) it unwraps the link and links the text again, glued
 * content included. Once that content is inside the removed link, the check passes
 * and the text stays plain.
 */
function $keepGluedTextInRemovedAutoLink(textNode: TextNode): void {
	const parent = textNode.getParent();
	if ($isRemovedAutoLink(parent)) {
		$absorbGluedContentAround(parent);
		return;
	}
	const previous = textNode.getPreviousSibling();
	if ($isRemovedAutoLink(previous)) {
		$absorbGluedContentAround(previous);
	}
	// Read after the previous link took in what it could: the text may be in it now.
	const next = textNode.getNextSibling();
	if ($isRemovedAutoLink(next)) {
		$absorbGluedContentAround(next);
	}
}

export const AutoLinkPlugin = (): null => {
	const [editor] = useLexicalComposerContext();

	useEffect(
		() =>
			mergeRegister(
				// Transforms run in the order they are registered: the glued text has to be
				// moved before the auto-link transform checks the removed link.
				editor.registerNodeTransform(TextNode, $keepGluedTextInRemovedAutoLink),
				registerAutoLink(editor, { matchers: MATCHERS, changeHandlers: [], excludeParents: [] })
			),
		[editor]
	);

	return null;
};
