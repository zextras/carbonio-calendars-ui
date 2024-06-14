/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui';
import { some } from 'lodash';
import { HttpResponse, HttpResponseResolver } from 'msw';

import { CarbonioMailboxRestHandlerRequest } from '../../../../carbonio-ui-commons/test/mocks/network/msw/handlers';
import { ROOM_DIVIDER } from '../../../../constants';

const getResponse = (): SuccessSoapResponse<any> => ({
	Header: {
		context: {
			session: {
				id: 1403,
				_content: 1403
			}
		}
	},
	Body: {
		CreateAppointmentResponse: {
			calItemId: '395',
			apptId: '395',
			invId: '395-394',
			ms: 5908,
			rev: 5908,
			echo: [
				{
					m: [
						{
							s: 0,
							d: 1667838424000,
							l: '10',
							f: '',
							tn: '',
							t: '',
							meta: [{}],
							rev: 5908,
							md: 1667838424,
							ms: 5908,
							id: '395-394',
							inv: [
								{
									type: 'appt',
									comp: [
										{
											method: 'PUBLISH',
											compNum: 0,
											rsvp: false,
											name: 'New appointment',
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
											fr: `${ROOM_DIVIDER} Carbonio Admin have invited you to a new meeting! Subject: New ...`,
											noBlob: true,
											desc: [
												{
													_content: `${ROOM_DIVIDER}\nCarbonio Admin have invited you to a new meeting!\n\nSubject: New appointment \nOrganizer: "Carbonio Admin \n\nTime: Monday, November 7, 2022 5:27 PM - 5:27 PM\n \nInvitees:  \n\n\n${ROOM_DIVIDER}\n`
												}
											],
											descHtml: [
												{
													_content: `<html><body id="htmlmode">${ROOM_DIVIDER}<h3>Carbonio Admin have invited you to a new meeting!</h3><p>Subject: New appointment</p><p>Organizer: Carbonio Admin</p><p>Location: </p><p>Time: Monday, November 7, 2022 5:27 PM - 5:27 PM</p><p>Invitees: </p><br />${ROOM_DIVIDER}</body></html>`
												}
											],
											fba: 'B',
											fb: 'B',
											transp: 'O',
											or: {
												a: 'carbonio@admin.io',
												url: 'carbonio@admin.io',
												d: 'Carbonio Admin'
											},
											url: '',
											isOrg: true,
											x_uid: '782bd27d-ca64-4913-bca8-c02de00d74a6',
											uid: '782bd27d-ca64-4913-bca8-c02de00d74a6',
											seq: 0,
											d: 1667838424000,
											calItemId: '395',
											apptId: '395',
											ciFolder: '10',
											status: 'CONF',
											class: 'PUB',
											s: [
												{
													d: '20221107T162701Z',
													u: 1667838421000
												}
											],
											e: [
												{
													u: 1667838422000,
													d: '20221107T162702Z'
												}
											]
										}
									]
								}
							]
						}
					]
				}
			],
			_jsns: 'urn:zimbraMail'
		}
	}
});

/**
 * Temporary type to workaround a bad type in Shell
 * @see SHELL-203
 */
type CustomErrorSoapResponseBody = {
	Fault: {
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
};

export const handleCreateAppointmentRequest: HttpResponseResolver<
	never,
	CarbonioMailboxRestHandlerRequest<any>,
	SuccessSoapResponse<any> | CustomErrorSoapResponseBody
> = async ({ request }) => {
	const resp = (await request.json()).Body.CreateAppointmentRequest;
	if (!resp?.m) {
		const response = {
			Fault: {
				Code: {
					Value: 'soap:Sender'
				},
				Reason: {
					Text: 'invalid request: missing required element: m'
				},
				Detail: {
					Error: {
						Code: 'service.INVALID_REQUEST',
						Trace: 'Error trace detail',
						_jsns: 'urn:zimbra'
					}
				}
			}
		};
		return HttpResponse.json(response);
	}
	if (resp?.m) {
		if (resp?.m?.e && some(resp?.m?.e, (item) => !item.a)) {
			const response = {
				Fault: {
					Code: {
						Value: 'soap:Sender'
					},
					Reason: {
						Text: 'invalid request: missing required element: a'
					},
					Detail: {
						Error: {
							Code: 'service.INVALID_REQUEST',
							Trace: 'Error trace detail',
							_jsns: 'urn:zimbra'
						}
					}
				}
			};
			return HttpResponse.json(response);
		}
		if (
			resp?.m?.mp?.attach?.mp &&
			some(resp?.m?.mp?.attach?.mp, (item) => !item?.mid || !item?.part)
		) {
			const response = {
				Fault: {
					Code: {
						Value: 'soap:Sender'
					},
					Reason: {
						Text: 'invalid request: missing required element of attachment' // todo: this is invented, use the correct message
					},
					Detail: {
						Error: {
							Code: 'service.INVALID_REQUEST',
							Trace: 'Error trace detail',
							_jsns: 'urn:zimbra'
						}
					}
				}
			};
			return HttpResponse.json(response);
		}
		if (resp?.m?.mp?.attach?.m && !resp?.m?.mp?.attach?.m?.id) {
			const response = {
				Fault: {
					Code: {
						Value: 'soap:Sender'
					},
					Reason: {
						Text: 'invalid request: missing required element: id' // todo: this is invented, use the correct message
					},
					Detail: {
						Error: {
							Code: 'service.INVALID_REQUEST',
							Trace: 'Error trace detail',
							_jsns: 'urn:zimbra'
						}
					}
				}
			};
			return HttpResponse.json(response);
		}
		if (resp?.m?.mp?.attach?.cn && !resp?.m?.mp?.attach?.cn?.id) {
			const response = {
				Fault: {
					Code: {
						Value: 'soap:Sender'
					},
					Reason: {
						Text: 'invalid request: missing required element: id' // todo: this is invented, use the correct message
					},
					Detail: {
						Error: {
							Code: 'service.INVALID_REQUEST',
							Trace: 'Error trace detail',
							_jsns: 'urn:zimbra'
						}
					}
				}
			};
			return HttpResponse.json(response);
		}
		if (resp?.m?.inv[0]?.comp[0]?.exceptId && !resp?.m?.inv[0]?.comp[0]?.exceptId?.d) {
			const response = {
				Fault: {
					Code: {
						Value: 'soap:Sender'
					},
					Reason: {
						Text: 'invalid request: missing required element: d' // todo: this is invented, use the correct message
					},
					Detail: {
						Error: {
							Code: 'service.INVALID_REQUEST',
							Trace: 'Error trace detail',
							_jsns: 'urn:zimbra'
						}
					}
				}
			};
			return HttpResponse.json(response);
		}
	}
	const response = getResponse();
	return HttpResponse.json(response);
};
