/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useState } from 'react';

import { getInvite } from '../store/actions/get-invite';
import { useAppDispatch, useAppSelector } from '../store/redux/hooks';
import { selectInstanceInvite } from '../store/selectors/invites';
import { Invite } from '../types/store/invite';

export const useInvite = (inviteId: string | undefined): Invite | undefined => {
	const [loading, setLoading] = useState(false);
	const dispatch = useAppDispatch();
	const invite = useAppSelector(selectInstanceInvite(inviteId));

	useEffect(() => {
		if (!invite && !loading && inviteId) {
			setLoading(true);
			dispatch(getInvite({ inviteId })).then(() => {
				setLoading(false);
			});
		}
	}, [dispatch, inviteId, invite, loading]);

	return invite;
};
