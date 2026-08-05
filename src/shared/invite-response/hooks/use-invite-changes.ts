/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { find } from 'lodash';

import { CRB_XPROPS } from '../../../constants/xprops';
import type { MailMsg } from '../../../types/integrations';
import type { InviteChanges } from '../../../types/invite-changes';

// Undoes RFC 5545 TEXT-value escaping (\\ \, \; \n) in case the value reaches
// us still iCalendar-escaped instead of the plain JSON string that was
// originally embedded.
const unescapeIcsText = (value: string): string =>
	value.replaceAll(/\\(.)/g, (_match, next: string) => (next === 'n' || next === 'N' ? '\n' : next));

// The calendar server has been observed appending a stray trailing character
// after the JSON object when round-tripping this X-property (e.g. a trailing
// unescaped `"`). Recovers the balanced `{ ... }` substring so a single
// stray trailing character doesn't break JSON.parse.
const extractBalancedJsonObject = (value: string): string | undefined => {
	const start = value.indexOf('{');
	if (start === -1) return undefined;
	let depth = 0;
	let inString = false;
	let escaped = false;
	for (let i = start; i < value.length; i += 1) {
		const char = value[i];
		if (escaped) {
			escaped = false;
		} else if (char === '\\') {
			escaped = true;
		} else if (char === '"') {
			inString = !inString;
		} else if (!inString && char === '{') {
			depth += 1;
		} else if (!inString && char === '}') {
			depth -= 1;
			if (depth === 0) {
				return value.slice(start, i + 1);
			}
		}
	}
	return undefined;
};

const tryParseJson = (value: string): InviteChanges | undefined => {
	try {
		return JSON.parse(value);
	} catch {
		return undefined;
	}
};

const parseInviteChanges = (mailMsg: MailMsg): InviteChanges | undefined => {
	const xprop = mailMsg?.invite?.[0]?.comp?.[0]?.xprop;
	const changesXprop = find(xprop, ['name', CRB_XPROPS.CHANGES]);
	if (!changesXprop?.value) {
		return undefined;
	}
	const raw: string = changesXprop.value;
	const unescaped = unescapeIcsText(raw);
	const candidates = [
		raw,
		unescaped,
		extractBalancedJsonObject(raw),
		extractBalancedJsonObject(unescaped)
	].filter((candidate): candidate is string => !!candidate);
	return candidates.map(tryParseJson).find((parsed): parsed is InviteChanges => !!parsed);
};

export const useInviteChanges = (mailMsg: MailMsg): InviteChanges | undefined =>
	useMemo(() => parseInviteChanges(mailMsg), [mailMsg]);
