/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PrintModel } from './print-model';

// Appointment data is untrusted: it is written only as text, the CSP is a second line of defence.
export const PRINT_PAGE_CSP = [
	"default-src 'none'",
	"style-src 'unsafe-inline'",
	"img-src 'none'",
	"font-src 'none'",
	"connect-src 'none'",
	"form-action 'none'",
	"base-uri 'none'"
].join('; ');

const PRINT_PAGE_STYLE = `
body { font-family: Roboto, Arial, sans-serif; color: #000; background: #fff; margin: 2rem; line-height: 1.4; }
h1 { font-size: 1.5rem; margin: 0 0 1rem; overflow-wrap: anywhere; }
dl { display: grid; grid-template-columns: max-content 1fr; gap: 0.25rem 1rem; margin: 0 0 1rem; }
dt { font-weight: bold; }
dd { margin: 0; overflow-wrap: anywhere; white-space: pre-wrap; }
h2 { font-size: 1rem; margin: 1rem 0 0.25rem; }
ul { margin: 0; padding-left: 1.25rem; }
li { overflow-wrap: anywhere; }
.description { white-space: pre-wrap; overflow-wrap: anywhere; border-top: 1px solid #999; margin-top: 1rem; padding-top: 1rem; }
[dir='auto'] { unicode-bidi: plaintext; }
@page { margin: 1.5cm; }
@media print {
	body { margin: 0; }
	h1, h2, dt { break-after: avoid; }
	li { break-inside: avoid; }
}
`;

// LRE, RLE, PDF, LRO, RLO and the isolates LRI, RLI, FSI, PDI
const BIDI_CONTROLS = /[\u202A-\u202E\u2066-\u2069]/g;

const createTextElement = <K extends keyof HTMLElementTagNameMap>(
	doc: Document,
	tag: K,
	text: string
): HTMLElementTagNameMap[K] => {
	const element = doc.createElement(tag);
	element.textContent = text;
	// isolates bidi text per value
	element.dir = 'auto';
	return element;
};

const resetDocument = (doc: Document, title: string, lang: string): HTMLElement => {
	const head = doc.createElement('head');

	// CSP first, before any content
	const csp = doc.createElement('meta');
	csp.httpEquiv = 'Content-Security-Policy';
	csp.content = PRINT_PAGE_CSP;
	head.append(csp);

	const referrer = doc.createElement('meta');
	referrer.name = 'referrer';
	referrer.content = 'no-referrer';
	head.append(referrer);

	// tab titles are not bidi-isolated
	head.append(createTextElement(doc, 'title', title.replaceAll(BIDI_CONTROLS, '')));

	const style = doc.createElement('style');
	style.textContent = PRINT_PAGE_STYLE;
	head.append(style);

	const body = doc.createElement('body');
	doc.documentElement.replaceChildren(head, body);
	doc.documentElement.setAttribute('lang', lang);
	return body;
};

export const renderPrintDocument = (doc: Document, model: PrintModel): void => {
	const body = resetDocument(doc, model.title, model.lang);

	body.append(createTextElement(doc, 'h1', model.title));

	if (model.fields.length > 0) {
		const list = doc.createElement('dl');
		model.fields.forEach(({ label, value }) => {
			list.append(createTextElement(doc, 'dt', label), createTextElement(doc, 'dd', value));
		});
		body.append(list);
	}

	if (model.attendees.values.length > 0) {
		body.append(createTextElement(doc, 'h2', model.attendees.label));
		const list = doc.createElement('ul');
		model.attendees.values.forEach((value) => list.append(createTextElement(doc, 'li', value)));
		body.append(list);
	}

	if (model.description) {
		const description = createTextElement(doc, 'div', model.description);
		description.className = 'description';
		body.append(description);
	}
};

export const renderPrintMessage = (doc: Document, message: string, lang: string): void => {
	resetDocument(doc, message, lang).append(createTextElement(doc, 'p', message));
};
