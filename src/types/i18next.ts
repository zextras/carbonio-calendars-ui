/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { i18n, WithT, TFunction } from 'i18next';

export type Namespace = string | string[];

export interface TransProps<E extends Element = HTMLDivElement>
	extends React.HTMLProps<E>,
		Partial<WithT> {
	children?: React.ReactNode;
	components?: readonly React.ReactNode[] | { [tagName: string]: React.ReactNode };
	count?: number;
	defaults?: string;
	i18n?: i18n;
	i18nKey?: string;
	ns?: Namespace;
	parent?: string | React.ComponentType<any> | null; // used in React.createElement if not null
	tOptions?: Record<string, unknown>;
	values?: Record<string, unknown>;
	t?: TFunction;
}
