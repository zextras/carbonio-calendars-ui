/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useAccordionItemOpenStatusStorage } from './use-accordion-item-open-status-storage';
import { setupHook } from '../../__test__/test-setup';
import { useLocalStorage } from '@test-mocks/@zextras/carbonio-shell-ui';

describe('useAccordionItemOpenStatusStorage', () => {
	it('should return an object with 2 functions to get and set the open status', () => {
		useLocalStorage.mockReturnValue([[], vi.fn()]);

		const {
			result: { current: result }
		} = setupHook(useAccordionItemOpenStatusStorage);

		expect(result).toEqual({
			isOpen: expect.any(Function),
			setOpenStatus: expect.any(Function)
		});
	});

	it('should return the open status from localStorage if it contains the given calendar id', () => {
		// Mock the useLocalStorage hook to simulate localStorage containing the id '1'
		useLocalStorage.mockReturnValue([['1'], vi.fn()]);

		const {
			result: {
				current: { isOpen }
			}
		} = setupHook(useAccordionItemOpenStatusStorage);

		expect(isOpen('1')).toEqual(true);
	});

	it('should update the open status in localStorage when setOpenStatus is called', () => {
		const setLocalStorageMock = vi.fn();
		useLocalStorage.mockReturnValue([['2'], setLocalStorageMock]);

		const {
			result: {
				current: { setOpenStatus }
			}
		} = setupHook(useAccordionItemOpenStatusStorage);

		// Call the setOpenStatus function to update the open status
		setOpenStatus('1', true);

		// Assert that the localStorage mock was updated with the correct arguments
		expect(setLocalStorageMock).toHaveBeenCalledWith(expect.arrayContaining(['2', '1']));
	});

	it('should remove the id from localStorage when setOpenStatus is called with false', () => {
		const setLocalStorageMock = vi.fn();
		useLocalStorage.mockReturnValue([['1', '2'], setLocalStorageMock]);

		const {
			result: {
				current: { setOpenStatus }
			}
		} = setupHook(useAccordionItemOpenStatusStorage);

		// Call the setOpenStatus function to update the open status to false
		setOpenStatus('1', false);

		// Assert that the localStorage mock was updated with the correct arguments
		expect(setLocalStorageMock).toHaveBeenCalledWith(['2']);
	});
});
