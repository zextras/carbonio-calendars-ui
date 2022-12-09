import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui/types/network/soap';

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
					fr: '-:::_::_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_::_:_::- Gabriele Marino have invited you to a new meeting! Subject: ...',
					noBlob: true,
					desc: [
						{
							_content:
								'-:::_::_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_::_:_::-\nGabriele Marino have invited you to a new meeting!\n\nSubject: test \nOrganizer: "Gabriele Marino \n\nTime: Monday, December 5, 2022 12:30 PM - 1:00 PM\n \nInvitees:  \n\n\n-:::_::_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_::_:_::-\n'
						}
					],
					descHtml: [
						{
							_content:
								'<html><body id="htmlmode">-:::_::_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_::_:_::-<h3>Gabriele Marino have invited you to a new meeting!</h3><p>Subject: test</p><p>Organizer: Gabriele Marino</p><p>Location: </p><p>Time: Monday, December 5, 2022 12:30 PM - 1:00 PM</p><p>Invitees: </p><br />-:::_::_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_::_:_::-</body></html><html><body id="htmlmode"></body></html><html><body id="htmlmode"></body></html><html><body id="htmlmode"></body></html>'
						}
					],
					fba: 'B',
					fb: 'B',
					transp: 'O',
					or: {
						a: 'gabriele.marino@zextras.com',
						url: 'gabriele.marino@zextras.com',
						d: 'Gabriele Marino'
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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const handleGetInvite = (req, res, ctx) => {
	const { id } = req.body.Body.GetMsgRequest.m;
	const response = getResponse(id);
	return res(ctx.json(response));
};
