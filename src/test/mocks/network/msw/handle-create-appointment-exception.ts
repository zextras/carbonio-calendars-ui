/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui';
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
		CreateAppointmentExceptionResponse: {
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

export const handleCreateAppointmentExceptionRequest: HttpResponseResolver<
	never,
	CarbonioMailboxRestHandlerRequest<any>,
	SuccessSoapResponse<any>
> = () => {
	const response = getResponse();
	return HttpResponse.json(response);
};
