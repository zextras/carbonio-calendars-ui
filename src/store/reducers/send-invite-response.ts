/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const sendInviteResponsePending = (state: any, { inviteId, meta }: any): void => {
	if (meta.arg.fromMail) {
		// in case if invite respnse is sent from mail
	} else {
		state.status = 'pending';
	}
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const sendInviteResponseFulfilled = (state: any, { meta }: any): void => {
	if (meta.arg.fromMail) {
		// in case if invite respnse is sent from mail
	} else {
		// eslint-disable-next-line no-param-reassign
		state.status = 'fulfilled';
	}
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const sendInviteResponseRejected = (state: any, action: any): void => {
	// TODO: better handling setting error only in that message
	state.status = 'error';
	throw new Error(action);
};
