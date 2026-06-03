/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';

import { GlobalModalManager, useGlobalModal } from '../global-modal-manager';
import { setupTest } from '@test-setup';

describe('GlobalModalManager', () => {
	it('renders children', () => {
		setupTest(
			<GlobalModalManager>
				<span>child content</span>
			</GlobalModalManager>
		);
		expect(screen.getByText('child content')).toBeInTheDocument();
	});

	it('populates createModal and closeModal after mounting', () => {
		setupTest(
			<GlobalModalManager>
				<span />
			</GlobalModalManager>
		);
		const { createModal, closeModal } = useGlobalModal();
		expect(createModal).toBeInstanceOf(Function);
		expect(closeModal).toBeInstanceOf(Function);
	});

	it('createModal does not throw after mounting', () => {
		setupTest(
			<GlobalModalManager>
				<span />
			</GlobalModalManager>
		);
		const { createModal } = useGlobalModal();
		expect(() =>
			createModal({ id: 'test-modal', children: <span>modal</span> }, true)
		).not.toThrow();
	});

	it('closeModal does not throw after mounting', () => {
		setupTest(
			<GlobalModalManager>
				<span />
			</GlobalModalManager>
		);
		const { closeModal } = useGlobalModal();
		expect(() => closeModal('test-modal')).not.toThrow();
	});
});
