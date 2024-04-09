/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen, within, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { EditModal } from './edit-modal';
import { useFolderStore } from '../../../carbonio-ui-commons/store/zustand/folder';
import { getSetupServer } from '../../../carbonio-ui-commons/test/jest-setup';
import { generateRoots } from '../../../carbonio-ui-commons/test/mocks/folders/roots-generator';
import { setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import type { FolderView, Grant } from '../../../carbonio-ui-commons/types/folder';
import { FOLDER_OPERATIONS } from '../../../constants/api';
import { TEST_SELECTORS } from '../../../constants/test-utils';
import * as BatchAction from '../../../soap/batch-request';
import * as FolderAction from '../../../soap/folder-action-request';
import * as SendShare from '../../../store/actions/send-share-calendar-notification';
import { reducers } from '../../../store/redux';

const grants: Array<Grant> = [
	{
		zid: '302e2e8b-676d-4c93-aaa4-21e47bd3eeb9',
		gt: 'usr',
		perm: 'r',
		d: 'test1@email.it'
	},
	{
		zid: '0e9d1df6-30df-4e1d-aff6-212908045221',
		gt: 'usr',
		perm: 'r',
		d: 'test2@email.it'
	}
];
const roots = generateRoots();
const systemFolder = {
	absFolderPath: '/Calendar',
	id: '10',
	l: '1',
	name: 'Calendar',
	view: 'appointment' as FolderView,
	n: 1,
	color: 3,
	f: 'b',
	uuid: 'abcd',
	recursive: false,
	deletable: false,
	activesyncdisabled: true,
	isLink: false,
	depth: 1,
	children: [],
	reminder: false,
	broken: false
};
const folder = {
	absFolderPath: '/calendar 1',
	id: '2048',
	l: '1',
	name: 'Calendar 1',
	view: 'appointment' as FolderView,
	n: 12,
	color: 0,
	uuid: 'abcd',
	recursive: false,
	deletable: false,
	activesyncdisabled: true,
	isLink: false,
	depth: 1,
	children: [],
	reminder: false,
	broken: false,
	acl: {
		grant: grants
	}
};
const publicFolder = {
	absFolderPath: '/calendar 2',
	id: '2049',
	l: '1',
	name: 'Calendar 2',
	view: 'appointment' as FolderView,
	n: 0,
	color: 0,
	uuid: 'abce',
	recursive: false,
	deletable: false,
	activesyncdisabled: true,
	isLink: false,
	depth: 1,
	children: [],
	reminder: false,
	broken: false,
	acl: {
		grant: [
			{
				gt: 'pub',
				perm: 'r'
			} as const
		]
	}
};
const newCalendarName = 'New Calendar name';
const setupFoldersStore = (): void => {
	useFolderStore.setState(() => ({
		roots: {
			...roots,
			USER: {
				...roots.USER,
				children: [folder, systemFolder, publicFolder]
			}
		},
		folders: {
			[folder.id]: folder,
			[systemFolder.id]: systemFolder,
			[publicFolder.id]: publicFolder
		}
	}));
};

describe('the edit calendar modal is composed by', () => {
	beforeAll(() => {
		getSetupServer().use(
			http.post('/service/soap/BatchRequest', () => HttpResponse.json({ Body: { Fault: {} } }))
		);
	});

	describe('the modal header. It is composed by', () => {
		test('the title "edit calendar properties" which is the same for every folder', () => {
			setupFoldersStore();
			const closeFn = jest.fn();
			const store = configureStore({ reducer: combineReducers(reducers) });
			setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
				store
			});

			expect(screen.getByText('Edit calendar properties')).toBeVisible();
		});
		test('the close button, on click will call the modal onclose', async () => {
			setupFoldersStore();
			const closeFn = jest.fn();
			const store = configureStore({ reducer: combineReducers(reducers) });
			const { user } = setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
				store
			});

			const closeBtn = within(screen.getByTestId('MainEditModal')).getByTestId('icon: Close');
			await user.click(closeBtn);
			expect(closeFn).toHaveBeenCalledTimes(1);
		});
	});
	describe('the modal body. It is composed by', () => {
		describe('the calendar name input', () => {
			test('has the label "Calendar name"', async () => {
				const closeFn = jest.fn();

				const store = configureStore({ reducer: combineReducers(reducers) });
				setupFoldersStore();

				setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
					store
				});

				const title = screen.getByRole('textbox', {
					name: /calendar name/i
				});
				expect(title).toBeVisible();
			});
			test('it is pre-filled with the calendar name', async () => {
				const closeFn = jest.fn();

				const store = configureStore({ reducer: combineReducers(reducers) });
				setupFoldersStore();

				setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
					store
				});

				const title = screen.getByRole('textbox', {
					name: /calendar name/i
				});
				expect(title).toHaveValue(folder.name);
			});
			test('it is disabled for system folders', async () => {
				const closeFn = jest.fn();

				const store = configureStore({ reducer: combineReducers(reducers) });
				setupFoldersStore();

				setupTest(<EditModal folderId={systemFolder.id} onClose={closeFn} />, {
					store
				});

				const title = screen.getByRole('textbox', {
					name: /calendar name/i
				});

				expect(title).toBeDisabled();
			});
			test('hovering the disabled input will show a tooltip explaining why it is disabled', async () => {
				const closeFn = jest.fn();

				const store = configureStore({ reducer: combineReducers(reducers) });
				setupFoldersStore();

				const { user } = setupTest(<EditModal folderId={systemFolder.id} onClose={closeFn} />, {
					store
				});

				const title = screen.getByRole('textbox', {
					name: /calendar name/i
				});

				user.hover(title);
				const tooltipTextElement = await screen.findByText(
					/you cannot edit the name of a system calendar/i
				);

				expect(tooltipTextElement).toBeVisible();
			});
		});
		test('a row with type of the folder and number of appointments', async () => {
			const closeFn = jest.fn();

			const store = configureStore({ reducer: combineReducers(reducers) });
			setupFoldersStore();

			setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
				store
			});

			expect(screen.getByText('Type')).toBeVisible();
			expect(screen.getByText('Calendar')).toBeVisible();
			expect(screen.getByText('Appointments')).toBeVisible();
			expect(screen.getByText(folder.n)).toBeVisible();
		});
		describe('a color selector', () => {
			test('has the label "Calendar color"', async () => {
				const closeFn = jest.fn();

				const store = configureStore({ reducer: combineReducers(reducers) });
				setupFoldersStore();

				setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
					store
				});

				expect(screen.getByText(/calendar color/i)).toBeVisible();
			});
			test('it is pre-filled with the calendar color', async () => {
				const closeFn = jest.fn();

				const store = configureStore({ reducer: combineReducers(reducers) });
				setupFoldersStore();

				setupTest(<EditModal folderId={systemFolder.id} onClose={closeFn} />, {
					store
				});

				expect(screen.getByText(/green/i)).toBeVisible();
			});
		});
		describe('a section to exclude the calendar from the free busy times, composed by', () => {
			test('a checkbox pre-filled with the free busy value', async () => {
				const closeFn = jest.fn();

				const store = configureStore({ reducer: combineReducers(reducers) });
				setupFoldersStore();

				setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
					store
				});

				expect(screen.getByTestId('icon: Square')).toBeVisible();
			});
			test(' an informative string to explain the checkbox meaning', async () => {
				const closeFn = jest.fn();

				const store = configureStore({ reducer: combineReducers(reducers) });
				setupFoldersStore();

				setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
					store
				});

				expect(
					screen.getByText(/exclude this calendar when reporting the free\/busy times/i)
				).toBeVisible();
			});
		});
		describe('a section to show all the sharing information of this folder', () => {
			test('if the folder is not shared with someone, the shared section is unmounted', async () => {
				const closeFn = jest.fn();
				const store = configureStore({ reducer: combineReducers(reducers) });
				setupFoldersStore();

				setupTest(<EditModal folderId={systemFolder.id} onClose={closeFn} />, {
					store
				});

				const sharingSection = screen.queryByText(`Sharing of this folder`);
				expect(sharingSection).not.toBeInTheDocument();
			});
			test('if the folder is shared with someone, the shared section should be visible', async () => {
				const closeFn = jest.fn();
				const store = configureStore({ reducer: combineReducers(reducers) });
				setupFoldersStore();

				setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
					store
				});

				const sharingSection = screen.getByText(`Sharing of this folder`);
				expect(sharingSection).toBeVisible();
			});
			test('it shows a list of all users this folder has been shared to and their relative roles', async () => {
				const closeFn = jest.fn();
				const store = configureStore({ reducer: combineReducers(reducers) });
				setupFoldersStore();

				setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
					store
				});

				const user1WithRole = screen.getByText(`${grants[0].d} - Viewer`);
				const user2WithRole = screen.getByText(`${grants[1].d} - Viewer`);
				expect(user1WithRole).toBeInTheDocument();
				expect(user2WithRole).toBeInTheDocument();
			});
			describe('if the folder is shared also publicly', () => {
				test('a public user will be in the list', async () => {
					const closeFn = jest.fn();
					const store = configureStore({ reducer: combineReducers(reducers) });
					setupFoldersStore();

					setupTest(<EditModal folderId={publicFolder.id} onClose={closeFn} />, {
						store
					});

					expect(screen.getByTestId('MainEditModal')).toBeInTheDocument();
					expect(screen.getByText(/public - viewer/i)).toBeVisible();
				});
				test('public user has only the revoke action available', async () => {
					const closeFn = jest.fn();
					const store = configureStore({ reducer: combineReducers(reducers) });
					setupFoldersStore();

					setupTest(<EditModal folderId={publicFolder.id} onClose={closeFn} />, {
						store
					});

					expect(screen.queryByRole('button', { name: /resend/i })).not.toBeInTheDocument();
					expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
					expect(screen.getByRole('button', { name: /revoke/i })).toBeInTheDocument();
				});
			});
			describe('normal users have 3 buttons', () => {
				describe('edit', () => {
					test('has the label "edit"', async () => {
						const closeFn = jest.fn();
						const store = configureStore({ reducer: combineReducers(reducers) });
						setupFoldersStore();

						setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
							store
						});

						expect(screen.getAllByRole('button', { name: /edit/i })[0]).toBeVisible();
					});
					test('on click it will open the edit permission modal', async () => {
						const closeFn = jest.fn();
						const store = configureStore({ reducer: combineReducers(reducers) });
						setupFoldersStore();

						const { user } = setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
							store
						});

						await user.click(screen.getAllByRole('button', { name: /edit/i })[0]);
						expect(screen.getByTestId('EditPermissionModal')).toBeInTheDocument();
					});
				});
				describe('revoke', () => {
					test('has the label "revoke"', async () => {
						const closeFn = jest.fn();
						const store = configureStore({ reducer: combineReducers(reducers) });
						setupFoldersStore();

						setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
							store
						});

						expect(screen.getAllByRole('button', { name: /revoke/i })[0]).toBeVisible();
					});
					test('on click a request to the server will be sent containing only the related user', async () => {
						const spy = jest.spyOn(FolderAction, 'folderActionRequest');
						const closeFn = jest.fn();
						const store = configureStore({ reducer: combineReducers(reducers) });
						setupFoldersStore();

						const { user } = setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
							store
						});

						await user.click(screen.getAllByRole('button', { name: /revoke/i })[0]);
						expect(screen.getByTestId('RevokeModal')).toBeInTheDocument();
						await act(async () => {
							await user.click(within(screen.getByTestId('RevokeModal')).getByText('Revoke'));
						});
						expect(screen.getByTestId('MainEditModal')).toBeInTheDocument();
						expect(spy).toHaveBeenCalledTimes(1);
						expect(spy).toHaveBeenCalledWith({
							id: folder.id,
							op: FOLDER_OPERATIONS.REVOKE_GRANT,
							zid: grants[0].zid
						});
					});
				});
				describe('resend', () => {
					test('has the label "resend"', async () => {
						const closeFn = jest.fn();
						const store = configureStore({ reducer: combineReducers(reducers) });
						setupFoldersStore();

						setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
							store
						});

						expect(screen.getAllByRole('button', { name: /resend/i })[0]).toBeVisible();
					});
					test('on click a request to the server will be sent containing only the related user invitation', async () => {
						const closeFn = jest.fn();
						const sendAgainSpy = jest.spyOn(SendShare, 'sendShareCalendarNotification');
						const store = configureStore({ reducer: combineReducers(reducers) });
						setupFoldersStore();

						const { user } = setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
							store
						});

						await act(async () => {
							await user.click(screen.getAllByRole('button', { name: /resend/i })[0]);
						});
						expect(sendAgainSpy).toHaveBeenCalledTimes(1);
						expect(sendAgainSpy).toHaveBeenCalledWith(
							expect.objectContaining({ contacts: [{ email: grants[0].d }] })
						);
					});
				});
			});
		});
	});
	describe('the modal footer with two buttons', () => {
		describe('add share button', () => {
			// more info about it in the related test suite
			test('on click it will open the share modal', async () => {
				const closeFn = jest.fn();

				setupFoldersStore();
				const store = configureStore({ reducer: combineReducers(reducers) });

				const { user } = setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
					store
				});

				const addShareBtn = screen.getByRole('button', {
					name: /add share/i
				});
				await user.click(addShareBtn);
				expect(screen.getByTestId('ShareCalendarModal')).toBeInTheDocument();
			});
			// unmounting the component will discard all the unsaved changes done by the user
			test('on click it will unmount the edit modal', async () => {
				const closeFn = jest.fn();
				setupFoldersStore();
				const store = configureStore({ reducer: combineReducers(reducers) });

				const { user } = setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
					store
				});

				const addShareBtn = screen.getByRole('button', {
					name: /add share/i
				});
				await user.click(addShareBtn);
				expect(screen.queryByTestId('MainEditModal')).not.toBeInTheDocument();
			});
		});
		describe('ok button', () => {
			describe('it will save any changes done to the modal body except for the "sharing of this folder" section', () => {
				describe('if the user interact with the name', () => {
					test('if the user change title it will trigger a rename operation', async () => {
						const spy = jest.spyOn(FolderAction, 'folderActionRequest');

						const closeFn = jest.fn();

						const store = configureStore({ reducer: combineReducers(reducers) });
						setupFoldersStore();

						const { user } = setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
							store
						});

						const title = screen.getByRole('textbox', {
							name: /calendar name/i
						});

						await user.clear(title);
						await user.type(title, newCalendarName);
						await act(async () => {
							await user.click(screen.getByText('OK'));
						});

						expect(spy).toHaveBeenCalledTimes(1);
						expect(spy).toHaveBeenCalledWith({
							name: newCalendarName,
							id: folder.id,
							op: FOLDER_OPERATIONS.RENAME
						});
					});
					test('if the user rewrite the same title it will not trigger any operation', async () => {
						const spy = jest.spyOn(FolderAction, 'folderActionRequest');

						const closeFn = jest.fn();

						const store = configureStore({ reducer: combineReducers(reducers) });
						setupFoldersStore();

						const { user } = setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
							store
						});

						const title = screen.getByRole('textbox', {
							name: /calendar name/i
						});

						await user.clear(title);
						await user.type(title, folder.name);
						await user.click(screen.getByText('OK'));

						expect(spy).not.toHaveBeenCalled();
					});
				});
				describe('if the user interact with the color select', () => {
					test('if the user change color it will trigger a color operation', async () => {
						const spy = jest.spyOn(FolderAction, 'folderActionRequest');

						const closeFn = jest.fn();

						const store = configureStore({ reducer: combineReducers(reducers) });
						setupFoldersStore();

						const { user } = setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
							store
						});
						await user.click(screen.getByText(/black/i));
						await user.click(screen.getByText(/red/i));
						await act(async () => {
							await user.click(screen.getByText('OK'));
						});

						expect(spy).toHaveBeenCalledTimes(1);
						expect(spy).toHaveBeenCalledWith({
							color: '5',
							id: folder.id,
							op: FOLDER_OPERATIONS.COLOR
						});
					});
					test('if the user select the same color it will not trigger any operation', async () => {
						const spy = jest.spyOn(FolderAction, 'folderActionRequest');
						const closeFn = jest.fn();

						const store = configureStore({ reducer: combineReducers(reducers) });
						setupFoldersStore();

						const { user } = setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
							store
						});

						await user.click(screen.getByText(/black/i));
						await user.click(
							within(screen.getByTestId(TEST_SELECTORS.DROPDOWN)).getByText(/black/i)
						);
						await user.click(screen.getByText('OK'));

						expect(spy).not.toHaveBeenCalled();
					});
				});
				describe('if the user interact with the free busy checkbox', () => {
					test('if the user change the free busy status it will trigger a fb operation', async () => {
						const spy = jest.spyOn(FolderAction, 'folderActionRequest');

						const closeFn = jest.fn();

						const store = configureStore({ reducer: combineReducers(reducers) });
						setupFoldersStore();

						const { user } = setupTest(<EditModal folderId={systemFolder.id} onClose={closeFn} />, {
							store
						});

						await act(async () => {
							await user.click(screen.getByTestId('icon: CheckmarkSquare'));
						});
						await act(async () => {
							await user.click(screen.getByText('OK'));
						});

						expect(spy).toHaveBeenCalledTimes(1);
						expect(spy).toHaveBeenCalledWith({
							excludeFreeBusy: false,
							id: systemFolder.id,
							op: FOLDER_OPERATIONS.FREE_BUSY
						});
					});
					test('if the user reselect the same free busy status it will not trigger any operation', async () => {
						const spy = jest.spyOn(FolderAction, 'folderActionRequest');

						const closeFn = jest.fn();

						const store = configureStore({ reducer: combineReducers(reducers) });
						setupFoldersStore();

						const { user } = setupTest(<EditModal folderId={systemFolder.id} onClose={closeFn} />, {
							store
						});

						await act(async () => {
							await user.click(screen.getByTestId('icon: CheckmarkSquare'));
						});
						await act(async () => {
							await user.click(screen.getByTestId('icon: Square'));
						});
						await user.click(screen.getByText('OK'));

						expect(spy).not.toHaveBeenCalled();
					});
				});
				test('if the user changes all of the above it will trigger all the operations in a batch', async () => {
					const spy = jest.spyOn(BatchAction, 'batchRequest');

					const closeFn = jest.fn();

					const store = configureStore({ reducer: combineReducers(reducers) });
					setupFoldersStore();

					const { user } = setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
						store
					});

					const title = screen.getByRole('textbox', {
						name: /calendar name/i
					});

					await user.clear(title);
					await user.type(title, newCalendarName);

					await user.click(screen.getByText(/black/i));
					await user.click(screen.getByText(/red/i));

					await act(async () => {
						await user.click(screen.getByTestId('icon: Square'));
					});
					await act(async () => {
						await user.click(screen.getByText('OK'));
					});

					expect(spy).toHaveBeenCalledTimes(1);
					expect(spy).toHaveBeenCalledWith(
						expect.objectContaining({
							FolderActionRequest: [
								expect.objectContaining({
									action: expect.objectContaining({ op: FOLDER_OPERATIONS.RENAME })
								}),
								expect.objectContaining({
									action: expect.objectContaining({ op: FOLDER_OPERATIONS.COLOR })
								}),
								expect.objectContaining({
									action: expect.objectContaining({ op: FOLDER_OPERATIONS.FREE_BUSY })
								})
							]
						})
					);
				});
			});
		});
	});
});
