/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { createContext, Dispatch, SetStateAction } from 'react';

import { RecurrenceStartValue } from '../types/editor';

export type RecurrenceContextType = {
	newStartValue: any;
	setNewStartValue: Dispatch<SetStateAction<RecurrenceStartValue | undefined>>;
	newEndValue: { count: { num: number } } | { until: { d: string } } | undefined;
	setNewEndValue: React.Dispatch<
		React.SetStateAction<{ count: { num: number } } | { until: { d: string } } | undefined>
	>;
	frequency: string | undefined;
	setFrequency: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export const RecurrenceContext = createContext<RecurrenceContextType | Record<string, never>>({});
