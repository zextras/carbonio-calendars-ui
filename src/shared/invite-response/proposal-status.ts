/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { find } from 'lodash';

type InviteComponentTime = { d?: string; u?: number; tz?: string };

const isSameTime = (applied?: InviteComponentTime, proposed?: InviteComponentTime): boolean => {
	if (!applied || !proposed) {
		return false;
	}
	if (applied.u !== undefined && proposed.u !== undefined) {
		return applied.u === proposed.u;
	}
	// all day components carry only the date
	return !!applied.d && applied.d === proposed.d && applied.tz === proposed.tz;
};

/**
 * Tells whether the appointment already sits at the time a counter proposal asks for, which
 * means the proposal has been accepted at some point — possibly in an earlier session or from
 * another client.
 *
 * The invite to compare against cannot be taken from index 0: for a recurring appointment that
 * is the series master, while a proposal targets a single instance. The instance is matched by
 * recurrence id, exactly as accepting does. Before acceptance a series instance has no exception
 * of its own, so the lookup falls back to the master and the times will not match.
 */
export const isProposalAlreadyApplied = ({
	fetchedInvites,
	counterInvite
}: {
	// TODO: type this properly once the mail message has a real type
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fetchedInvites: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	counterInvite: any;
}): boolean => {
	// the fetch seeds its state with the counter mail's own invite, whose times are the proposed
	// ones: comparing then would always report a match
	if (!fetchedInvites || fetchedInvites === counterInvite) {
		return false;
	}
	const counterComponent = counterInvite?.[0]?.comp?.[0];
	if (!counterComponent) {
		return false;
	}
	const appliedComponent = (
		find(fetchedInvites, (inv) => inv?.comp?.[0]?.ridZ === counterComponent.ridZ) ??
		fetchedInvites?.[0]
	)?.comp?.[0];

	return (
		isSameTime(appliedComponent?.s?.[0], counterComponent?.s?.[0]) &&
		isSameTime(appliedComponent?.e?.[0], counterComponent?.e?.[0])
	);
};
