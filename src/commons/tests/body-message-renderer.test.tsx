/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import { screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { ROOM_DIVIDER } from '../../constants';
import mockedData from '../../test/generators';
import { Invite } from '../../types/store/invite';
import { BodyMessageRenderer } from '../body-message-renderer';

const mockInvite = mockedData.getInvite();

describe('BodyMessageRenderer', () => {
	it('returns null when fullInvite is undefined', () => {
		const { container } = setupTest(
			<BodyMessageRenderer fullInvite={undefined as unknown as Invite} />
		);
		expect(container).toBeEmptyDOMElement();
	});

	it('renders EmptyBody when fragment is empty', () => {
		setupTest(<BodyMessageRenderer fullInvite={{ ...mockInvite, fragment: '' }} />);
		expect(screen.getByText(/message.invite_has_no_message/i)).toBeInTheDocument();
	});

	it('renders HtmlMessageRenderer when htmlDescription is present', () => {
		const htmlContent = '<div>Some <b>HTML</b> content</div>';
		setupTest(
			<BodyMessageRenderer
				fullInvite={{
					...mockInvite,
					fragment: 'some fragment',
					htmlDescription: [{ _content: htmlContent }]
				}}
			/>
		);

		const shadowDomWrapper = screen.getByTestId('shadow-dom-wrapper');
		const { shadowRoot } = shadowDomWrapper;

		const renderedHtml = shadowRoot?.innerHTML.toString();
		expect(renderedHtml).toContain('Some');
		expect(renderedHtml).toContain('HTML');
	});

	it('removes ROOM_DIVIDER content from htmlDescription', () => {
		const htmlContent = `${ROOM_DIVIDER}hidden content${ROOM_DIVIDER}<div>visible content</div>`;
		setupTest(
			<BodyMessageRenderer
				fullInvite={{
					...mockInvite,
					fragment: 'some fragment',
					htmlDescription: [{ _content: htmlContent }]
				}}
			/>
		);
		const shadowDomWrapper = screen.getByTestId('shadow-dom-wrapper');
		const { shadowRoot } = shadowDomWrapper;
		const renderedHtml = shadowRoot?.innerHTML.toString();
		expect(renderedHtml).not.toContain('hidden content');
		expect(renderedHtml).toContain('visible content');
	});

	it('renders TextMessageRenderer when only textDescription is present', () => {
		const textContent = 'This is plain text';
		setupTest(
			<BodyMessageRenderer
				fullInvite={{
					...mockInvite,
					fragment: 'some fragment',
					textDescription: [{ _content: textContent }]
				}}
			/>
		);
		expect(screen.getByText(/This is plain text/)).toBeInTheDocument();
	});

	it('converts line breaks in plain text to <br/>', () => {
		const textContent = 'Line1\nLine2';
		setupTest(
			<BodyMessageRenderer
				fullInvite={{
					...mockInvite,
					fragment: 'some fragment',
					textDescription: [{ _content: textContent }]
				}}
			/>
		);
		expect(screen.getByText(/Line1/)).toBeInTheDocument();
		expect(screen.getByText(/Line2/)).toBeInTheDocument();
	});

	it('removes ROOM_DIVIDER content from textDescription', () => {
		const textContent = `${ROOM_DIVIDER}ROOM_DIVIDERxxshould be removed${ROOM_DIVIDER}Text visible`;
		setupTest(
			<BodyMessageRenderer
				fullInvite={{
					...mockInvite,
					fragment: 'some fragment',
					textDescription: [{ _content: textContent }]
				}}
			/>
		);
		expect(screen.queryByText(/should be removed/)).not.toBeInTheDocument();
		expect(screen.getByText(/Text visible/)).toBeInTheDocument();
	});

	it('renders with provided fontSize', () => {
		const textContent = 'Font size test';
		setupTest(
			<BodyMessageRenderer
				fullInvite={{
					...mockInvite,
					fragment: 'some fragment',
					textDescription: [{ _content: textContent }]
				}}
				fontSize="large"
			/>
		);
		expect(screen.getByText(/Font size test/)).toBeInTheDocument();
	});

	it('renders large htmlDescription', () => {
		function generateFakeDivs(count: number): string {
			let html = '';
			// eslint-disable-next-line no-plusplus
			for (let i = 0; i < count; i++) {
				html += `<div>${faker.lorem.sentences(3)}</div>\n`;
			}
			return html;
		}

		const htmlContent = `<div>a1b1c1</div>${generateFakeDivs(2000)}<div>x1y1z1</div>`;
		setupTest(
			<BodyMessageRenderer
				fullInvite={{
					...mockInvite,
					fragment: 'some fragment',
					htmlDescription: [{ _content: htmlContent }]
				}}
				fontSize="large"
			/>
		);
		const shadowDomWrapper = screen.getByTestId('shadow-dom-wrapper');
		expect(shadowDomWrapper).toBeInTheDocument();
		const { shadowRoot } = shadowDomWrapper;
		const renderedHtml = shadowRoot?.innerHTML.toString();
		expect(renderedHtml).toContain('a1b1c1');
		expect(renderedHtml).toContain('x1y1z1');
	});
});
