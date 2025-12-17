/* eslint-disable @typescript-eslint/no-use-before-define */
/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as shell from '../../../__mocks__/@zextras/carbonio-shell-ui';
import { generateEditor } from '../../commons/editor-generator';
import { getIdentityItems } from '../../commons/get-identity-items';
import { PARTICIPATION_STATUS } from '../../constants/api';
import { ParticipationStatus } from '../../types/store/invite';
import {
	normalizeSoapMessageFromEditor,
	setAlarmValue,
	generateBodyRequest,
	generateHtmlBodyRequest
} from '../normalize-soap-message-from-editor';
import { createFakeIdentity, getMockedAccountItem } from '@test-utils/accounts/fakeAccounts';

const mainAccount = createFakeIdentity();
const identity = createFakeIdentity();
const identity2 = createFakeIdentity();

const sharedAccountIdentity = {
	id: 'shared_account_id',
	firstName: 'shared',
	lastName: 'account',
	fullName: 'shared account',
	userName: `random userName`,
	email: 'shared_account@mail.com'
};

const mainAccountEditorFolder = {
	id: '10',
	name: 'Calendar'
};

const sharedEditorFolder = {
	id: 'shared:id',
	name: 'shared calendar',
	owner: 'random_owner@mail.com'
};

const sharedAccountEditorFolder = {
	id: `sharedAccountFolder:${sharedAccountIdentity.id}`,
	name: 'shared account folder',
	owner: sharedAccountIdentity.email
};

const addressPrefKey = 'zimbraPrefFromAddress';

vi.mock('../../hooks/use-get-date-range-converted-to-timezone', () => ({
	getTimeStrings: vi.fn(() => 'Jan 1, 2024 10:00 AM - 11:00 AM')
}));

describe('normalize soap message from editor', () => {
	test('should set comp properly', () => {
		const userAccount = getMockedAccountItem({ identity1: mainAccount });
		shell.getUserAccount.mockImplementation(() => userAccount);

		const editor = generateEditor({
			context: {
				compNum: 4,
				folders: {},
				dispatch: vi.fn()
			}
		});
		const body = normalizeSoapMessageFromEditor(editor);

		expect(body.comp).toBe(4);
	});
	describe('when the user is the organizer ', () => {
		describe('and the appointment is inside his calendar ', () => {
			test('when one of the attendee/optionalAttendee has changed the appointment status(ptst), the ptst should be preserved in normalization', () => {
				const userAccount = getMockedAccountItem({ identity1: mainAccount });
				shell.getUserAccount.mockImplementation(() => userAccount);
				const attendees = [
					generateAttendee({
						email: 'accepted_attendee@gmail.com',
						participantStatus: PARTICIPATION_STATUS.ACCEPTED
					})
				];
				const optionalAttendees = [
					generateAttendee({
						email: 'accepted_optional_attendee@gmail.com',
						participantStatus: PARTICIPATION_STATUS.ACCEPTED
					})
				];
				const editor = generateEditor({
					context: {
						attendees,
						optionalAttendees,
						folders: {},
						dispatch: vi.fn()
					}
				});
				const body = normalizeSoapMessageFromEditor(editor);

				expect(body.m.inv.comp[0].at.length).toBe(2);
				expect(body.m.inv.comp[0].at[0]).toMatchObject({
					a: 'accepted_attendee@gmail.com',
					ptst: PARTICIPATION_STATUS.ACCEPTED
				});
				expect(body.m.inv.comp[0].at[1]).toMatchObject({
					a: 'accepted_optional_attendee@gmail.com',
					ptst: PARTICIPATION_STATUS.ACCEPTED
				});
			});
			test('when attendee/optionalAttendee don`t have a status(ptst), the ptst should be set as NE', () => {
				const userAccount = getMockedAccountItem({ identity1: mainAccount });
				shell.getUserAccount.mockImplementation(() => userAccount);
				const attendees = [generateAttendee({ email: 'attendee@gmail.com' })];
				const optionalAttendees = [
					generateAttendee({
						email: 'optional_attendee@gmail.com'
					})
				];
				const editor = generateEditor({
					context: {
						attendees,
						optionalAttendees,
						folders: {},
						dispatch: vi.fn()
					}
				});
				const body = normalizeSoapMessageFromEditor(editor);

				expect(body.m.inv.comp[0].at.length).toBe(2);
				expect(body.m.inv.comp[0].at[0]).toMatchObject({
					a: 'attendee@gmail.com',
					ptst: PARTICIPATION_STATUS.NEED_ACTION
				});
				expect(body.m.inv.comp[0].at[1]).toMatchObject({
					a: 'optional_attendee@gmail.com',
					ptst: PARTICIPATION_STATUS.NEED_ACTION
				});
			});
			describe('and he is not using identities ', () => {
				test('there wont be a sentBy parameter', () => {
					const userAccount = getMockedAccountItem({ identity1: mainAccount, identity2: identity });

					shell.getUserAccount.mockImplementation(() => userAccount);

					const editor = generateEditor({
						context: {
							folders: {},
							dispatch: vi.fn(),
							calendar: mainAccountEditorFolder
						}
					});
					const body = normalizeSoapMessageFromEditor(editor);
					expect(body.m.inv.comp[0].or.sentBy).toBeUndefined();
					expect(body.m.inv.comp[0].or.a).toBe(mainAccount.email);
					expect(body.m.e).toStrictEqual([
						{
							a: mainAccount.email,
							p: mainAccount.fullName,
							t: 'f'
						}
					]);
				});
				test('user send the message using preferred email, there will be sentBy parameter', () => {
					const customIdentity = {
						...mainAccount,
						_attrs: { [addressPrefKey]: identity.email }
					};
					const userAccount = getMockedAccountItem({
						identity1: customIdentity,
						identity2: identity
					});

					shell.getUserAccount.mockImplementation(() => userAccount);

					const editor = generateEditor({
						context: {
							folders: {},
							dispatch: vi.fn(),
							calendar: mainAccountEditorFolder
						}
					});
					const body = normalizeSoapMessageFromEditor(editor);
					expect(body.m.inv.comp[0].or.sentBy).toBe(identity.email);
					expect(body.m.inv.comp[0].or.a).toBe(mainAccount.email);
					expect(body.m.e).toStrictEqual([
						{
							a: mainAccount.email,
							p: mainAccount.fullName,
							t: 'f'
						},
						{
							a: identity.email,
							p: mainAccount.fullName,
							t: 's'
						}
					]);
				});
			});
			describe('and he is using an identity ', () => {
				describe('with different email from the main account ', () => {
					test('there will be a sentBy', () => {
						const customIdentity = {
							...identity,
							_attrs: { [addressPrefKey]: identity2.email }
						};
						const userAccount = getMockedAccountItem({
							identity1: mainAccount,
							identity2: customIdentity,
							identity3: identity2
						});

						shell.getUserAccount.mockImplementation(() => userAccount);

						const identities = getIdentityItems();

						const editor = generateEditor({
							context: {
								folders: {},
								dispatch: vi.fn(),
								calendar: mainAccountEditorFolder,
								sender: { email: identities[1].address ?? '', fullName: identities[1].fullName }
							}
						});
						const body = normalizeSoapMessageFromEditor(editor);
						expect(body.m.inv.comp[0].or.a).toBe(mainAccount.email);
						expect(body.m.inv.comp[0].or.sentBy).toBe(identities[1].address);
						expect(body.m.e).toStrictEqual([
							{
								a: mainAccount.email,
								p: mainAccount.fullName,
								t: 'f'
							},
							{
								a: identities[2].address,
								p: identities[1].fullName,
								t: 's'
							}
						]);
					});
					test('user send the message using preferred email, there will be a sentBy', () => {
						const userAccount = getMockedAccountItem({
							identity1: mainAccount,
							identity2: { ...identity, _attrs: { [addressPrefKey]: identity2.email } },
							identity3: identity2
						});

						shell.getUserAccount.mockImplementation(() => userAccount);

						const identities = getIdentityItems();

						const editor = generateEditor({
							context: {
								folders: {},
								dispatch: vi.fn(),
								calendar: mainAccountEditorFolder,
								sender: { email: identities[1].address ?? '', fullName: identities[1].fullName }
							}
						});
						const body = normalizeSoapMessageFromEditor(editor);
						expect(body.m.inv.comp[0].or.a).toBe(mainAccount.email);
						expect(body.m.inv.comp[0].or.sentBy).toBe(identities[1].address);
						expect(body.m.e).toStrictEqual([
							{
								a: mainAccount.email,
								p: mainAccount.fullName,
								t: 'f'
							},
							{
								a: identities[1].address,
								p: identities[1].fullName,
								t: 's'
							}
						]);
					});
				});
				describe('with the same email as the main account, there wont be a sentBy parameter', () => {
					// d is the full name of the sender which will de shown in the from of the message
					test('if fullName is not available there wont be a d parameter', () => {
						const userAccount = getMockedAccountItem({
							identity1: mainAccount,
							identity2: {
								...identity,
								// todo: shell AccountRightTarget type is wrong and does not allow to pass fullName as undefined
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								fullName: undefined,
								_attrs: { [addressPrefKey]: mainAccount.email }
							},
							identity3: identity2
						});

						shell.getUserAccount.mockImplementation(() => userAccount);

						const identities = getIdentityItems();

						const editor = generateEditor({
							context: {
								folders: {},
								dispatch: vi.fn(),
								calendar: mainAccountEditorFolder,
								sender: { email: identities[1].address ?? '', fullName: identities[1].fullName }
							}
						});
						const body = normalizeSoapMessageFromEditor(editor);
						expect(body.m.inv.comp[0].or.d).toBeUndefined();
						expect(body.m.inv.comp[0].or.a).toBe(mainAccount.email);
						expect(body.m.inv.comp[0].or.sentBy).toBeUndefined();
						expect(body.m.e).toStrictEqual([
							{
								a: mainAccount.email,
								p: mainAccount.fullName,
								t: 'f'
							},
							{
								a: mainAccount.email,
								t: 's'
							}
						]);
					});
					test('if fullName is available there will be a d parameter', () => {
						const userAccount = getMockedAccountItem({
							identity1: mainAccount,
							identity2: {
								...identity,
								_attrs: { [addressPrefKey]: mainAccount.email }
							},
							identity3: identity2
						});

						shell.getUserAccount.mockImplementation(() => userAccount);

						const identities = getIdentityItems();

						const editor = generateEditor({
							context: {
								folders: {},
								dispatch: vi.fn(),
								calendar: mainAccountEditorFolder,
								sender: { email: identities[1].address ?? '', fullName: identities[1].fullName }
							}
						});
						const body = normalizeSoapMessageFromEditor(editor);
						expect(body.m.inv.comp[0].or.d).toBe(identity.fullName);
						expect(body.m.inv.comp[0].or.a).toBe(mainAccount.email);
						expect(body.m.inv.comp[0].or.sentBy).toBeUndefined();
						expect(body.m.e).toStrictEqual([
							{
								a: mainAccount.email,
								p: mainAccount.fullName,
								t: 'f'
							},
							{
								a: mainAccount.email,
								p: identities[1].fullName,
								t: 's'
							}
						]);
					});
				});
			});
		});
		describe('and the appointment is inside a shared calendar ', () => {
			describe('and he is not using identities ', () => {
				test('sentBy will be available', () => {
					const userAccount = getMockedAccountItem({ identity1: mainAccount, identity2: identity });

					shell.getUserAccount.mockImplementation(() => userAccount);

					const editor = generateEditor({
						context: {
							folders: {},
							dispatch: vi.fn(),
							calendar: sharedEditorFolder
						}
					});
					const body = normalizeSoapMessageFromEditor(editor);
					expect(body.m.inv.comp[0].or.sentBy).toBe(mainAccount.email);
					expect(body.m.inv.comp[0].or.a).toBe(sharedEditorFolder.owner);
					expect(body.m.e).toStrictEqual([
						{
							a: sharedEditorFolder.owner,
							t: 'f'
						},
						{
							a: mainAccount.email,
							p: mainAccount.fullName,
							t: 's'
						}
					]);
				});
				test('and the user send the message using a custom email - there will be a sentBy parameter', () => {
					const userAccount = getMockedAccountItem({
						identity1: { ...mainAccount, _attrs: { [addressPrefKey]: identity.email } },
						identity2: identity
					});

					shell.getUserAccount.mockImplementation(() => userAccount);

					const editor = generateEditor({
						context: {
							folders: {},
							dispatch: vi.fn(),
							calendar: sharedEditorFolder
						}
					});
					const body = normalizeSoapMessageFromEditor(editor);
					expect(body.m.inv.comp[0].or.sentBy).toBe(identity.email);
					expect(body.m.inv.comp[0].or.a).toBe(sharedEditorFolder.owner);
					expect(body.m.e).toStrictEqual([
						{
							a: sharedEditorFolder.owner,
							t: 'f'
						},
						{
							a: identity.email,
							p: mainAccount.fullName,
							t: 's'
						}
					]);
				});
			});
			describe('and he is using an identity ', () => {
				describe('with different email from the main account ', () => {
					test('there will be a sentBy parameter in the request', () => {
						const userAccount = getMockedAccountItem({
							identity1: mainAccount,
							identity2: identity
						});

						shell.getUserAccount.mockImplementation(() => userAccount);

						const identities = getIdentityItems();

						const editor = generateEditor({
							context: {
								folders: {},
								dispatch: vi.fn(),
								calendar: sharedEditorFolder,
								sender: { email: identities[1].address ?? '', fullName: identities[1].fullName }
							}
						});
						const body = normalizeSoapMessageFromEditor(editor);
						expect(body.m.inv.comp[0].or.a).toBe(sharedEditorFolder.owner);
						expect(body.m.inv.comp[0].or.sentBy).toBe(identities[1].address);
						expect(body.m.e).toStrictEqual([
							{
								a: sharedEditorFolder.owner,
								t: 'f'
							},
							{
								a: identities[1].address,
								p: identities[1].fullName,
								t: 's'
							}
						]);
					});
					test('and the user send the message using a custom email, there will be a sent parameter', () => {
						const userAccount = getMockedAccountItem({
							identity1: mainAccount,
							identity2: { ...identity, _attrs: { [addressPrefKey]: identity2.email } },
							identity3: identity2
						});

						shell.getUserAccount.mockImplementation(() => userAccount);

						const identities = getIdentityItems();

						const editor = generateEditor({
							context: {
								folders: {},
								dispatch: vi.fn(),
								calendar: sharedEditorFolder,
								sender: { email: identities[1].address ?? '', fullName: identities[1].fullName }
							}
						});
						const body = normalizeSoapMessageFromEditor(editor);
						expect(body.m.inv.comp[0].or.a).toBe(sharedEditorFolder.owner);
						expect(body.m.inv.comp[0].or.sentBy).toBe(identities[2].address);
						expect(body.m.e).toStrictEqual([
							{
								a: sharedEditorFolder.owner,
								t: 'f'
							},
							{
								a: identity2.email,
								p: identities[1].fullName,
								t: 's'
							}
						]);
					});
				});
				test('with the same email as the main account, there will be a sentBy parameter', () => {
					const userAccount = getMockedAccountItem({
						identity1: mainAccount,
						identity2: {
							...identity,
							_attrs: { [addressPrefKey]: mainAccount.email }
						}
					});

					shell.getUserAccount.mockImplementation(() => userAccount);

					const identities = getIdentityItems();

					const editor = generateEditor({
						context: {
							folders: {},
							dispatch: vi.fn(),
							calendar: sharedEditorFolder,
							sender: { email: identities[1].address ?? '', fullName: identities[1].fullName }
						}
					});
					const body = normalizeSoapMessageFromEditor(editor);
					expect(body.m.inv.comp[0].or.d).toBeUndefined();
					expect(body.m.inv.comp[0].or.a).toBe(sharedEditorFolder.owner);
					expect(body.m.inv.comp[0].or.sentBy).toBe(mainAccount.email);
					expect(body.m.e).toStrictEqual([
						{
							a: sharedEditorFolder.owner,
							t: 'f'
						},
						{
							a: identities[1].address,
							p: identities[1].fullName,
							t: 's'
						}
					]);
				});
			});
		});
	});
	describe('when the user is not the organizer', () => {
		describe('and the appointment is inside a shared calendar ', () => {
			test('user send the message from his main account', () => {
				const userAccount = getMockedAccountItem({
					identity1: mainAccount,
					identity2: identity
				});

				shell.getUserAccount.mockImplementation(() => userAccount);

				const identities = getIdentityItems();

				const editor = generateEditor({
					context: {
						folders: {},
						dispatch: vi.fn(),
						calendar: sharedEditorFolder,
						sender: { email: identities[0].address ?? '', fullName: identities[0].fullName }
					}
				});
				const body = normalizeSoapMessageFromEditor(editor);
				expect(body.m.inv.comp[0].or.sentBy).toBe(mainAccount.email);
				expect(body.m.inv.comp[0].or.a).toBe(sharedEditorFolder.owner);
				expect(body.m.e).toStrictEqual([
					{
						a: sharedEditorFolder.owner,
						t: 'f'
					},
					{
						a: mainAccount.email,
						p: mainAccount.fullName,
						t: 's'
					}
				]);
			});
			test('user send the message from his main account using a custom email', () => {
				const userAccount = getMockedAccountItem({
					identity1: { ...mainAccount, _attrs: { [addressPrefKey]: identity.email } },
					identity2: identity
				});

				shell.getUserAccount.mockImplementation(() => userAccount);

				const identities = getIdentityItems();

				const editor = generateEditor({
					context: {
						folders: {},
						dispatch: vi.fn(),
						calendar: sharedEditorFolder,
						sender: { email: identities[0].address ?? '', fullName: identities[0].fullName }
					}
				});
				const body = normalizeSoapMessageFromEditor(editor);
				expect(body.m.inv.comp[0].or.sentBy).toBe(identities[0].address);
				expect(body.m.inv.comp[0].or.a).toBe(sharedEditorFolder.owner);
				expect(body.m.e).toStrictEqual([
					{
						a: sharedEditorFolder.owner,
						t: 'f'
					},
					{
						a: identity.email,
						p: mainAccount.fullName,
						t: 's'
					}
				]);
			});
			test('user send the message from an identity', () => {
				const userAccount = getMockedAccountItem({
					identity1: mainAccount,
					identity2: identity
				});

				shell.getUserAccount.mockImplementation(() => userAccount);

				const identities = getIdentityItems();

				const editor = generateEditor({
					context: {
						folders: {},
						dispatch: vi.fn(),
						calendar: sharedEditorFolder,
						sender: { email: identities[1].address ?? '', fullName: identities[1].fullName }
					}
				});
				const body = normalizeSoapMessageFromEditor(editor);
				expect(body.m.inv.comp[0].or.sentBy).toBe(identity.email);
				expect(body.m.inv.comp[0].or.a).toBe(sharedEditorFolder.owner);
				expect(body.m.e).toStrictEqual([
					{
						a: sharedEditorFolder.owner,
						t: 'f'
					},
					{
						a: identity.email,
						p: identity.fullName,
						t: 's'
					}
				]);
			});
		});
		describe('when the appointment is inside a calendar of a shared account', () => {
			test('user send the message from his main account', () => {
				const userAccount = getMockedAccountItem({
					identity1: mainAccount
				});

				shell.getUserAccount.mockImplementation(() => userAccount);

				const editor = generateEditor({
					context: {
						folders: {},
						dispatch: vi.fn(),
						calendar: sharedAccountEditorFolder
					}
				});
				const body = normalizeSoapMessageFromEditor(editor);
				expect(body.m.inv.comp[0].or.sentBy).toBe(mainAccount.email);
				expect(body.m.inv.comp[0].or.a).toBe(sharedAccountEditorFolder.owner);
				expect(body.m.e).toStrictEqual([
					{
						a: sharedAccountEditorFolder.owner,
						t: 'f'
					},
					{
						a: mainAccount.email,
						p: mainAccount.fullName,
						t: 's'
					}
				]);
			});
			test('user send the message from his main account using a custom email', () => {
				const userAccount = getMockedAccountItem({
					identity1: { ...mainAccount, _attrs: { [addressPrefKey]: identity.email } }
				});

				shell.getUserAccount.mockImplementation(() => userAccount);

				const identities = getIdentityItems();

				const editor = generateEditor({
					context: {
						folders: {},
						dispatch: vi.fn(),
						calendar: sharedAccountEditorFolder
					}
				});
				const body = normalizeSoapMessageFromEditor(editor);
				expect(body.m.inv.comp[0].or.sentBy).toBe(identities[0].address);
				expect(body.m.inv.comp[0].or.a).toBe(sharedAccountEditorFolder.owner);
				expect(body.m.e).toStrictEqual([
					{
						a: sharedAccountEditorFolder.owner,
						t: 'f'
					},
					{
						a: identity.email,
						p: mainAccount.fullName,
						t: 's'
					}
				]);
			});
			test('user send the message from an identity', () => {
				const userAccount = getMockedAccountItem({
					identity1: mainAccount,
					identity2: identity
				});

				shell.getUserAccount.mockImplementation(() => userAccount);

				const identities = getIdentityItems();

				const editor = generateEditor({
					context: {
						folders: {},
						dispatch: vi.fn(),
						calendar: sharedAccountEditorFolder,
						sender: { email: identities[1].address ?? '', fullName: identities[1].fullName }
					}
				});
				const body = normalizeSoapMessageFromEditor(editor);
				expect(body.m.inv.comp[0].or.sentBy).toBe(identities[1].address);
				expect(body.m.inv.comp[0].or.a).toBe(sharedAccountEditorFolder.owner);
				expect(body.m.e).toStrictEqual([
					{
						a: sharedAccountEditorFolder.owner,
						t: 'f'
					},
					{
						a: identities[1].address,
						p: identities[1].fullName,
						t: 's'
					}
				]);
			});
			test('user send the message from the shared account identity', () => {
				const userAccount = getMockedAccountItem({
					identity1: mainAccount,
					identity2: identity,
					identity3: sharedAccountIdentity
				});

				shell.getUserAccount.mockImplementation(() => userAccount);

				const identities = getIdentityItems();

				const editor = generateEditor({
					context: {
						folders: {},
						dispatch: vi.fn(),
						calendar: sharedAccountEditorFolder,
						sender: { email: identities[2].address ?? '', fullName: identities[2].fullName }
					}
				});
				const body = normalizeSoapMessageFromEditor(editor);
				expect(body.m.inv.comp[0].or.sentBy).toBeUndefined();
				expect(body.m.inv.comp[0].or.a).toBe(sharedAccountEditorFolder.owner);
				expect(body.m.e).toStrictEqual([
					{
						a: sharedAccountEditorFolder.owner,
						t: 'f'
					}
				]);
			});
		});
	});
	describe('setAlarmValue', () => {
		test('It will set a week value if possible', () => {
			const reminder = '20160';
			const result = setAlarmValue(reminder);
			expect(result).toStrictEqual(expect.objectContaining({ w: 2 }));
		});
		test('It will set a day value if possible', () => {
			const reminder = '2880';
			const result = setAlarmValue(reminder);
			expect(result).toStrictEqual(expect.objectContaining({ d: 2 }));
		});
		test('It will set a hour value if possible', () => {
			const reminder = '120';
			const result = setAlarmValue(reminder);
			expect(result).toStrictEqual(expect.objectContaining({ h: 2 }));
		});
		test('It will set a minute value if possible', () => {
			const reminder = '15';
			const result = setAlarmValue(reminder);
			expect(result).toStrictEqual(expect.objectContaining({ m: 15 }));
		});
		test('It will set 0 minutes when param is -1', () => {
			const reminder = '-1';
			const result = setAlarmValue(reminder);
			expect(result).toStrictEqual(expect.objectContaining({ m: 0 }));
		});
	});
	describe('generateBodyRequest', () => {
		test('should generate plain text message for regular meeting with attendees', () => {
			const userAccount = getMockedAccountItem({ identity1: mainAccount });
			shell.getUserAccount.mockImplementation(() => userAccount);

			const attendees = [
				generateAttendee({ email: 'attendee1@example.com' }),
				generateAttendee({ email: 'attendee2@example.com' })
			];

			const editor = generateEditor({
				context: {
					attendees,
					optionalAttendees: [],
					folders: {},
					dispatch: vi.fn(),
					title: 'Test Meeting',
					location: 'Conference Room',
					plainText: 'Meeting description',
					start: 1704110400000,
					end: 1704114000000,
					allDay: false
				}
			});

			const result = generateBodyRequest(editor);

			expect(result).toContain('invited you to a new meeting!');
			expect(result).toContain('Test Meeting');
			expect(result).toContain('attendee1@example.com, attendee2@example.com');
			expect(result).toContain('Meeting description');
		});

		test('should generate virtual room message when room is present', () => {
			const userAccount = getMockedAccountItem({ identity1: mainAccount });
			shell.getUserAccount.mockImplementation(() => userAccount);

			const attendees = [generateAttendee({ email: 'attendee1@example.com' })];

			const editor = generateEditor({
				context: {
					attendees,
					optionalAttendees: [],
					folders: {},
					dispatch: vi.fn(),
					room: {
						label: 'Virtual Room',
						link: 'https://meet.example.com/room123'
					},
					plainText: 'Virtual meeting description'
				}
			});

			const result = generateBodyRequest(editor);

			expect(result).toContain('invited you to a virtual meeting on Carbonio Chats!');
			expect(result).toContain('Virtual Room');
			expect(result).toContain("Join here when it's time");
			expect(result).toContain('https://meet.example.com/room123');
			expect(result).toContain('Virtual meeting description');
		});

		test('should return only plain text when no attendees', () => {
			const userAccount = getMockedAccountItem({ identity1: mainAccount });
			shell.getUserAccount.mockImplementation(() => userAccount);

			const editor = generateEditor({
				context: {
					attendees: [],
					optionalAttendees: [],
					folders: {},
					dispatch: vi.fn(),
					plainText: 'Just the description'
				}
			});

			const result = generateBodyRequest(editor);

			expect(result).toBe('Just the description');
			expect(result).not.toContain('invited you to');
		});

		test('should include optional attendees in the attendees list', () => {
			const userAccount = getMockedAccountItem({ identity1: mainAccount });
			shell.getUserAccount.mockImplementation(() => userAccount);

			const attendees = [generateAttendee({ email: 'required@example.com' })];
			const optionalAttendees = [generateAttendee({ email: 'optional@example.com' })];

			const editor = generateEditor({
				context: {
					attendees,
					optionalAttendees,
					folders: {},
					dispatch: vi.fn(),
					plainText: 'Meeting with optional attendees'
				}
			});

			const result = generateBodyRequest(editor);

			expect(result).toContain('required@example.com, optional@example.com');
		});

		test('should handle organizer from shared calendar', () => {
			const userAccount = getMockedAccountItem({ identity1: mainAccount });
			shell.getUserAccount.mockImplementation(() => userAccount);

			const attendees = [generateAttendee({ email: 'attendee@example.com' })];

			const editor = generateEditor({
				context: {
					attendees,
					optionalAttendees: [],
					folders: {},
					dispatch: vi.fn(),
					calendar: sharedEditorFolder,
					plainText: 'Shared calendar meeting'
				}
			});

			const result = generateBodyRequest(editor);

			expect(result).toContain('invited you to a new meeting!');
		});

		test('should handle undefined organizer name gracefully', () => {
			const userAccount = getMockedAccountItem({ identity1: mainAccount });
			shell.getUserAccount.mockImplementation(() => userAccount);

			const attendees = [generateAttendee({ email: 'attendee@example.com' })];

			const editor = generateEditor({
				context: {
					attendees,
					optionalAttendees: [],
					folders: {},
					dispatch: vi.fn(),
					organizer: { email: 'organizer@example.com', fullName: undefined },
					plainText: 'Meeting with undefined organizer name'
				}
			});

			const result = generateBodyRequest(editor);

			expect(result).toContain('invited you to a new meeting!');
		});

		test('should prefer virtual room message over meeting message when room exists', () => {
			const userAccount = getMockedAccountItem({ identity1: mainAccount });
			shell.getUserAccount.mockImplementation(() => userAccount);

			const attendees = [generateAttendee({ email: 'attendee@example.com' })];

			const editor = generateEditor({
				context: {
					attendees,
					optionalAttendees: [],
					folders: {},
					dispatch: vi.fn(),
					room: {
						label: 'Test Room',
						link: 'https://example.com/room'
					},
					plainText: 'Description'
				}
			});

			const result = generateBodyRequest(editor);

			expect(result).toContain('virtual meeting on Carbonio Chats!');
			expect(result).not.toContain('invited you to a new meeting!');
		});

		test('should handle empty room label', () => {
			const userAccount = getMockedAccountItem({ identity1: mainAccount });
			shell.getUserAccount.mockImplementation(() => userAccount);

			const attendees = [generateAttendee({ email: 'attendee@example.com' })];

			const editor = generateEditor({
				context: {
					attendees,
					optionalAttendees: [],
					folders: {},
					dispatch: vi.fn(),
					room: {
						label: '',
						link: 'https://example.com/room'
					},
					plainText: 'Description'
				}
			});

			const result = generateBodyRequest(editor);

			expect(result).toContain('invited you to a new meeting!');
			expect(result).not.toContain('virtual meeting on Carbonio Chats!');
		});
	});

	describe('generateHtmlBodyRequest', () => {
		test('should generate HTML message for regular meeting with attendees', () => {
			const userAccount = getMockedAccountItem({ identity1: mainAccount });
			shell.getUserAccount.mockImplementation(() => userAccount);

			const attendees = [
				generateAttendee({ email: 'attendee1@example.com' }),
				generateAttendee({ email: 'attendee2@example.com' })
			];

			const editor = generateEditor({
				context: {
					attendees,
					optionalAttendees: [],
					folders: {},
					dispatch: vi.fn(),
					title: 'Test Meeting',
					location: 'Conference Room',
					richText: '<b>Meeting description</b>',
					start: 1704110400000,
					end: 1704114000000,
					allDay: false
				}
			});

			const result = generateHtmlBodyRequest(editor);

			expect(result).toContain('<h3>');
			expect(result).toContain('invited you to a new meeting!');
			expect(result).toContain('Subject: Test Meeting');
			expect(result).toContain('Organizer:');
			expect(result).toContain('Location: Conference Room');
			expect(result).toContain('Invitees: attendee1@example.com, attendee2@example.com');
			expect(result).toContain('<b>Meeting description</b>');
			expect(result).toContain('<html>');
			expect(result).toContain('<p>');
			expect(result).toContain('</p>');
			expect(result).toContain('</html>');
			expect(result).toContain('Jan 1, 2024 10:00 AM - 11:00 AM');
		});

		test('should generate HTML message for virtual room', () => {
			const userAccount = getMockedAccountItem({ identity1: mainAccount });
			shell.getUserAccount.mockImplementation(() => userAccount);

			const attendees = [generateAttendee({ email: 'attendee1@example.com' })];

			const editor = generateEditor({
				context: {
					attendees,
					optionalAttendees: [],
					folders: {},
					dispatch: vi.fn(),
					room: {
						label: 'Virtual Room',
						link: 'https://meet.example.com/room123'
					},
					richText: '<i>Virtual meeting description</i>'
				}
			});

			const result = generateHtmlBodyRequest(editor);

			expect(result).toContain('invited you to a virtual meeting on Carbonio Chats.');
			expect(result).toContain('Virtual Room');
			expect(result).toContain('https://meet.example.com/room123');
			expect(result).toContain('<i>Virtual meeting description</i>');
			expect(result).toContain('<html>');
			expect(result).toContain('</html>');
		});

		test('should return only richText when no attendees', () => {
			const userAccount = getMockedAccountItem({ identity1: mainAccount });
			shell.getUserAccount.mockImplementation(() => userAccount);

			const editor = generateEditor({
				context: {
					attendees: [],
					optionalAttendees: [],
					folders: {},
					dispatch: vi.fn(),
					richText: '<p>Just the description</p>'
				}
			});

			const result = generateHtmlBodyRequest(editor);

			expect(result).toBe('<p>Just the description</p>');
		});

		test('should include optional attendees in the attendees list', () => {
			const userAccount = getMockedAccountItem({ identity1: mainAccount });
			shell.getUserAccount.mockImplementation(() => userAccount);

			const attendees = [generateAttendee({ email: 'required@example.com' })];
			const optionalAttendees = [generateAttendee({ email: 'optional@example.com' })];

			const editor = generateEditor({
				context: {
					attendees,
					optionalAttendees,
					folders: {},
					dispatch: vi.fn(),
					richText: '<p>Meeting with optional attendees</p>'
				}
			});

			const result = generateHtmlBodyRequest(editor);

			expect(result).toContain('required@example.com, optional@example.com');
			expect(result).toContain('<p>Meeting with optional attendees</p>');
		});
	});
});

type EditorAttendee = {
	email: string;
	fullName: string;
	id: string;
	label: string;
	ptst?: ParticipationStatus;
};

function generateAttendee({
	email,
	participantStatus
}: {
	email: string;
	participantStatus?: ParticipationStatus;
}): EditorAttendee {
	const attendee: EditorAttendee = {
		email,
		fullName: `fullname ${email}`,
		id: `id-${email}`,
		label: `label ${email}`
	};
	if (participantStatus) {
		attendee.ptst = participantStatus;
	}
	return attendee;
}
