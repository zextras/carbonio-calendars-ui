/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useState, useEffect } from 'react';

import { useTranslation } from 'react-i18next';

import { getAppointment, getAppointmentIncludeContentFlag } from '../../commons/get-appointment';
import { MailMsg } from '../../types/integrations';
import { Invite } from '../../types/store/invite';

export const useFetchInvite: (
	mailMsg: MailMsg,
	includeContent?: boolean
) => {
	invite: Invite;
	loading: boolean;
	error: string | null;
} = (mailMsg: MailMsg, includeContent = false) => {
	const { t } = useTranslation();
	const [invite, setInvite] = useState<Invite>(mailMsg.invite || null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchInvite: () => Promise<void> = async () => {
			setLoading(true);
			try {
				const appointmentId = invite.apptId ?? mailMsg?.invite?.[0]?.comp?.[0]?.apptId;
				const response = await getAppointment(
					appointmentId,
					getAppointmentIncludeContentFlag(includeContent)
				);
				if (response?.appt?.[0]?.inv) {
					setInvite(response.appt[0].inv);
				}
			} catch (err) {
				console.log(err);
				setError(t('label.error_try_again', 'Something went wrong, please try again'));
			} finally {
				setLoading(false);
			}
		};

		fetchInvite();
	}, [includeContent, invite.apptId, mailMsg, t]);

	return { invite, loading, error };
};
