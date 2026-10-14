/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TFunction } from 'i18next';

export const SEND_TO_DISTRIBUTION_LIST_DENIED = 'mail.SEND_TO_DISTRIBUTION_LIST_DENIED';

type FaultArgument = { n?: string; _content?: string };

type FaultWithArguments = {
	Detail?: { Error?: { Code?: string; a?: FaultArgument | Array<FaultArgument> } };
};

// The backend reports each address with its display name, e.g. "Devs <devs@test.com>"
const emailOf = (address: string): string => {
	const trimmed = address.trim();
	const start = trimmed.lastIndexOf('<');
	return start !== -1 && trimmed.endsWith('>') ? trimmed.slice(start + 1, -1) : trimmed;
};

/**
 * Returns the distribution lists the sender is not allowed to email, taken from the "invalid"
 * arguments of a mail.SEND_TO_DISTRIBUTION_LIST_DENIED fault, or undefined for any other fault
 */
export const getDeniedDistributionLists = (fault: unknown): Array<string> | undefined => {
	const error = (fault as FaultWithArguments | undefined)?.Detail?.Error;
	if (error?.Code !== SEND_TO_DISTRIBUTION_LIST_DENIED) {
		return undefined;
	}
	const args = Array.isArray(error.a) ? error.a : [error.a];
	return args.flatMap((arg) =>
		arg?.n === 'invalid' && arg._content ? [emailOf(arg._content)] : []
	);
};

/**
 * Returns the snackbar label for a failed send: a specific message when distribution lists were
 * denied, the generic error otherwise
 */
export const getAppointmentSendErrorLabel = (t: TFunction, fault: unknown): string => {
	const deniedLists = getDeniedDistributionLists(fault);
	if (deniedLists?.length === 1) {
		return t('label.error_distribution_list_denied', {
			address: deniedLists[0],
			defaultValue: "You can't invite {{address}}. Remove it and try again."
		});
	}
	if (deniedLists && deniedLists.length > 1) {
		const pluralDefault =
			"You can't invite {{count}} distribution lists. Remove them and try again.";
		return t('label.error_distribution_lists_denied', {
			count: deniedLists.length,
			defaultValue_one: "You can't invite {{count}} distribution list. Remove it and try again.",
			defaultValue_other: pluralDefault,
			// used when i18next cannot resolve plural rules for the locale, e.g. "en_US"
			defaultValue: pluralDefault
		});
	}
	return t('label.error_try_again', 'Something went wrong, please try again');
};
