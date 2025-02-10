/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Invite } from '../types/store/invite';

export const hasDescription = (invite: Invite): boolean =>
	invite?.textDescription?.[0]?._content !== undefined &&
	invite?.textDescription?.[0]?._content?.trim() !== '' &&
	invite?.textDescription?.[0]?._content?.trim() !== '"';
