/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useAccordionItemOpenStatusStorage } from './use-accordion-item-open-status-storage';
import { useLocalStorage } from '../../__test__/mocks/carbonio-shell-ui/carbonio-shell-ui';
import { setupHook } from '../../__test__/test-setup';

describe('useAccordionItemOpenStatusStorage', () => {
	it('should return an object with the status function to update it', () => {
		useLocalStorage.mockReturnValue([[], jest.fn()]);

		const {
			result: { current: result }
		} = setupHook(useAccordionItemOpenStatusStorage, { initialProps: ['1'] });

		expect(result).toEqual({
			isOpen: false,
			setOpenStatus: expect.any(Function)
		});
	});

	it('should return the open status from localStorage if it contains the given calendar id', () => {
		// Mock the useLocalStorage hook to simulate localStorage containing the id '1'
		useLocalStorage.mockReturnValue([['1'], jest.fn()]);

		const {
			result: { current: result }
		} = setupHook(useAccordionItemOpenStatusStorage, { initialProps: ['1'] });

		expect(result).toEqual({
			isOpen: true,
			setOpenStatus: expect.any(Function)
		});
	});

	it('should update the open status in localStorage when setOpenStatus is called', () => {
		const setLocalStorageMock = jest.fn();
		useLocalStorage.mockReturnValue([['2'], setLocalStorageMock]);

		const {
			result: {
				current: { setOpenStatus }
			}
		} = setupHook(useAccordionItemOpenStatusStorage, { initialProps: ['1'] });

		// Call the setOpenStatus function to update the open status
		setOpenStatus(true);

		// Assert that the localStorage mock was updated with the correct arguments
		expect(setLocalStorageMock).toHaveBeenCalledWith(expect.arrayContaining(['2', '1']));
	});

	it('should remove the id from localStorage when setOpenStatus is called with false', () => {
		const setLocalStorageMock = jest.fn();
		useLocalStorage.mockReturnValue([['1', '2'], setLocalStorageMock]);

		const {
			result: { current: result }
		} = setupHook(useAccordionItemOpenStatusStorage, { initialProps: ['1'] });

		const { setOpenStatus } = result;

		// Call the setOpenStatus function to update the open status to false
		setOpenStatus(false);

		// Assert that the localStorage mock was updated with the correct arguments
		expect(setLocalStorageMock).toHaveBeenCalledWith(['2']);
	});
});
