/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui/types/network/soap';

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
											fr: '-:::_::_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_::_:_::- Carbonio Admin have invited you to a new meeting! Subject: New ...',
											noBlob: true,
											desc: [
												{
													_content:
														'-:::_::_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_::_:_::-\nCarbonio Admin have invited you to a new meeting!\n\nSubject: New appointment \nOrganizer: "Carbonio Admin \n\nTime: Monday, November 7, 2022 5:27 PM - 5:27 PM\n \nInvitees:  \n\n\n-:::_::_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_::_:_::-\n'
												}
											],
											descHtml: [
												{
													_content:
														'<html><body id="htmlmode">-:::_::_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_::_:_::-<h3>Carbonio Admin have invited you to a new meeting!</h3><p>Subject: New appointment</p><p>Organizer: Carbonio Admin</p><p>Location: </p><p>Time: Monday, November 7, 2022 5:27 PM - 5:27 PM</p><p>Invitees: </p><br />-:::_::_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_::_:_::-</body></html>'
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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const handleCreateAppointmentExceptionRequest = (req, res, ctx) => {
	const resp = req.body.Body.CreateAppointmentExceptionRequest;
	const response = getResponse();
	return res(ctx.json(response));
};
