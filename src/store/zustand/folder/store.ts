/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FolderState } from '@zextras/carbonio-shell-ui';
import { create } from 'zustand';
import { folderWorker } from '../../../worker';

// extra currying as suggested in https://github.com/pmndrs/zustand/blob/main/docs/guides/typescript.md#basic-usage
export const useFolderStore = create<FolderState>()(() => ({
	folders: {},
	roots: {},
	searches: {}
}));

folderWorker.onmessage = ({ data }): void => {
	useFolderStore.setState(data);
};
