/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { normalizeSoapMessageFromEditor } from './normalize-soap-message-from-editor';
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
	id: 'shared:id',
	name: 'shared account',
	owner: 'random_shared_owner@mail.com'
};

describe('normalize soap message from editor', () => {
	describe('when the user is the organizer ', () => {
		describe('and the appointment is inside his calendar ', () => {
			describe('and he is not using identities ', () => {
				test('there wont be a sentBy parameter', () => {
					const userAccount = getMockedAccountItem({ identity1: mainAccount, identity2: identity });

					shell.getUserAccount.mockImplementation(() => userAccount);

					const editor = generateEditor({
						context: {
							folders: [],
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
						_attrs: { zimbraPrefFromAddress: identity.email }
					};
					const userAccount = getMockedAccountItem({
						identity1: customIdentity,
						identity2: identity
					});

					shell.getUserAccount.mockImplementation(() => userAccount);

					const editor = generateEditor({
						context: {
							folders: [],
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
						const userAccount = getMockedAccountItem({
							identity1: mainAccount,
							identity2: identity
						});

						shell.getUserAccount.mockImplementation(() => userAccount);

						const identities = getIdentityItems();

						const editor = generateEditor({
							context: {
								folders: [],
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
					test('user send the message using preferred email, there will be a sentBy', () => {
						const userAccount = getMockedAccountItem({
							identity1: mainAccount,
							identity2: { ...identity, _attrs: { zimbraPrefFromAddress: identity2.email } },
							identity3: identity2
						});

						shell.getUserAccount.mockImplementation(() => userAccount);

						const identities = getIdentityItems();

						const editor = generateEditor({
							context: {
								folders: [],
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
								fullName: undefined,
								_attrs: { zimbraPrefFromAddress: mainAccount.email }
							}
						});

						shell.getUserAccount.mockImplementation(() => userAccount);

						const identities = getIdentityItems();

						const editor = generateEditor({
							context: {
								folders: [],
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
								t: 'f'
							}
						]);
					});
					test('if fullName is available there will be a d parameter', () => {
						const userAccount = getMockedAccountItem({
							identity1: mainAccount,
							identity2: {
								...identity,
								_attrs: { zimbraPrefFromAddress: mainAccount.email }
							}
						});

						shell.getUserAccount.mockImplementation(() => userAccount);

						const identities = getIdentityItems();

						const editor = generateEditor({
							context: {
								folders: [],
								dispatch: jest.fn(),
								calendar: mainAccountEditorFolder,
								sender: identities[1]
							}
						});
						const body = normalizeSoapMessageFromEditor(editor);
						expect(body.m.inv.comp[0].or.d).toBe(identity.fullName);
						expect(body.m.inv.comp[0].or.a).toBe(mainAccount.email);
						expect(body.m.inv.comp[0].or.sentBy).toBeUndefined();
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
							folders: [],
							dispatch: jest.fn(),
							calendar: sharedEditorFolder
						}
					});
					const body = normalizeSoapMessageFromEditor(editor);
					expect(body.m.inv.comp[0].or.sentBy).toBe(mainAccount.email);
					expect(body.m.inv.comp[0].or.a).toBe(sharedEditorFolder.owner);
				});
				test('and the user send the message using a custom zimbraPrefFromAddress email - there will be a sentBy parameter', () => {
					const userAccount = getMockedAccountItem({
						identity1: { ...mainAccount, _attrs: { zimbraPrefFromAddress: identity.email } },
						identity2: identity
					});

					shell.getUserAccount.mockImplementation(() => userAccount);

					const editor = generateEditor({
						context: {
							folders: [],
							dispatch: jest.fn(),
							calendar: sharedEditorFolder
						}
					});
					const body = normalizeSoapMessageFromEditor(editor);
					expect(body.m.inv.comp[0].or.sentBy).toBe(identity.email);
					expect(body.m.inv.comp[0].or.a).toBe(sharedEditorFolder.owner);
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
								folders: [],
								dispatch: jest.fn(),
								calendar: sharedEditorFolder,
								sender: identities[1]
							}
						});
						const body = normalizeSoapMessageFromEditor(editor);
						expect(body.m.inv.comp[0].or.a).toBe(sharedEditorFolder.owner);
						expect(body.m.inv.comp[0].or.sentBy).toBe(identities[1].address);
					});
					test('and the user send the message using a custom zimbraPrefFromAddress email, there will be a sent parameter', () => {
						const userAccount = getMockedAccountItem({
							identity1: mainAccount,
							identity2: { ...identity, _attrs: { zimbraPrefFromAddress: identity2.email } },
							identity3: identity2
						});

						shell.getUserAccount.mockImplementation(() => userAccount);

						const identities = getIdentityItems();

						const editor = generateEditor({
							context: {
								folders: [],
								dispatch: jest.fn(),
								calendar: sharedEditorFolder,
								sender: identities[1]
							}
						});
						const body = normalizeSoapMessageFromEditor(editor);
						expect(body.m.inv.comp[0].or.a).toBe(sharedEditorFolder.owner);
						expect(body.m.inv.comp[0].or.sentBy).toBe(identities[2].address);
					});
				});
				test('with the same email as the main account, there will be a sentBy parameter', () => {
					const userAccount = getMockedAccountItem({
						identity1: mainAccount,
						identity2: {
							...identity,
							_attrs: { zimbraPrefFromAddress: mainAccount.email }
						}
					});

					shell.getUserAccount.mockImplementation(() => userAccount);

					const identities = getIdentityItems();

					const editor = generateEditor({
						context: {
							folders: [],
							dispatch: jest.fn(),
							calendar: sharedEditorFolder,
							sender: identities[1]
						}
					});
					const body = normalizeSoapMessageFromEditor(editor);
					expect(body.m.inv.comp[0].or.d).toBeUndefined();
					expect(body.m.inv.comp[0].or.a).toBe(sharedEditorFolder.owner);
					expect(body.m.inv.comp[0].or.sentBy).toBe(mainAccount.email);
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
						folders: [],
						dispatch: jest.fn(),
						calendar: sharedEditorFolder,
						sender: identities[0]
					}
				});
				const body = normalizeSoapMessageFromEditor(editor);
				expect(body.m.inv.comp[0].or.sentBy).toBe(mainAccount.email);
				expect(body.m.inv.comp[0].or.a).toBe(sharedEditorFolder.owner);
			});
			test('user send the message from his main account using a custom zimbraPrefFromAddress email', () => {
				const userAccount = getMockedAccountItem({
					identity1: { ...mainAccount, _attrs: { zimbraPrefFromAddress: identity.email } },
					identity2: identity
				});

				shell.getUserAccount.mockImplementation(() => userAccount);

				const identities = getIdentityItems();

				const editor = generateEditor({
					context: {
						folders: [],
						dispatch: jest.fn(),
						calendar: sharedEditorFolder,
						sender: identities[0]
					}
				});
				const body = normalizeSoapMessageFromEditor(editor);
				expect(body.m.inv.comp[0].or.sentBy).toBe(identities[0].address);
				expect(body.m.inv.comp[0].or.a).toBe(sharedEditorFolder.owner);
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
						folders: [],
						dispatch: jest.fn(),
						calendar: sharedEditorFolder,
						sender: identities[1]
					}
				});
				const body = normalizeSoapMessageFromEditor(editor);
				expect(body.m.inv.comp[0].or.sentBy).toBe(identity.email);
				expect(body.m.inv.comp[0].or.a).toBe(sharedEditorFolder.owner);
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
						folders: [],
						dispatch: jest.fn(),
						calendar: sharedAccountEditorFolder
					}
				});
				const body = normalizeSoapMessageFromEditor(editor);
				expect(body.m.inv.comp[0].or.sentBy).toBe(mainAccount.email);
				expect(body.m.inv.comp[0].or.a).toBe(sharedAccountEditorFolder.owner);
			});
			test('user send the message from his main account using a custom zimbraPrefFromAddress email', () => {
				const userAccount = getMockedAccountItem({
					identity1: { ...mainAccount, _attrs: { zimbraPrefFromAddress: identity.email } }
				});

				shell.getUserAccount.mockImplementation(() => userAccount);

				const identities = getIdentityItems();

				const editor = generateEditor({
					context: {
						folders: [],
						dispatch: jest.fn(),
						calendar: sharedAccountEditorFolder
					}
				});
				const body = normalizeSoapMessageFromEditor(editor);
				expect(body.m.inv.comp[0].or.sentBy).toBe(identities[0].address);
				expect(body.m.inv.comp[0].or.a).toBe(sharedAccountEditorFolder.owner);
			});
			test('user send the message from from an identity', () => {
				const userAccount = getMockedAccountItem({
					identity1: mainAccount,
					identity2: identity
				});

				shell.getUserAccount.mockImplementation(() => userAccount);

				const identities = getIdentityItems();

				const editor = generateEditor({
					context: {
						folders: [],
						dispatch: jest.fn(),
						calendar: sharedAccountEditorFolder,
						sender: identities[1]
					}
				});
				const body = normalizeSoapMessageFromEditor(editor);
				expect(body.m.inv.comp[0].or.sentBy).toBe(identities[1].address);
				expect(body.m.inv.comp[0].or.a).toBe(sharedAccountEditorFolder.owner);
			});
		});
	});
});
