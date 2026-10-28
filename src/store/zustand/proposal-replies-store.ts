/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { create } from 'zustand';

export const PROPOSAL_REPLY = {
	ACCEPTED: 'accepted',
	DECLINED: 'declined'
} as const;

export type ProposalReply = (typeof PROPOSAL_REPLY)[keyof typeof PROPOSAL_REPLY];

export type ProposalRepliesAppState = {
	proposalReplies: Record<string, ProposalReply>;
};

/**
 * Counter proposals replied to during this session.
 *
 * The mails module re-creates the invite panel once the counter mail is moved to trash, which
 * wipes any component state. Without this store the buttons would come back enabled and a second
 * click would send the attendee a duplicate notification.
 */
export const useProposalRepliesStore = create<ProposalRepliesAppState>(() => ({
	proposalReplies: {}
}));

/**
 * Build the identifier of a counter proposal.
 *
 * The mail id identifies the proposal on its own, the rest guards against a message being
 * replaced by a newer proposal for the same appointment. The appointment id alone would not do:
 * it is shared by a series and all of its exceptions.
 */
export const getProposalKey = ({
	messageId,
	ridZ,
	start,
	end
}: {
	messageId: string;
	ridZ?: string;
	start: number;
	end: number;
}): string => `${messageId}|${ridZ ?? ''}|${start}|${end}`;

const markProposalReply = (key: string, reply: ProposalReply): void => {
	useProposalRepliesStore.setState((state) => ({
		proposalReplies: { ...state.proposalReplies, [key]: reply }
	}));
};

export const markProposalAsAccepted = (key: string): void =>
	markProposalReply(key, PROPOSAL_REPLY.ACCEPTED);

export const markProposalAsDeclined = (key: string): void =>
	markProposalReply(key, PROPOSAL_REPLY.DECLINED);

export const useProposalReply = (key: string): ProposalReply | undefined =>
	useProposalRepliesStore((state) => state.proposalReplies[key]);
