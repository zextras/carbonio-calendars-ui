/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Folder, Tags } from '@zextras/carbonio-shell-ui';

export type ActionsContext = {
	ridZ?: string | undefined;
	isInstance?: boolean;
	isSeries?: boolean;
	isException?: boolean;
	haveWriteAccess?: boolean;
	isFromSearch?: boolean;
	createAndApplyTag: (arg: any) => any;
	createModal: any;
	createSnackbar: unknown;
	dispatch: any;
	replaceHistory?: (arg: any) => void;
	tags: Tags;
	onClose?: () => void;
	panel?: boolean;
	searchPanel?: boolean;
	panelView?: PanelView;
	folders: Array<Folder>;
};

export type PanelView = 'app' | 'board' | 'search';
