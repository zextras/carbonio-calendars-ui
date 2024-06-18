/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui';
import { HttpResponse, HttpResponseResolver } from 'msw';

import { CarbonioMailboxRestHandlerRequest } from '../../../../carbonio-ui-commons/test/mocks/network/msw/handlers';
import { ROOM_DIVIDER } from '../../../../constants';

const uid = '71c5949a-69e2-48e7-b4c2-3765f6a4eaed';
const senderMail = 'sender@mail.com';
const receiverMail = 'receiver@mail.com';
const tz = 'Europe/Berlin';

export const singleGetMsgResponse = {
	m: [
		{
			s: 0,
			d: 1707139010000,
			l: '10',
			f: '',
			tn: '',
			t: '',
			meta: [{}],
			rev: 3693,
			md: 1707139010,
			ms: 3693,
			id: '1484-1483',
			inv: [
				{
					type: 'appt',
					comp: [
						{
							method: 'REQUEST',
							compNum: 0,
							rsvp: false,
							name: 'test single',
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
							alarm: [
								{
									action: 'DISPLAY',
									trigger: [
										{
											rel: [
												{
													neg: true,
													m: 5,
													related: 'START'
												}
											]
										}
									],
									desc: [{}]
								}
							],
							fr: 'message fragment',
							noBlob: true,
							desc: [
								{
									_content: ''
								}
							],
							descHtml: [
								{
									_content: ''
								}
							],
							fba: 'B',
							fb: 'B',
							transp: 'O',
							or: {
								a: senderMail,
								url: senderMail,
								d: 'send fullName'
							},
							url: '',
							isOrg: true,
							x_uid: uid,
							uid,
							seq: 0,
							d: 1707139010000,
							calItemId: '1484',
							apptId: '1484',
							ciFolder: '10',
							status: 'CONF',
							class: 'PUB',
							s: [
								{
									d: '20240205T160000',
									tz,
									u: 1707145200000
								}
							],
							e: [
								{
									tz,
									u: 1707147000000,
									d: '20240205T163000'
								}
							]
						}
					]
				}
			]
		}
	],
	_jsns: 'urn:zimbraMail'
};

export const singleGetMsgAllDayResponse = {
	...singleGetMsgResponse,
	m: [
		{
			...singleGetMsgResponse.m[0],
			inv: [
				{
					...singleGetMsgResponse.m[0].inv[0],
					comp: [
						{
							...singleGetMsgResponse.m[0].inv[0].comp[0],
							s: [
								{
									d: '20240206'
								}
							],
							e: [
								{
									d: '20240206'
								}
							],
							allDay: true
						}
					]
				}
			]
		}
	]
};

export const seriesGetMsgResponse = {
	...singleGetMsgResponse,
	m: [
		{
			...singleGetMsgResponse.m[0],
			inv: [
				{
					...singleGetMsgResponse.m[0].inv[0],
					comp: [
						{
							...singleGetMsgResponse.m[0].inv[0].comp[0],
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
							],
							s: [
								{
									d: '20240205T160000',
									tz,
									u: 1707145200000
								}
							],
							e: [
								{
									tz,
									u: 1707147000000,
									d: '20240205T163000'
								}
							]
						}
					]
				}
			]
		}
	]
};

export const seriesGetMsgAllDayResponse = {
	...seriesGetMsgResponse,
	m: [
		{
			...seriesGetMsgResponse.m[0],
			inv: [
				{
					...seriesGetMsgResponse.m[0].inv[0],
					comp: [
						{
							...seriesGetMsgResponse.m[0].inv[0].comp[0],
							allDay: true,
							s: [
								{
									d: '20240205'
								}
							],
							e: [
								{
									d: '20240205'
								}
							]
						}
					]
				}
			]
		}
	]
};
const getSoapInvite = ({ context }: { context: { id: string } }): any => ({
	s: 0,
	d: 1670259003000,
	l: '10',
	f: 'd',
	tn: '',
	t: '',
	meta: [{}],
	rev: 110006,
	md: 1670259003,
	ms: 110006,
	id: context?.id,
	inv: [
		{
			type: 'appt',
			comp: [
				{
					method: 'PUBLISH',
					compNum: 0,
					rsvp: false,
					name: 'test',
					loc: '',
					alarm: [
						{
							action: 'DISPLAY',
							trigger: [
								{
									rel: [
										{
											neg: true,
											m: 5,
											related: 'START'
										}
									]
								}
							],
							desc: [{}]
						}
					],
					fr: `${ROOM_DIVIDER} mail fullname have invited you to a new meeting! Subject: ...`,
					noBlob: true,
					desc: [
						{
							_content: `${ROOM_DIVIDER}\nmail fullname have invited you to a new meeting!\n\nSubject: test \nOrganizer: "mail fullname \n\nTime: Monday, December 5, 2022 12:30 PM - 1:00 PM\n \nInvitees:  \n\n\n${ROOM_DIVIDER}\n`
						}
					],
					descHtml: [
						{
							_content: `<html><body id="htmlmode">${ROOM_DIVIDER}<h3>mail fullname have invited you to a new meeting!</h3><p>Subject: test</p><p>Organizer: mail fullname</p><p>Location: </p><p>Time: Monday, December 5, 2022 12:30 PM - 1:00 PM</p><p>Invitees: </p><br />${ROOM_DIVIDER}</body></html><html><body id="htmlmode"></body></html><html><body id="htmlmode"></body></html><html><body id="htmlmode"></body></html>`
						}
					],
					fba: 'B',
					fb: 'B',
					transp: 'O',
					or: {
						a: 'mail@fullname.com',
						url: 'mail@fullname.com',
						d: 'mail fullname'
					},
					url: '',
					isOrg: true,
					x_uid: '66d611a8-22d7-479a-b7b1-87d201e1a34d',
					uid: '66d611a8-22d7-479a-b7b1-87d201e1a34d',
					seq: 3,
					d: 1670259003000,
					calItemId: '38298',
					apptId: '38298',
					ciFolder: '10',
					status: 'CONF',
					class: 'PUB',
					s: [
						{
							d: '20221205T113000Z',
							u: 1670239800000
						}
					],
					e: [
						{
							u: 1670241600000,
							d: '20221205T120000Z'
						}
					],
					draft: true
				}
			]
		}
	],
	_jsns: 'urn:zimbraMail'
});

const getResponse = (id: string): SuccessSoapResponse<any> => ({
	Header: {
		context: {
			session: { id: 150973, _content: 150973 },
			change: { token: 15954 }
		}
	},
	Body: {
		GetMsgResponse: {
			m: [getSoapInvite({ context: { id } })],
			_jsns: 'urn:zimbraMail'
		}
	}
});

export const handleGetInvite: HttpResponseResolver<
	never,
	CarbonioMailboxRestHandlerRequest<{ m: { id: string } }>,
	SuccessSoapResponse<any>
> = async ({ request }) => {
	const {
		Body: {
			GetMsgRequest: {
				m: { id }
			}
		}
	} = await request.json();
	const response = getResponse(id);
	return HttpResponse.json(response);
};
