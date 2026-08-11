/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { create } from 'zustand';

export type AcceptedProposalsAppState = {
	acceptedProposals: Record<string, true>;
};

/**
 * Counter proposals accepted during this session.
 *
 * The mails module re-creates the invite panel once the counter mail is moved to trash, which
 * wipes any component state. Without this store the accept button would come back enabled and a
 * second click would send the attendee a duplicate notification.
 */
export const useAcceptedProposalsStore = create<AcceptedProposalsAppState>(() => ({
	acceptedProposals: {}
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

export const markProposalAsAccepted = (key: string): void => {
	useAcceptedProposalsStore.setState((state) => ({
		acceptedProposals: { ...state.acceptedProposals, [key]: true }
	}));
};

export const useIsProposalAccepted = (key: string): boolean =>
	useAcceptedProposalsStore((state) => state.acceptedProposals[key] ?? false);
