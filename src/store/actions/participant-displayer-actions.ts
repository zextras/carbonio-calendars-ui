/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { t, getBridgedFunctions } from '@zextras/carbonio-shell-ui';
import { mailToContact } from '../../shared/invite-response/invite-response';

// todo: this is not using redux! convert to regular async function
export const copyEmailToClipboard = (email: string): void => {
	navigator.clipboard.writeText(email).then(() => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		getBridgedFunctions().createSnackbar({
			key: `clipboard-copy-success`,
			replace: true,
			type: 'success',
			hideButton: true,
			label: t('snackbar.email_copied_to_clipboard', 'Email copied to clipboard.'),
			autoHideTimeout: 3000
		});
	});
};

export const sendMsg = (email: string, name: string): void => {
	const obj = {
		email: {
			email: {
				mail: email
			}
		},
		firstName: name ?? email,
		middleName: ''
	};
	// disabled because click expect a click event
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	mailToContact(obj)?.click();
};
