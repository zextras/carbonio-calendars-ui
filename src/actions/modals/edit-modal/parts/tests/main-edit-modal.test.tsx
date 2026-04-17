/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { FOLDER_VIEW, Grant, useFolderStore } from '@zextras/carbonio-ui-commons';

import { generateFolder } from '../../../../../__test__/mocks/folders/folders-generator';
import { setupTest, screen } from '../../../../../__test__/test-setup';
import { EditModalContext, EditModalContextType } from '../../../../../commons/edit-modal-context';
import { SHARE_USER_TYPE } from '../../../../../constants';
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
	it('should render the title', () => {
		const store = configureStore({
			reducer: combineReducers(reducers)
		});
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

	it('should not render the public share urls buttons if there is no public access', () => {
		const store = configureStore({
			reducer: combineReducers(reducers)
		});
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

		expect(screen.queryByText('Public share URLS')).not.toBeInTheDocument();
	});

	it('should render the public share urls buttons if there is a public access', () => {
		const store = configureStore({
			reducer: combineReducers(reducers)
		});
		const folder = generateFolder({ view: FOLDER_VIEW.appointment });
		const totalAppointments = faker.number.int({ min: 1, max: 100 });
		const grant: Array<Grant> = [
			{
				gt: SHARE_USER_TYPE.PUBLIC,
				perm: 'r'
			}
		];

		setupTest(
			<MainEditModalTestWrapper
				folder={folder}
				totalAppointments={totalAppointments}
				grant={grant}
			/>,
			{ store }
		);

		expect(screen.getByText('Public share URLS')).toBeVisible();
	});

	it('should disable the name input for caldav child with read-only permissions', () => {
		const store = configureStore({
			reducer: combineReducers(reducers)
		});
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
});
