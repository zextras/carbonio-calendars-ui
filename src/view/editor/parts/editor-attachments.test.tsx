/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act, screen, waitFor } from '@testing-library/react';
import mockedData from '../../../test/generators';
import { setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { generateEditor } from '../../../commons/editor-generator';
import { reducers } from '../../../store/redux';
import { EditorAttachments } from './editor-attachments';

describe('editor attachments', () => {
	test('adding 2 attachments and clicking on delete will remove the attachment', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const event = mockedData.getEvent({
			resource: {
				isException: true
			}
		});
		// const invite = mockedData.getInvite({ event });
		// const context = { folders, dispatch: store.dispatch };
		// const editor = generateEditor({ event, invite, context });

		// await act(async () => {
		// 	await user.click(screen.getByTestId('icon: DeletePermanentlyOutline'));
		// });
	});
});
