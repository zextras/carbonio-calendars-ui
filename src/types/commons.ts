/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export type ModalFooterProps = {
	mainAlignment?: string | undefined;
	crossAlignment?: string | undefined;
	padding?: Record<string, string> | undefined;
	onConfirm: (ev: Event) => void;
	secondaryAction?: (ev: Event) => void;
	label: string;
	secondaryLabel?: string | undefined;
	disabled?: boolean | undefined;
	secondaryDisabled?: boolean | undefined;
	background?: string | undefined;
	secondarybackground?: string | undefined;
	color?: string | undefined;
	secondaryColor?: string | undefined;
	size?: string | undefined;
	primaryBtnType?: string | undefined;
	secondaryBtnType?: string | undefined;
	showDivider?: boolean | undefined;
	additionalAction?: (ev: Event) => void;
	additionalBtnType?: string | undefined;
	additionalColor?: string | undefined;
	additionalLabel?: string | undefined;
	primaryTooltip?:
		| {
				label: string;
				placement: string;
				maxWidth: string;
		  }
		| undefined;
};
