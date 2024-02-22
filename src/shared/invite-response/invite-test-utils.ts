/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { rest } from 'msw';

import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import { ObjectValues } from '../../constants/sidebar';
import { InviteResponseArguments } from '../../types/integrations';

const senderMail = 'sender@mail.com';
const receiverMail = 'receiver@mail.com';
const tz = 'Europe/Berlin';

export const MESSAGE_METHOD = {
	COUNTER: 'COUNTER',
	REQUEST: 'REQUEST'
} as const;

export const MESSAGE_TYPE = {
	SINGLE: 'SINGLE',
	SERIES: 'SERIES',
	EXCEPT: 'EXCEPTION'
} as const;

type MessageMethod = ObjectValues<typeof MESSAGE_METHOD>;
type MessageType = ObjectValues<typeof MESSAGE_TYPE>;

export const buildMailMessageType = (
	method: MessageMethod,
	type: MessageType,
	allDay: boolean
): InviteResponseArguments['mailMsg'] => {
	const s = [
		allDay
			? {
					d: '20240130'
			  }
			: {
					d: '20240130T090000',
					tz,
					u: 1706601600000
			  }
	];
	const e = [
		allDay
			? {
					d: '20240130'
			  }
			: {
					tz,
					u: 1706603400000,
					d: '20240130T093000'
			  }
	];
	const singleEventMessageRequest = {
		conversation: '-56149',
		id: '56149',
		date: 1707059306000,
		size: 7693,
		parent: '2',
		fragment: 'message fragment',
		subject: 'single event subject',
		participants: [
			{
				type: 'f',
				address: senderMail,
				name: 'sender',
				fullName: 'sender fullName',
				email: senderMail
			},
			{
				type: 't',
				address: receiverMail,
				name: 'receiver',
				fullName: 'receiver fullName',
				email: receiverMail
			}
		],
		tags: [],
		parts: [],
		attachments: [],
		invite: [
			{
				type: 'appt',
				tz: [],
				comp: [
					{
						method,
						compNum: 0,
						name: 'single event subject',
						loc: '',
						at: [
							{
								a: receiverMail,
								url: receiverMail,
								d: 'receiver fullName',
								role: 'REQ',
								ptst: 'NE',
								rsvp: true
							}
						],
						alarm: [],
						fr: 'message fragment',
						noBlob: true,
						desc: [],
						descHtml: [],
						fb: 'B',
						transp: 'O',
						or: {
							a: senderMail,
							url: senderMail,
							d: 'sender fullName'
						},
						x_uid: '9c07a317-96c3-40a0-a2e2-8d70f2cf019f',
						uid: '9c07a317-96c3-40a0-a2e2-8d70f2cf019f',
						seq: 0,
						d: 1707059305000,
						status: 'CONF',
						class: 'PUB',
						allDay,
						s,
						e
					}
				]
			}
		],
		body: {
			contentType: 'text/html',
			content: ''
		},
		isComplete: true,
		isScheduled: false,
		read: true,
		hasAttachment: false,
		flagged: false,
		urgent: false,
		isDeleted: false,
		isDraft: false,
		isForwarded: false,
		isSentByMe: false,
		isInvite: true,
		isReplied: false,
		isReadReceiptRequested: true
	};
	if (type === MESSAGE_TYPE.SINGLE) {
		return singleEventMessageRequest;
	}
	if (type === MESSAGE_TYPE.SERIES) {
		return {
			...singleEventMessageRequest,
			invite: [
				{
					...singleEventMessageRequest.invite[0],
					comp: [
						{
							...singleEventMessageRequest.invite[0].comp[0],
							allDay,
							s,
							e,
							recur: [
								{
									add: [
										{
											rule: [
												{
													freq: 'DAI',
													until: [
														{
															d: '20260204T090000Z'
														}
													],
													interval: [
														{
															ival: 1
														}
													]
												}
											]
										}
									]
								}
							]
						}
					]
				}
			]
		};
	}
	if (type === MESSAGE_TYPE.EXCEPT) {
		return {
			...singleEventMessageRequest,
			invite: [
				{
					...singleEventMessageRequest.invite[0],
					comp: [
						{
							...singleEventMessageRequest.invite[0].comp[0],
							ex: true,
							allDay,
							ridZ: '20240207T080000Z',
							exceptId: [
								{
									d: '20240207T090000',
									tz
								}
							],
							s,
							e
						}
					]
				}
			]
		};
	}
	return undefined;
};

export const setupServerSingleEventResponse = (
	getAppointmentResponse: unknown,
	getMsgResponse: unknown
): void => {
	getSetupServer().use(
		rest.post('/service/soap/GetAppointmentRequest', async (req, res, ctx) =>
			res(
				ctx.json({
					Body: {
						GetAppointmentResponse: getAppointmentResponse
					}
				})
			)
		)
	);
	getSetupServer().use(
		rest.post('/service/soap/GetMsgRequest', async (req, res, ctx) =>
			res(
				ctx.json({
					Body: {
						GetMsgResponse: getMsgResponse
					}
				})
			)
		)
	);
};
