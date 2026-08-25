/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useRef } from 'react';

import { getInvite } from 'store/actions/get-invite';
import { useAppDispatch, useAppSelector } from 'store/redux/hooks';
import { selectInstanceInvite } from 'store/selectors/invites';
import { Invite } from 'types/store/invite';

export const useInvite = (inviteId: string | undefined): Invite | undefined => {
	const dispatch = useAppDispatch();
	const invite = useAppSelector(selectInstanceInvite(inviteId));
	// Ids whose fetch failed with a terminal error (e.g. NO_SUCH_ITEM after the
	// parent folder was deleted) - never retried automatically. A successful
	// fetch is NOT recorded here, so a later legitimate cache-clear (e.g. the
	// invite is removed from the store after replying to it, to force a fresh
	// copy) can still trigger a new fetch for the same id.
	const failedIdsRef = useRef<Set<string>>(new Set());
	// Id of the fetch currently in flight, so a re-render before it settles
	// doesn't dispatch a duplicate request for the same id.
	const pendingIdRef = useRef<string | undefined>(undefined);

	useEffect(() => {
		if (
			!invite &&
			inviteId &&
			!failedIdsRef.current.has(inviteId) &&
			pendingIdRef.current !== inviteId
		) {
			pendingIdRef.current = inviteId;
			dispatch(getInvite({ inviteId })).then((res) => {
				pendingIdRef.current = undefined;
				if (res.meta.requestStatus === 'rejected') {
					failedIdsRef.current.add(inviteId);
				}
			});
		}
	}, [dispatch, inviteId, invite]);

	return invite;
};
