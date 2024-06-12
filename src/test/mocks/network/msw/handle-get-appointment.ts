/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui';
import { HttpResponse, HttpResponseResolver } from 'msw';

import { CarbonioMailboxRestHandlerRequest } from '../../../../carbonio-ui-commons/test/mocks/network/msw/handlers';

const uid = '71c5949a-69e2-48e7-b4c2-3765f6a4eaed';
const senderMail = 'sender@mail.com';
const receiverMail = 'receiver@mail.com';
const tz = 'Europe/Berlin';

export const singleAppointmentResponse = {
	appt: [
		{
			uid,
			id: '1484',
			l: '10',
			rev: 3693,
			s: 0,
			d: 1707139010000,
			inv: [
				{
					type: 'appt',
					seq: 0,
					id: 1483,
					compNum: 0,
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
								d: 'sender fullName'
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
			],
			nextAlarm: 1707144900000
		}
	],
	_jsns: 'urn:zimbraMail'
};

export const singleAppointmentAllDayResponse = {
	...singleAppointmentResponse,
	appt: [
		{
			...singleAppointmentResponse.appt[0],
			inv: [
				{
					...singleAppointmentResponse.appt[0].inv[0],
					comp: [
						{
							...singleAppointmentResponse.appt[0].inv[0].comp[0],
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

export const seriesAppointmentResponse = {
	...singleAppointmentResponse,
	appt: [
		{
			...singleAppointmentResponse.appt[0],
			inv: [
				{
					...singleAppointmentResponse.appt[0].inv[0],
					comp: [
						{
							...singleAppointmentResponse.appt[0].inv[0].comp[0],
							allDay: false,
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

export const seriesAppointmentAllDayResponse = {
	...seriesAppointmentResponse,
	appt: [
		{
			...seriesAppointmentResponse.appt[0],
			inv: [
				{
					...seriesAppointmentResponse.appt[0].inv[0],
					comp: [
						{
							...seriesAppointmentResponse.appt[0].inv[0].comp[0],
							allDay: true
						}
					]
				}
			]
		}
	]
};

export const exceptionAppointmentResponse = {
	...singleAppointmentResponse,
	appt: [
		{
			...singleAppointmentResponse.appt[0],
			inv: [
				singleAppointmentResponse.appt[0].inv[0],
				{
					...singleAppointmentResponse.appt[0].inv[0],
					comp: [
						{
							...singleAppointmentResponse.appt[0].inv[0].comp[0],
							ridZ: '20240207T080000Z',
							ex: true,
							exceptId: {
								d: '20240207T090000',
								tz
							},
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

export const exceptionAppointmentAllDayResponse = {
	...exceptionAppointmentResponse,
	appt: [
		{
			...exceptionAppointmentResponse.appt[0],
			inv: [
				singleAppointmentResponse.appt[0].inv[0],
				{
					...exceptionAppointmentResponse.appt[0].inv[1],
					comp: [
						{
							...exceptionAppointmentResponse.appt[0].inv[1].comp[0],
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

const getResponse = (): SuccessSoapResponse<any> => ({
	Header: { context: { change: { token: 15778 } } },
	Body: { GetAppointmentResponse: { ...singleAppointmentResponse, _jsns: 'urn:zimbraMail' } }
});

export const handleGetAppointmentRequest: HttpResponseResolver<
	never,
	CarbonioMailboxRestHandlerRequest<any>,
	SuccessSoapResponse<any>
> = () => {
	const response = getResponse();
	return HttpResponse.json(response);
};
