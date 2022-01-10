/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Store } from '../../types/store/store';

export function selectEditor(state: Store, id: string): any {
	return state.editor.editors[id];
}
