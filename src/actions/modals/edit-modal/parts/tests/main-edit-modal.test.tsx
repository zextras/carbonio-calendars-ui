/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import * as shell from '@zextras/carbonio-shell-ui';
import { FOLDER_VIEW, Grant, useFolderStore } from '@zextras/carbonio-ui-commons';

import { generateFolder } from '../../../../../__test__/mocks/folders/folders-generator';
import defaultSettings from '../../../../../__test__/mocks/settings/default-settings';
import { setupTest, screen, within } from '../../../../../__test__/test-setup';
import { EditModalContext, EditModalContextType } from '../../../../../commons/edit-modal-context';
import { PUBLIC_SHARE_ZID, SHARE_USER_TYPE } from '../../../../../constants';
import { FOLDER_OPERATIONS } from '../../../../../constants/api';
import * as FolderAction from '../../../../../soap/folder-action-request';
import { reducers } from '../../../../../store/redux';
import { MainEditModal, MainEditModalProps } from '../main-edit-modal';

const MainEditModalTestWrapper = (props: MainEditModalProps): React.JSX.Element => {
	const context = {
		setModal: vi.fn(),
		onClose: vi.fn(),
		roleOptions: [],
		setActiveGrant: vi.fn()
	} satisfies EditModalContextType;

	return (
		<EditModalContext.Provider value={context}>
			<MainEditModal
				folder={props.folder}
				totalAppointments={props.totalAppointments}
				grant={props.grant}
			/>
		</EditModalContext.Provider>
	);
};

describe('MainEditModal', () => {
	beforeEach(() => {
		vi.spyOn(shell, 'useUserSettings').mockReturnValue(defaultSettings);
	});

	const store = configureStore({ reducer: combineReducers(reducers) });

	it('should render the title', () => {
		const folder = generateFolder({ view: FOLDER_VIEW.appointment });
		const totalAppointments = faker.number.int({ min: 1, max: 100 });
		const grant: Array<Grant> = [];

		setupTest(
			<MainEditModalTestWrapper
				folder={folder}
				totalAppointments={totalAppointments}
				grant={grant}
			/>,
			{ store }
		);
		expect(screen.getByText('Edit and share calendar')).toBeVisible();
	});

	it('should not render the URL buttons if there is no public access', () => {
		const folder = generateFolder({ view: FOLDER_VIEW.appointment });
		const totalAppointments = faker.number.int({ min: 1, max: 100 });
		const grant: Array<Grant> = [];

		setupTest(
			<MainEditModalTestWrapper
				folder={folder}
				totalAppointments={totalAppointments}
				grant={grant}
			/>,
			{ store }
		);

		expect(screen.queryByRole('button', { name: /ICS URL/i })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /WebCAL URL/i })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /CalDAV URL/i })).not.toBeInTheDocument();
	});

	it('should render all three URL buttons and the note text when there is a public access', () => {
		const folder = generateFolder({ view: FOLDER_VIEW.appointment });
		const totalAppointments = faker.number.int({ min: 1, max: 100 });
		const grant: Array<Grant> = [{ gt: SHARE_USER_TYPE.PUBLIC, perm: 'r' }];

		setupTest(
			<MainEditModalTestWrapper
				folder={folder}
				totalAppointments={totalAppointments}
				grant={grant}
			/>,
			{ store }
		);

		expect(screen.getByRole('button', { name: /ICS URL/i })).toBeVisible();
		expect(screen.getByRole('button', { name: /WebCAL URL/i })).toBeVisible();
		expect(screen.getByRole('button', { name: /CalDAV URL/i })).toBeVisible();
		expect(screen.getByText('Anyone with these links can view your calendar.')).toBeVisible();
	});

	it('should not render the old "Public share URLS" heading within the public sharing section', () => {
		const folder = generateFolder({ view: FOLDER_VIEW.appointment });
		const grant: Array<Grant> = [{ gt: SHARE_USER_TYPE.PUBLIC, perm: 'r' }];

		setupTest(<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={grant} />, {
			store
		});

		expect(screen.queryByText('Public share URLS')).not.toBeInTheDocument();
	});

	it('should disable the name input for caldav child with read-only permissions', () => {
		const parentFolderId = faker.string.uuid();
		const caldavParentFolder = {
			...generateFolder({
				view: FOLDER_VIEW.appointment,
				id: parentFolderId
			}),
			dsId: parentFolderId,
			dsType: 'caldav' as const
		};
		const caldavChildFolder = generateFolder({
			view: FOLDER_VIEW.appointment,
			parent: parentFolderId,
			l: parentFolderId,
			perm: 'r' // read-only
		});

		// Setup the folder store with both parent and child
		useFolderStore.setState(() => ({
			roots: {},
			folders: {
				[parentFolderId]: caldavParentFolder,
				[caldavChildFolder.id]: caldavChildFolder
			}
		}));

		const totalAppointments = faker.number.int({ min: 1, max: 100 });
		const grant: Array<Grant> = [];

		setupTest(
			<MainEditModalTestWrapper
				folder={caldavChildFolder}
				totalAppointments={totalAppointments}
				grant={grant}
			/>,
			{ store }
		);

		// Check that the name input is disabled
		const nameInput = screen.getByDisplayValue(caldavChildFolder.name);
		expect(nameInput).toBeDisabled();
	});

	describe('Internal sharing section', () => {
		it('should render the "Internal sharing" header for non-linked folders', () => {
			const folder = generateFolder({ view: FOLDER_VIEW.appointment });
			const grant: Array<Grant> = [];

			setupTest(<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={grant} />, {
				store
			});

			expect(screen.getByText('Internal sharing')).toBeVisible();
		});

		it('should not render the "Internal sharing" section for linked folders', () => {
			const folder = {
				...generateFolder({ view: FOLDER_VIEW.appointment }),
				isLink: true as const,
				owner: 'someone@example.com',
				reminder: false,
				broken: false
			};
			const grant: Array<Grant> = [];

			setupTest(<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={grant} />, {
				store
			});

			expect(screen.queryByText('Internal sharing')).not.toBeInTheDocument();
		});

		it('should render the "Add share" button next to the "Internal sharing" header', () => {
			const folder = generateFolder({ view: FOLDER_VIEW.appointment });
			const grant: Array<Grant> = [];

			setupTest(<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={grant} />, {
				store
			});

			expect(screen.getByRole('button', { name: 'Add share' })).toBeVisible();
		});

		it('should call setModal("share") when the "Add share" button is clicked', async () => {
			const setModal = vi.fn();
			const folder = generateFolder({ view: FOLDER_VIEW.appointment });
			const grant: Array<Grant> = [];

			const context = {
				setModal,
				onClose: vi.fn(),
				roleOptions: [],
				setActiveGrant: vi.fn()
			} satisfies EditModalContextType;

			const { user } = setupTest(
				<EditModalContext.Provider value={context}>
					<MainEditModal folder={folder} totalAppointments={0} grant={grant} />
				</EditModalContext.Provider>,
				{ store }
			);

			await user.click(screen.getByRole('button', { name: 'Add share' }));

			expect(setModal).toHaveBeenCalledWith('share');
		});

		it('should render internal grants in the "Internal sharing" list', () => {
			const folder = generateFolder({ view: FOLDER_VIEW.appointment });
			const grant: Array<Grant> = [{ gt: SHARE_USER_TYPE.USER, perm: 'r', d: 'user@example.com' }];

			setupTest(<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={grant} />, {
				store
			});

			expect(screen.getByText(/user@example\.com/)).toBeVisible();
		});

		it('should not render a public grant chip in the "Internal sharing" list', () => {
			const folder = generateFolder({ view: FOLDER_VIEW.appointment });
			const grant: Array<Grant> = [{ gt: SHARE_USER_TYPE.PUBLIC, perm: 'r' }];

			setupTest(<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={grant} />, {
				store
			});

			// The internal grants list should have no rows (public grant is filtered out)
			expect(screen.queryByRole('button', { name: /resend/i })).not.toBeInTheDocument();
		});

		it('should render the "Add share" button inside the internal sharing header', () => {
			const folder = generateFolder({ view: FOLDER_VIEW.appointment });
			const grant: Array<Grant> = [];

			setupTest(<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={grant} />, {
				store
			});

			expect(
				within(screen.getByTestId('internalSharingHeader')).getByRole('button', {
					name: 'Add share'
				})
			).toBeVisible();
		});
	});

	describe('Public sharing section', () => {
		it('should render when zimbraPublicSharingEnabled is TRUE', () => {
			const folder = generateFolder({ view: FOLDER_VIEW.appointment });
			const grant: Array<Grant> = [];

			setupTest(<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={grant} />, {
				store
			});

			expect(screen.getByText('Public sharing')).toBeVisible();
		});

		it('should not render when zimbraPublicSharingEnabled is FALSE', () => {
			vi.spyOn(shell, 'useUserSettings').mockReturnValue({
				...defaultSettings,
				attrs: { ...defaultSettings.attrs, zimbraPublicSharingEnabled: 'FALSE' }
			});

			const folder = generateFolder({ view: FOLDER_VIEW.appointment });
			const grant: Array<Grant> = [];

			setupTest(<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={grant} />, {
				store
			});

			expect(screen.queryByText('Public sharing')).not.toBeInTheDocument();
		});

		it('should not render for linked folders', () => {
			const folder = {
				...generateFolder({ view: FOLDER_VIEW.appointment }),
				isLink: true as const,
				owner: 'someone@example.com',
				reminder: false,
				broken: false
			};
			const grant: Array<Grant> = [];

			setupTest(<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={grant} />, {
				store
			});

			expect(screen.queryByText('Public sharing')).not.toBeInTheDocument();
		});

		describe('Public sharing checkbox', () => {
			it('should be checked when calendar is already publicly shared', () => {
				const folder = generateFolder({ view: FOLDER_VIEW.appointment });
				const grant: Array<Grant> = [{ gt: SHARE_USER_TYPE.PUBLIC, perm: 'r' }];

				setupTest(
					<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={grant} />,
					{ store }
				);

				expect(screen.getByTestId('icon: CheckmarkSquare')).toBeVisible();
			});

			it('should be unchecked when calendar is not publicly shared', () => {
				const folder = generateFolder({ view: FOLDER_VIEW.appointment });
				const grant: Array<Grant> = [];

				setupTest(
					<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={grant} />,
					{ store }
				);

				const checkboxes = screen.getAllByTestId('icon: Square');
				expect(checkboxes.length).toBeGreaterThan(0);
			});

			it('should toggle to checked on click', async () => {
				const folder = generateFolder({ view: FOLDER_VIEW.appointment });
				const grant: Array<Grant> = [];

				const { user } = setupTest(
					<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={grant} />,
					{ store }
				);

				const publicCheckboxLabel = screen.getByText(/share with public/i);
				await user.click(publicCheckboxLabel);

				expect(screen.getByTestId('icon: CheckmarkSquare')).toBeVisible();
			});

			it('should be hidden when zimbraPublicSharingEnabled is FALSE', () => {
				vi.spyOn(shell, 'useUserSettings').mockReturnValue({
					...defaultSettings,
					attrs: { ...defaultSettings.attrs, zimbraPublicSharingEnabled: 'FALSE' }
				});

				const folder = generateFolder({ view: FOLDER_VIEW.appointment });
				const grant: Array<Grant> = [];

				setupTest(
					<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={grant} />,
					{ store }
				);

				expect(screen.queryByText(/share with public/i)).not.toBeInTheDocument();
			});
		});

		describe('Public share URLs', () => {
			it('should show all URL buttons and note text immediately when checkbox is checked, before saving', async () => {
				const folder = generateFolder({ view: FOLDER_VIEW.appointment });
				const grant: Array<Grant> = [];

				const { user } = setupTest(
					<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={grant} />,
					{ store }
				);

				expect(screen.queryByRole('button', { name: /ICS URL/i })).not.toBeInTheDocument();

				await user.click(screen.getByText(/share with public/i));

				expect(screen.getByRole('button', { name: /ICS URL/i })).toBeVisible();
				expect(screen.getByRole('button', { name: /WebCAL URL/i })).toBeVisible();
				expect(screen.getByRole('button', { name: /CalDAV URL/i })).toBeVisible();
				expect(screen.getByText('Anyone with these links can view your calendar.')).toBeVisible();
			});

			it('should hide all URL buttons when checkbox is unchecked', async () => {
				const folder = generateFolder({ view: FOLDER_VIEW.appointment });
				const grant: Array<Grant> = [{ gt: SHARE_USER_TYPE.PUBLIC, perm: 'r' }];

				const { user } = setupTest(
					<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={grant} />,
					{ store }
				);

				expect(screen.getByRole('button', { name: /ICS URL/i })).toBeVisible();

				await user.click(screen.getByText(/share with public/i));

				expect(screen.queryByRole('button', { name: /ICS URL/i })).not.toBeInTheDocument();
				expect(screen.queryByRole('button', { name: /WebCAL URL/i })).not.toBeInTheDocument();
				expect(screen.queryByRole('button', { name: /CalDAV URL/i })).not.toBeInTheDocument();
			});
		});

		describe('State resync when grant prop changes', () => {
			it('should sync checkbox to checked when grant prop adds a public grant and user has not interacted', () => {
				const folder = generateFolder({ view: FOLDER_VIEW.appointment });

				const { rerender } = setupTest(
					<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={[]} />,
					{ store }
				);

				expect(screen.getAllByTestId('icon: Square').length).toBeGreaterThan(0);

				rerender(
					<MainEditModalTestWrapper
						folder={folder}
						totalAppointments={0}
						grant={[{ gt: SHARE_USER_TYPE.PUBLIC, perm: 'r' }]}
					/>
				);

				expect(screen.getByTestId('icon: CheckmarkSquare')).toBeVisible();
			});

			it('should sync checkbox to unchecked when grant prop removes the public grant and user has not interacted', () => {
				const folder = generateFolder({ view: FOLDER_VIEW.appointment });
				const publicGrant: Array<Grant> = [{ gt: SHARE_USER_TYPE.PUBLIC, perm: 'r' }];

				const { rerender } = setupTest(
					<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={publicGrant} />,
					{ store }
				);

				expect(screen.getByTestId('icon: CheckmarkSquare')).toBeVisible();

				rerender(<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={[]} />);

				expect(screen.getAllByTestId('icon: Square').length).toBeGreaterThan(0);
			});

			it('should not sync when user has already interacted with the checkbox', async () => {
				const folder = generateFolder({ view: FOLDER_VIEW.appointment });

				const { user, rerender } = setupTest(
					<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={[]} />,
					{ store }
				);

				await user.click(screen.getByText(/share with public/i));
				expect(screen.getByTestId('icon: CheckmarkSquare')).toBeVisible();

				rerender(<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={[]} />);

				expect(screen.getByTestId('icon: CheckmarkSquare')).toBeVisible();
			});
		});

		describe('on OK click', () => {
			it('should send a GRANT action when checkbox is toggled on for a not-yet-shared calendar', async () => {
				const spy = vi.spyOn(FolderAction, 'folderActionRequest').mockResolvedValue({});
				const folder = generateFolder({ view: FOLDER_VIEW.appointment });
				const grant: Array<Grant> = [];

				const { user } = setupTest(
					<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={grant} />,
					{ store }
				);

				await user.click(screen.getByText(/share with public/i));
				await user.click(screen.getByText('OK'));

				expect(spy).toHaveBeenCalledWith(
					expect.objectContaining({
						op: FOLDER_OPERATIONS.GRANT,
						id: folder.id,
						grant: [{ gt: SHARE_USER_TYPE.PUBLIC, perm: 'r', pw: '' }]
					})
				);
			});

			it('should send a REVOKE_GRANT action when checkbox is toggled off for an already-shared calendar', async () => {
				const spy = vi.spyOn(FolderAction, 'folderActionRequest').mockResolvedValue({});
				const folder = generateFolder({ view: FOLDER_VIEW.appointment });
				const grant: Array<Grant> = [{ gt: SHARE_USER_TYPE.PUBLIC, perm: 'r' }];

				const { user } = setupTest(
					<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={grant} />,
					{ store }
				);

				await user.click(screen.getByText(/share with public/i));
				await user.click(screen.getByText('OK'));

				expect(spy).toHaveBeenCalledWith(
					expect.objectContaining({
						op: FOLDER_OPERATIONS.REVOKE_GRANT,
						id: folder.id,
						zid: PUBLIC_SHARE_ZID
					})
				);
			});

			it('should not send any public sharing action when checkbox state is unchanged', async () => {
				const spy = vi.spyOn(FolderAction, 'folderActionRequest').mockResolvedValue({});
				const folder = generateFolder({ view: FOLDER_VIEW.appointment });
				const grant: Array<Grant> = [];

				const { user } = setupTest(
					<MainEditModalTestWrapper folder={folder} totalAppointments={0} grant={grant} />,
					{ store }
				);

				await user.click(screen.getByText('OK'));

				expect(spy).not.toHaveBeenCalled();
			});
		});
	});
});
