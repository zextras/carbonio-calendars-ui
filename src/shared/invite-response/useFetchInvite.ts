/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useState, useEffect } from 'react';

import { getAppointment } from '../../commons/get-appointment';
import { normalizeInvite } from '../../normalizations/normalize-invite';
import { MailMsg } from '../../types/integrations';
import { Invite } from '../../types/store/invite';

export const useFetchInvite: (mailMsg: MailMsg) => {
	invite: Invite;
	loading: boolean;
	error: string | null;
} = (mailMsg: MailMsg) => {
	const [invite, setInvite] = useState<Invite>(mailMsg.invite || null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchInvite: () => Promise<void> = async () => {
			setLoading(true);
			try {
				const appointmentId = mailMsg?.inv?.[0]?.comp?.[0]?.apptId;
				const response = await getAppointment(appointmentId);
				if (response?.appt[0]) {
					setInvite(normalizeInvite(response.appt[0]));
				}
			} catch (err) {
				setError('Failed to fetch invite details');
			} finally {
				setLoading(false);
			}
		};

		fetchInvite();
	}, [mailMsg]);

	return { invite, loading, error };
};
