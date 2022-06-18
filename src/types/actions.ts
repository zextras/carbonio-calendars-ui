/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Tags } from '@zextras/carbonio-shell-ui';

export type ActionsContext = {
	ridZ?: string | undefined;
	isInstance: boolean;
	haveWriteAccess?: boolean;
	isFromSearch?: boolean;
	createAndApplyTag: (arg: any) => any;
	createModal: any;
	createSnackbar: unknown;
	dispatch: any;
	replaceHistory: (arg: any) => void;
	tags: Tags;
	onClose?: () => void;
};
