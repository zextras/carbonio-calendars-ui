/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export type ModalFooterProps = {
	mainAlignment?: string;
	crossAlignment?: string;
	padding?: Record<string, string>;
	onConfirm: (a: string) => void | undefined;
	secondaryAction?: () => void;
	label: string;
	secondaryLabel?: string;
	disabled?: boolean;
	secondaryDisabled?: boolean;
	background?: string;
	secondarybackground?: string;
	color?: string;
	secondaryColor?: string;
	size?: string;
	primaryBtnType?: string;
	secondaryBtnType?: string;
};
