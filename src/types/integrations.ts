/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export type InviteResponseArguments = {
	// TODO: this type should be exposed by mail. Wait for a future implementation to be typed properly
	mailMsg: any;
	moveToTrash?: () => void;
};

export type InviteReplyPartArguments = {
	inviteId: string;
	message: InviteResponseArguments['mailMsg'];
};

export type ProposedTimeReplyArguments = {
	id: string;
	moveToTrash?: () => void;
	title: string;
	fragment: string;
	start: number;
	end: number;
	msg: InviteResponseArguments['mailMsg'];
	to: Array<{ address: string; fullName: string; name: string; type: string }>;
};
