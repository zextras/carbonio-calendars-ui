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
	// Track which inviteId has already been attempted so we never retry a
	// failed fetch (e.g. NO_SUCH_ITEM after the parent folder was deleted).
	const attemptedRef = useRef<string | undefined>(undefined);

	useEffect(() => {
		if (!invite && inviteId && attemptedRef.current !== inviteId) {
			attemptedRef.current = inviteId;
			dispatch(getInvite({ inviteId }));
		}
	}, [dispatch, inviteId, invite]);

	return invite;
};
