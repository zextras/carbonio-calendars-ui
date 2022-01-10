/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectInstanceInvite } from '../../../store/selectors/invites';
import { getInvite } from '../../../store/actions/get-invite';

export const useInvite = (inviteId, ridZ) => {
	const [loading, setLoading] = useState(false);
	const dispatch = useDispatch();
	const invite = useSelector((state) => selectInstanceInvite(state, inviteId, ridZ));

	useEffect(() => {
		if (!invite && !loading && inviteId && ridZ) {
			setLoading(true);
			dispatch(getInvite({ inviteId, ridZ })).then(() => setLoading(false));
		}
	}, [dispatch, inviteId, ridZ, invite, loading]);

	return invite;
};
