/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { EventSummaryView } from '../event-summary-view';
import { setupTest, screen } from '@test-setup';
import mockedData from 'test/generators';

const EVENT_ID = 'event-1';
const event = mockedData.getEvent({ id: EVENT_ID });

vi.mock('../../../hooks/use-invite', () => ({
	useInvite: (): undefined => undefined
}));

vi.mock('../../../store/zustand/hooks', () => ({
	useSummaryView: (): string => EVENT_ID
}));

vi.mock('../../../hooks/use-never-sent-warning-label', () => ({
	useNeverSentWarningLabel: (): string => ''
}));

vi.mock('../actions-buttons-row', () => ({
	ActionsButtonsRow: ({ onClose }: { onClose: () => void }): React.ReactElement => (
		<button onClick={onClose} data-testid="close-action-btn">
			Close
		</button>
	)
}));

describe('EventSummaryView - close behavior', () => {
	it('calls onClose when the component unmounts', () => {
		const onClose = vi.fn();
		const { unmount } = setupTest(<EventSummaryView events={[event]} onClose={onClose} />);

		expect(onClose).not.toHaveBeenCalled();

		unmount();

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('does not call onClose on initial render', () => {
		const onClose = vi.fn();

		setupTest(<EventSummaryView events={[event]} onClose={onClose} />);

		expect(onClose).not.toHaveBeenCalled();
	});

	it('passes onClose down to ActionsButtonsRow', async () => {
		const onClose = vi.fn();
		const { user } = setupTest(<EventSummaryView events={[event]} onClose={onClose} />);

		await user.click(screen.getByTestId('close-action-btn'));

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('does not render and does not call onClose when no matching event is found', () => {
		const onClose = vi.fn();
		const { container } = setupTest(<EventSummaryView events={[]} onClose={onClose} />);

		expect(container).toBeEmptyDOMElement();
		expect(onClose).not.toHaveBeenCalled();
	});
});
