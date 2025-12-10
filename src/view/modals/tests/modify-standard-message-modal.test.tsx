/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';
import { useTheme } from '@zextras/carbonio-design-system';

import * as shell from '../../../../__mocks__/@zextras/carbonio-shell-ui';
import mockedData from '../../../test/generators';
import { ModifyStandardMessageModal } from '../modify-standard-message-modal';
import { setupTest, setupHook } from '@test-setup';

describe('modify standard message modal', () => {
	describe('modal header', () => {
		it('renders a title', () => {
			setupTest(
				<ModifyStandardMessageModal
					title={'title'}
					onClose={vi.fn()}
					onConfirm={vi.fn()}
					invite={mockedData.getInvite()}
					confirmLabel={'confirmLabel'}
				/>
			);
			expect(screen.getByText('title')).toBeVisible();
		});
		it('renders a close icon', () => {
			setupTest(
				<ModifyStandardMessageModal
					title={'title'}
					onClose={vi.fn()}
					onConfirm={vi.fn()}
					invite={mockedData.getInvite()}
					confirmLabel={'confirmLabel'}
				/>
			);
			expect(screen.getByTestId('icon: CloseOutline')).toBeVisible();
		});
		it('will call onClose when clicking the close icon ', async () => {
			const onClose = vi.fn();
			const { user } = setupTest(
				<ModifyStandardMessageModal
					title={'title'}
					onClose={onClose}
					onConfirm={vi.fn()}
					invite={mockedData.getInvite()}
					confirmLabel={'confirmLabel'}
				/>
			);
			await user.click(screen.getByTestId('icon: CloseOutline'));
			expect(onClose).toHaveBeenCalled();
		});
	});
	describe('modal body', () => {
		describe('has a description text', () => {
			it('renders a text if isEdited is true', () => {
				setupTest(
					<ModifyStandardMessageModal
						title={'title'}
						onClose={vi.fn()}
						onConfirm={vi.fn()}
						invite={mockedData.getInvite()}
						confirmLabel={'confirmLabel'}
						isEdited
					/>
				);
				expect(
					screen.getByText("Do you want to edit the modified appointment's message?")
				).toBeVisible();
			});
			it('renders a different text if isEdited is false', () => {
				setupTest(
					<ModifyStandardMessageModal
						title={'title'}
						onClose={vi.fn()}
						onConfirm={vi.fn()}
						invite={mockedData.getInvite()}
						confirmLabel={'confirmLabel'}
						isEdited={false}
					/>
				);
				expect(
					screen.getByText('Do you want to edit the appointment cancellation message?')
				).toBeVisible();
			});
		});
	});
	describe('modal footer', () => {
		describe('primary action button', () => {
			it('renders the correct label', () => {
				setupTest(
					<ModifyStandardMessageModal
						title={'title'}
						onClose={vi.fn()}
						onConfirm={vi.fn()}
						invite={mockedData.getInvite()}
						confirmLabel={'confirmLabel'}
					/>
				);
				expect(screen.getByRole('button', { name: 'confirmLabel' })).toBeVisible();
			});
			it('is enabled by default', () => {
				setupTest(
					<ModifyStandardMessageModal
						title={'title'}
						onClose={vi.fn()}
						onConfirm={vi.fn()}
						invite={mockedData.getInvite()}
						confirmLabel={'confirmLabel'}
					/>
				);
				expect(screen.getByRole('button', { name: 'confirmLabel' })).toBeEnabled();
			});
			it('has primary background color', () => {
				setupTest(
					<ModifyStandardMessageModal
						title={'title'}
						onClose={vi.fn()}
						onConfirm={vi.fn()}
						invite={mockedData.getInvite()}
						confirmLabel={'confirmLabel'}
					/>
				);
				const { result } = setupHook(useTheme);
				expect(screen.getByRole('button', { name: 'confirmLabel' })).toHaveStyle(
					`background-color: ${result.current.palette.primary.regular}`
				);
			});
			it('has gray6 text color', () => {
				setupTest(
					<ModifyStandardMessageModal
						title={'title'}
						onClose={vi.fn()}
						onConfirm={vi.fn()}
						invite={mockedData.getInvite()}
						confirmLabel={'confirmLabel'}
					/>
				);
				const { result } = setupHook(useTheme);
				expect(screen.getByRole('button', { name: 'confirmLabel' })).toHaveStyle(
					`color: ${result.current.palette.gray6.regular}`
				);
			});
			describe('clicking the button', () => {
				it('will call onConfirm', async () => {
					const onConfirm = vi.fn();
					const { user } = setupTest(
						<ModifyStandardMessageModal
							title={'title'}
							onClose={vi.fn()}
							onConfirm={onConfirm}
							invite={mockedData.getInvite()}
							confirmLabel={'confirmLabel'}
						/>
					);
					await user.click(screen.getByRole('button', { name: 'confirmLabel' }));
					expect(onConfirm).toHaveBeenCalled();
				});
			});
		});
		describe('secondary action button', () => {
			it('renders the correct label', () => {
				setupTest(
					<ModifyStandardMessageModal
						title={'title'}
						onClose={vi.fn()}
						onConfirm={vi.fn()}
						invite={mockedData.getInvite()}
						confirmLabel={'confirmLabel'}
					/>
				);
				expect(screen.getByRole('button', { name: 'Edit Message' })).toBeVisible();
			});
			it('is enabled by default', () => {
				setupTest(
					<ModifyStandardMessageModal
						title={'title'}
						onClose={vi.fn()}
						onConfirm={vi.fn()}
						invite={mockedData.getInvite()}
						confirmLabel={'confirmLabel'}
					/>
				);
				expect(screen.getByRole('button', { name: 'Edit Message' })).toBeEnabled();
			});
			it('has gray6 background color', () => {
				setupTest(
					<ModifyStandardMessageModal
						title={'title'}
						onClose={vi.fn()}
						onConfirm={vi.fn()}
						invite={mockedData.getInvite()}
						confirmLabel={'confirmLabel'}
					/>
				);
				const { result } = setupHook(useTheme);
				expect(screen.getByRole('button', { name: 'Edit Message' })).toHaveStyle(
					`background-color: ${result.current.palette.gray6.regular}`
				);
			});
			it('has primary text color', () => {
				setupTest(
					<ModifyStandardMessageModal
						title={'title'}
						onClose={vi.fn()}
						onConfirm={vi.fn()}
						invite={mockedData.getInvite()}
						confirmLabel={'confirmLabel'}
					/>
				);
				const { result } = setupHook(useTheme);
				expect(screen.getByRole('button', { name: 'Edit Message' })).toHaveStyle(
					`color: ${result.current.palette.primary.regular}`
				);
			});
			describe('clicking on the button', () => {
				it('will call onClose', async () => {
					const onClose = vi.fn();
					const { user } = setupTest(
						<ModifyStandardMessageModal
							title={'title'}
							onClose={onClose}
							onConfirm={vi.fn()}
							invite={mockedData.getInvite()}
							confirmLabel={'confirmLabel'}
						/>
					);
					await user.click(screen.getByRole('button', { name: 'Edit Message' }));
					expect(onClose).toHaveBeenCalled();
				});
				it('will call the integrated function', async () => {
					const integratedFunction = vi.fn();
					shell.useIntegratedFunction.mockReturnValue([integratedFunction, true]);
					const { user } = setupTest(
						<ModifyStandardMessageModal
							title={'title'}
							onClose={vi.fn()}
							onConfirm={vi.fn()}
							invite={mockedData.getInvite()}
							confirmLabel={'confirmLabel'}
						/>
					);
					await user.click(screen.getByRole('button', { name: 'Edit Message' }));
					expect(integratedFunction).toHaveBeenCalled();
				});
				describe('will call the integrated function with prefilled data', () => {
					it('will pass the onConfirm action', async () => {
						const integratedFunction = vi.fn();
						shell.useIntegratedFunction.mockReturnValue([integratedFunction, true]);
						const onConfirm = vi.fn();
						const { user } = setupTest(
							<ModifyStandardMessageModal
								title={'title'}
								onClose={vi.fn()}
								onConfirm={onConfirm}
								invite={mockedData.getInvite()}
								confirmLabel={'confirmLabel'}
							/>
						);
						await user.click(screen.getByRole('button', { name: 'Edit Message' }));
						expect(integratedFunction).toHaveBeenCalledWith(onConfirm, expect.anything());
					});
				});
				it('will call the integrated function with prefilled data when isEdited is false', async () => {
					const integratedFunction = vi.fn();
					shell.useIntegratedFunction.mockReturnValue([integratedFunction, true]);
					const onConfirm = vi.fn();
					const { user } = setupTest(
						<ModifyStandardMessageModal
							title={'title'}
							onClose={vi.fn()}
							onConfirm={onConfirm}
							invite={mockedData.getInvite()}
							confirmLabel={'confirmLabel'}
						/>
					);
					await user.click(screen.getByRole('button', { name: 'Edit Message' }));
					expect(integratedFunction).toHaveBeenCalledWith(expect.anything(), {
						subject: 'Cancelled ',
						text: [
							'The following meeting has been cancelled:',
							'The following meeting has been cancelled:'
						],
						to: []
					});
				});
				it('will call the integrated function with prefilled data when isEdited is true', async () => {
					const integratedFunction = vi.fn();
					shell.useIntegratedFunction.mockReturnValue([integratedFunction, true]);
					const onConfirm = vi.fn();
					const { user } = setupTest(
						<ModifyStandardMessageModal
							title={'title'}
							onClose={vi.fn()}
							onConfirm={onConfirm}
							invite={mockedData.getInvite()}
							confirmLabel={'confirmLabel'}
						/>
					);
					await user.click(screen.getByRole('button', { name: 'Edit Message' }));
					expect(integratedFunction).toHaveBeenCalledWith(expect.anything(), {
						subject: 'Cancelled ',
						text: [
							'The following meeting has been cancelled:',
							'The following meeting has been cancelled:'
						],
						to: []
					});
				});
			});
		});
	});
});
