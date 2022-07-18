/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { EditorSlice } from '../../types/store/store';

type NewEditor = {
	payload: any;
};

export const newEditorReducer = (state: EditorSlice, { payload }: NewEditor): void => {
	if (payload) {
		state.editors[payload.id] = payload;
		if (payload.panel) {
			state.activeId = payload.id;
		}
		if (payload.searchPanel) {
			state.searchActiveId = payload.id;
		}
	}
};
