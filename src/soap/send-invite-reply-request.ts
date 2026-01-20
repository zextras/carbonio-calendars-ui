/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

import { InstanceExceptionId } from '../utils/event';

// DtTimeInfo - Date/time information
export type DtTimeInfo = {
	d?: string; // Date in format YYYYMMDD['T'HHMMSS[Z]]
	tz?: string; // Timezone identifier
	u?: number; // UTC time as milliseconds since the epoch
};

// TzOnsetInfo - Timezone transition information
export type TzOnsetInfo = {
	week?: number; // Week number; 1=first, 2=second, 3=third, 4=fourth, -1=last
	wkday?: number; // Day of week; 1=Sunday, 2=Monday, etc.
	mon: number; // Month; 1=January, 2=February, etc.
	mday?: number; // Day of month (1..31)
	hour: number; // Transition hour (0..23)
	min: number; // Transition minute (0..59)
	sec: number; // Transition second; 0..59, usually 0
};

// CalTZInfo - Calendar timezone information
export type CalTZInfo = {
	id: string; // Timezone ID
	stdoff: number; // Standard Time's offset in minutes from UTC
	dayoff: number; // Daylight Saving Time's offset in minutes from UTC
	stdname?: string; // Standard Time component's timezone name
	dayname?: string; // Daylight Saving Time component's timezone name
	standard?: TzOnsetInfo; // Time/rule for transitioning from daylight time to standard time
	daylight?: TzOnsetInfo; // Time/rule for transitioning from standard time to daylight time
};

// MimePartAttachSpec - MIME part attachment specification
export type MimePartAttachSpec = {
	mid: string; // Message ID
	part: string; // Part
	requiresSmartLinkConversion: boolean;
	optional?: 0 | 1; // Optional flag
};

// MsgAttachSpec - Message attachment specification
export type MsgAttachSpec = {
	id: string; // ID
	optional?: 0 | 1; // Optional flag
};

// ContactAttachSpec - Contact attachment specification
export type ContactAttachSpec = {
	id: string; // ID
	optional?: 0 | 1; // Optional flag
};

// AttachmentsInfo - Attachments information
export type AttachmentsInfo = {
	aid?: string; // Attachment upload ID
	mp?: MimePartAttachSpec[];
	m?: MsgAttachSpec[];
	cn?: ContactAttachSpec[];
};

// MimePartInfo - MIME part information
export type MimePartInfo = {
	ct?: string; // Content type
	content?: string; // Content
	ci?: string; // Content ID
	mp?: MimePartInfo[]; // Nested MIME parts
	attach?: AttachmentsInfo; // Attachments
};

// EmailAddrInfo - Email address information
export type EmailAddrInfo = {
	a: string; // Email address
	t?: string; // Address type - (f)rom, (t)o, (c)c, (b)cc, etc.
	p?: string; // The comment/name part of an address
};

// InviteReplyVerb enum - Verb values for invite replies
export enum InviteReplyVerb {
	ACCEPT = 'ACCEPT',
	DECLINE = 'DECLINE',
	TENTATIVE = 'TENTATIVE',
	COMPLETED = 'COMPLETED', // NOT supported as of 9/12/2005
	DELEGATED = 'DELEGATED' // NOT supported as of 9/12/2005
}

// InvitationInfo types (simplified - only what's needed for reply)
export type InvitationInfo = {
	id?: string;
	ct?: string;
	ci?: string;
	method?: string;
	compNum?: number;
	rsvp?: 0 | 1;
	priority?: string;
	name?: string;
	loc?: string;
	// ... other invite fields can be added as needed
};

// Msg - Message information
export type Msg = {
	aid?: string; // Uploaded MIME body ID
	origid?: string; // Original ID
	rt?: 'r' | 'w'; // Reply type - (r)eplied or for(w)arded
	idnt?: string; // Identity ID
	su?: string; // Subject
	irt?: string; // Message-ID header for message being replied to
	l?: string; // Folder ID
	f?: string; // Flags
	header?: Array<{
		// Headers
		name?: string;
		_content?: string;
	}>;
	content?: string; // Content
	mp?: MimePartInfo; // MIME part information
	attach?: AttachmentsInfo; // Attachments information
	inv?: InvitationInfo; // Invite information
	e?: EmailAddrInfo[]; // Email address information
	tz?: CalTZInfo[]; // Timezones
	fr?: string; // Fragment
};

// Main SendInviteReplyRequest type
export type SendInviteReplyRequest = {
	_jsns: string;
	id: string; // Unique ID of the invite (and component therein) you are replying to
	compNum: number; // Component number of the invite
	verb: InviteReplyVerb; // Verb - ACCEPT, DECLINE, TENTATIVE, COMPLETED, DELEGATED (Completed/Delegated are NOT supported as of 9/12/2005)
	updateOrganizer?: 0 | 1 | boolean; // Update organizer (default: true)
	idnt?: string; // Identity ID to use to send reply
	// Optional child elements
	exceptId?: DtTimeInfo; // Reply to just one instance
	tz?: CalTZInfo; // Definition for TZID referenced by DATETIME in exceptId
	m?: Msg; // Embedded message for custom update message
	rt?: 'r' | 'w'; // Reply type - (r)eplied or for(w)arded // TODO this param seems redundant with the one in Msg and not present in the SOAP DOCS
};

export type SendInviteReplyRejectedType = {
	error: boolean;
	Fault?: {
		Code: {
			Value: string;
		};
		Reason: {
			Text: string;
		};
		Detail: {
			Error: {
				Code: string;
				Trace: string;
				_jsns: string;
			};
		};
	};
	apptId?: never;
	calItemId?: never;
	invId?: never;
};

export type SendInviteReplyFulfilledType = {
	Fault?: never;
	error?: never;
	apptId: string;
	calItemId: string;
	invId: string;
};

export type SendInviteReplyReturnType = SendInviteReplyFulfilledType | SendInviteReplyRejectedType;

export const sendInviteReplyRequest = async ({
	id,
	action,
	updateOrganizer,
	exceptId
}: {
	id: string;
	action: InviteReplyVerb;
	updateOrganizer: boolean;
	exceptId?: InstanceExceptionId;
}): Promise<SendInviteReplyReturnType> => {
	const reqParams: SendInviteReplyRequest = {
		_jsns: 'urn:zimbraMail',
		id,
		compNum: 0,
		exceptId,
		verb: action,
		rt: 'r',
		updateOrganizer
	};

	const response: SendInviteReplyReturnType = await legacySoapFetch('SendInviteReply', reqParams);
	return response?.Fault ? { ...response.Fault, error: true } : response;
};
