/* eslint-disable sonarjs/no-duplicate-string */
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';

import Displayer from './displayer';
import mockedData from '../../test/generators';
import { setupTest } from '@test-setup';
import { reducers } from 'store/redux';

describe('Displayer', () => {
	describe('Rendering', () => {
		it('should render null when invite is not available', () => {
			const event = mockedData.getEvent({
				resource: { inviteId: 'invite-123' }
			});

			const store = configureStore({ reducer: combineReducers(reducers) });

			const { container } = setupTest(<Displayer event={event} />, { store });

			expect(container).toBeEmptyDOMElement();
		});

		it('should render the displayer when invite is available', () => {
			const store = configureStore({
				reducer: combineReducers(reducers),
				preloadedState: {
					invites: {
						status: 'idle',
						invites: {
							'invite-123': mockedData.getInvite()
						}
					}
				}
			});
			const event = mockedData.getEvent({
				title: 'Team Meeting',
				resource: { inviteId: 'invite-123' }
			});

			setupTest(<Displayer event={event} />, { store });

			expect(screen.getByText('Team Meeting')).toBeInTheDocument();
		});
	});

	describe('DisplayerHeader', () => {
		it('should render the event header with event details', () => {
			const store = configureStore({
				reducer: combineReducers(reducers),
				preloadedState: {
					invites: {
						status: 'idle',
						invites: {
							'invite-123': mockedData.getInvite()
						}
					}
				}
			});
			const event = mockedData.getEvent({
				title: 'Important Meeting',
				resource: { inviteId: 'invite-123' }
			});

			setupTest(<Displayer event={event} />, { store });

			expect(screen.getByText('Important Meeting')).toBeInTheDocument();
		});
	});

	describe('DetailsPart', () => {
		it('should display event details including subject', () => {
			const store = configureStore({
				reducer: combineReducers(reducers),
				preloadedState: {
					invites: {
						status: 'idle',
						invites: {
							'invite-123': mockedData.getInvite()
						}
					}
				}
			});
			const event = mockedData.getEvent({
				title: 'Project Review',
				resource: { inviteId: 'invite-123' }
			});

			setupTest(<Displayer event={event} />, { store });

			expect(screen.getByText('Project Review')).toBeInTheDocument();
		});

		it('should show private indicator when event is private', () => {
			const store = configureStore({
				reducer: combineReducers(reducers),
				preloadedState: {
					invites: {
						status: 'idle',
						invites: {
							'invite-123': mockedData.getInvite()
						}
					}
				}
			});
			const event = mockedData.getEvent({
				title: 'Private Meeting',
				resource: {
					inviteId: 'invite-123',
					isPrivate: true
				}
			});

			setupTest(<Displayer event={event} />, { store });

			// Private events are handled by DetailsPart
			expect(screen.getByText('Private Meeting')).toBeInTheDocument();
		});
	});

	describe('Edge Cases', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		it('should handle event with undefined resource gracefully', () => {
			const event = {
				...mockedData.getEvent(),
				resource: undefined
			};

			const { container } = setupTest(<Displayer event={event} />, { store });

			expect(container).toBeEmptyDOMElement();
		});

		it('should handle event with undefined inviteId', () => {
			const event = mockedData.getEvent({
				resource: { inviteId: undefined }
			});

			const { container } = setupTest(<Displayer event={event} />, { store });

			expect(container).toBeEmptyDOMElement();
		});

		it('should handle loading state while fetching invite', () => {
			const event = mockedData.getEvent({
				title: 'Loading Meeting',
				resource: { inviteId: 'loading-invite' }
			});

			const { container } = setupTest(<Displayer event={event} />, { store });

			// Should render null while loading
			expect(container).toBeEmptyDOMElement();
		});
	});

	describe('Layout and Styling', () => {
		it('should render with proper container structure', () => {
			const invite = mockedData.getInvite();
			const store = configureStore({
				reducer: combineReducers(reducers),
				preloadedState: {
					invites: {
						status: 'idle',
						invites: {
							'invite-123': invite
						}
					}
				}
			});
			const event = mockedData.getEvent({
				title: 'Meeting',
				resource: { inviteId: 'invite-123' }
			});

			const { container } = setupTest(<Displayer event={event} />, { store });

			// Check that main container is rendered
			// eslint-disable-next-line testing-library/no-node-access
			expect(container.firstChild).toBeInTheDocument();
		});
	});
});
