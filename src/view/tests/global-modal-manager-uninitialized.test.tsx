/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { useGlobalModal } from '../global-modal-manager';

// This file intentionally never renders GlobalModalManager, so globalModalObj
// stays in its initial uninitialized state and the guard throws are exercised.
describe('GlobalModalManager — before initialization', () => {
	it('createModal throws when called before any GlobalModalManager is mounted', () => {
		const { createModal } = useGlobalModal();
		expect(() => createModal({ id: 'x', children: <span /> }, true)).toThrow(
			'global modal manager not initialized'
		);
	});

	it('closeModal throws when called before any GlobalModalManager is mounted', () => {
		const { closeModal } = useGlobalModal();
		expect(() => closeModal('x')).toThrow('global modal manager not initialized');
	});
});
