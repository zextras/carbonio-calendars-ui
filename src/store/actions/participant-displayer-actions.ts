import { t, getBridgedFunctions } from '@zextras/carbonio-shell-ui';
import { InviteParticipant } from '../../types/store/invite';
import { mailToContact } from '../../shared/invite-response/invite-response';

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

export const sendMsg = (user: InviteParticipant): void => {
	const obj = {
		email: {
			email: {
				mail: user.email
			}
		},
		firstName: user.name ?? user.email,
		middleName: ''
	};
	// disabled because click expect a click event
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	mailToContact(obj)?.click();
};
