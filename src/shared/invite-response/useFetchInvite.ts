/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { getAppointment, getAppointmentIncludeContentFlag } from '../../commons/get-appointment';
import { MailMsg } from '../../types/integrations';
import { Invite } from '../../types/store/invite';

type KnownErrors = 'MISSING_APPOINTMENT_ID';
type UseFetchInviteError = KnownErrors | Exclude<string, KnownErrors> | null;

interface UseFetchInviteResult {
	invite: Invite;
	loading: boolean;
	error: UseFetchInviteError;
}

// GetAppointment returns one <inv> per instance of the appointment (the
// series master plus one per exception). Since the rest of this codebase
// always reads inv[0], picking the wrong entry silently shows the wrong
// occurrence's date/participants/description. Select the entry whose
// exceptId matches the specific occurrence this mail message is about; for
// non-array responses (single occurrence) or mail messages that aren't
// about a specific exception, fall back to the original, unfiltered value.
const selectMatchingInvite = (invites: unknown, mailMsg: MailMsg): unknown => {
	if (!Array.isArray(invites)) {
		return invites;
	}
	const targetExceptDate = mailMsg?.invite?.[0]?.comp?.[0]?.exceptId?.[0]?.d;
	if (!targetExceptDate) {
		return invites;
	}
	const matched = invites.find(
		(candidate) => candidate?.comp?.[0]?.exceptId?.[0]?.d === targetExceptDate
	);
	return matched ? [matched] : invites;
};

export const useFetchInvite = (mailMsg: MailMsg, includeContent = false): UseFetchInviteResult => {
	const { t } = useTranslation();
	const [invite, setInvite] = useState<Invite>(mailMsg.invite || null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<UseFetchInviteError>(null);

	useEffect(() => {
		const fetchInvite: () => Promise<void> = async () => {
			setLoading(true);
			try {
				const appointmentId = invite?.apptId ?? mailMsg?.invite?.[0]?.comp?.[0]?.apptId;
				if (!appointmentId) {
					setError('MISSING_APPOINTMENT_ID');
					return;
				}
				const response = await getAppointment(
					appointmentId,
					getAppointmentIncludeContentFlag(includeContent)
				);
				if ('Fault' in response) {
					setError(t('label.error_try_again', 'Something went wrong, please try again'));
				} else if (response?.appt?.[0]?.inv) {
					setInvite(selectMatchingInvite(response.appt[0].inv, mailMsg) as Invite);
				}
			} catch (err) {
				setError(t('label.error_try_again', 'Something went wrong, please try again'));
			} finally {
				setLoading(false);
			}
		};

		fetchInvite();
	}, [includeContent, invite?.apptId, mailMsg, t]);

	return { invite, loading, error };
};
