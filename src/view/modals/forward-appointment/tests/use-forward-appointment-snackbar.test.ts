/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { renderHook, act } from '@testing-library/react';
import { useSnackbar } from '@zextras/carbonio-design-system';
import { Mock } from 'vitest';

import { useForwardAppointmentSnackbar } from 'view/modals/forward-appointment/use-forward-appointment-snackbar';

vi.mock('@zextras/carbonio-design-system', () => ({
	useSnackbar: vi.fn()
}));

vi.mock('@zextras/carbonio-shell-ui', () => ({
	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	t: (_key: string, defaultValue: string) => defaultValue
}));

describe('useForwardAppointmentSnackbar', () => {
	const mockCreateSnackbar = vi.fn();

	beforeEach(() => {
		(useSnackbar as Mock).mockReturnValue(mockCreateSnackbar);
	});

	it('should return showErrorSnackbar and showSuccessSnackbar functions', () => {
		const { result } = renderHook(() => useForwardAppointmentSnackbar());

		expect(result.current).toHaveProperty('showErrorSnackbar');
		expect(result.current).toHaveProperty('showSuccessSnackbar');
		expect(typeof result.current.showErrorSnackbar).toBe('function');
		expect(typeof result.current.showSuccessSnackbar).toBe('function');
	});

	describe('showErrorSnackbar', () => {
		it('should create an error snackbar with correct parameters', () => {
			const { result } = renderHook(() => useForwardAppointmentSnackbar());

			act(() => {
				result.current.showErrorSnackbar();
			});

			expect(mockCreateSnackbar).toHaveBeenCalledWith({
				key: 'forward-appointment-error',
				replace: true,
				severity: 'error',
				label: 'Something went wrong, please try again',
				autoHideTimeout: 3000
			});
		});

		it('should call createSnackbar only once when called', () => {
			const { result } = renderHook(() => useForwardAppointmentSnackbar());

			act(() => {
				result.current.showErrorSnackbar();
			});

			expect(mockCreateSnackbar).toHaveBeenCalledTimes(1);
		});

		it('should be memoized and not recreate on re-render', () => {
			const { result, rerender } = renderHook(() => useForwardAppointmentSnackbar());

			const firstShowError = result.current.showErrorSnackbar;

			rerender();

			const secondShowError = result.current.showErrorSnackbar;

			expect(firstShowError).toBe(secondShowError);
		});
	});

	describe('showSuccessSnackbar', () => {
		it('should create a success snackbar with correct parameters', () => {
			const { result } = renderHook(() => useForwardAppointmentSnackbar());

			act(() => {
				result.current.showSuccessSnackbar();
			});

			expect(mockCreateSnackbar).toHaveBeenCalledWith({
				key: 'forward-appointment-success',
				replace: true,
				severity: 'info',
				hideButton: false,
				label: 'Appointment forwarded',
				autoHideTimeout: 3000
			});
		});

		it('should call createSnackbar only once when called', () => {
			const { result } = renderHook(() => useForwardAppointmentSnackbar());

			act(() => {
				result.current.showSuccessSnackbar();
			});

			expect(mockCreateSnackbar).toHaveBeenCalledTimes(1);
		});

		it('should be memoized and not recreate on re-render', () => {
			const { result, rerender } = renderHook(() => useForwardAppointmentSnackbar());

			const firstShowSuccess = result.current.showSuccessSnackbar;

			rerender();

			const secondShowSuccess = result.current.showSuccessSnackbar;

			expect(firstShowSuccess).toBe(secondShowSuccess);
		});
	});

	it('should handle multiple calls to both snackbar functions', () => {
		const { result } = renderHook(() => useForwardAppointmentSnackbar());

		act(() => {
			result.current.showErrorSnackbar();
			result.current.showSuccessSnackbar();
			result.current.showErrorSnackbar();
		});

		expect(mockCreateSnackbar).toHaveBeenCalledTimes(3);
		expect(mockCreateSnackbar).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({ severity: 'error' })
		);
		expect(mockCreateSnackbar).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({ severity: 'info' })
		);
		expect(mockCreateSnackbar).toHaveBeenNthCalledWith(
			3,
			expect.objectContaining({ severity: 'error' })
		);
	});

	it('should update callbacks when createSnackbar changes', () => {
		const mockCreateSnackbar2 = vi.fn();
		const { result, rerender } = renderHook(() => useForwardAppointmentSnackbar());

		const firstShowError = result.current.showErrorSnackbar;

		(useSnackbar as Mock).mockReturnValue(mockCreateSnackbar2);
		rerender();

		const secondShowError = result.current.showErrorSnackbar;

		expect(firstShowError).not.toBe(secondShowError);

		act(() => {
			result.current.showErrorSnackbar();
		});

		expect(mockCreateSnackbar2).toHaveBeenCalled();
		expect(mockCreateSnackbar).not.toHaveBeenCalled();
	});
});
