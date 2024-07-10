/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	normalizeSoapMessageFromEditor,
	setAlarmValue
} from './normalize-soap-message-from-editor';
import * as shell from '../../__mocks__/@zextras/carbonio-shell-ui';
import {
	createFakeIdentity,
	getMockedAccountItem
} from '../carbonio-ui-commons/test/mocks/accounts/fakeAccounts';
import { generateEditor } from '../commons/editor-generator';
import { getIdentityItems } from '../commons/get-identity-items';

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

describe('normalize soap message from editor', () => {
	describe('when the user is the organizer ', () => {
		describe('and the appointment is inside his calendar ', () => {
			describe('and he is not using identities ', () => {
				test('there wont be a sentBy parameter', () => {
					const userAccount = getMockedAccountItem({ identity1: mainAccount, identity2: identity });

					shell.getUserAccount.mockImplementation(() => userAccount);

					const editor = generateEditor({
						context: {
							folders: {},
							dispatch: jest.fn(),
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
							dispatch: jest.fn(),
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
								dispatch: jest.fn(),
								calendar: mainAccountEditorFolder,
								sender: identities[1]
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
								dispatch: jest.fn(),
								calendar: mainAccountEditorFolder,
								sender: identities[1]
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
								dispatch: jest.fn(),
								calendar: mainAccountEditorFolder,
								sender: identities[1]
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
								dispatch: jest.fn(),
								calendar: mainAccountEditorFolder,
								sender: identities[1]
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
							dispatch: jest.fn(),
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
							dispatch: jest.fn(),
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
								dispatch: jest.fn(),
								calendar: sharedEditorFolder,
								sender: identities[1]
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
								dispatch: jest.fn(),
								calendar: sharedEditorFolder,
								sender: identities[1]
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
							dispatch: jest.fn(),
							calendar: sharedEditorFolder,
							sender: identities[1]
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
						dispatch: jest.fn(),
						calendar: sharedEditorFolder,
						sender: identities[0]
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
						dispatch: jest.fn(),
						calendar: sharedEditorFolder,
						sender: identities[0]
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
						dispatch: jest.fn(),
						calendar: sharedEditorFolder,
						sender: identities[1]
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
						dispatch: jest.fn(),
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
						dispatch: jest.fn(),
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
						dispatch: jest.fn(),
						calendar: sharedAccountEditorFolder,
						sender: identities[1]
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
						dispatch: jest.fn(),
						calendar: sharedAccountEditorFolder,
						sender: identities[2]
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
});
