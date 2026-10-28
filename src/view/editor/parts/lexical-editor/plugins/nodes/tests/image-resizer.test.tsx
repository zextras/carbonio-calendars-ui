/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable testing-library/prefer-user-event -- simulating a pointer drag with explicit coordinates */
import React, { useRef } from 'react';

import { fireEvent } from '@testing-library/react';

import { setupTest, screen } from '@test-setup';

import { ImageResizer } from '../image-resizer';

const START_WIDTH = 100;
const START_HEIGHT = 50;

type HarnessProps = {
	withImage?: boolean;
	onResizeStart: () => void;
	onResizeEnd: (width: number, height: number) => void;
};

const Harness = ({
	withImage = true,
	onResizeStart,
	onResizeEnd
}: HarnessProps): React.JSX.Element => {
	const imageRef = useRef<HTMLImageElement>(null);
	return (
		<>
			{withImage && <img ref={imageRef} alt="resizable" />}
			<ImageResizer imageRef={imageRef} onResizeStart={onResizeStart} onResizeEnd={onResizeEnd} />
		</>
	);
};

function setup(withImage = true): {
	onResizeStart: ReturnType<typeof vi.fn>;
	onResizeEnd: ReturnType<typeof vi.fn>;
} {
	vi.spyOn(HTMLImageElement.prototype, 'getBoundingClientRect').mockReturnValue({
		width: START_WIDTH,
		height: START_HEIGHT
	} as DOMRect);
	const onResizeStart = vi.fn();
	const onResizeEnd = vi.fn();
	setupTest(
		<Harness withImage={withImage} onResizeStart={onResizeStart} onResizeEnd={onResizeEnd} />
	);
	return { onResizeStart, onResizeEnd };
}

describe('ImageResizer', () => {
	it('renders a handle for every direction', () => {
		setup();

		['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].forEach((direction) => {
			expect(screen.getByTestId(`image-resizer-${direction}`)).toBeInTheDocument();
		});
	});

	// Dragging by (+20, +10) from a 100x50 image.
	it.each([
		['nw', 80, 40],
		['n', 100, 40],
		['ne', 120, 40],
		['e', 120, 50],
		['se', 120, 60],
		['s', 100, 60],
		['sw', 80, 60],
		['w', 80, 50]
	])(
		'resizes from the %s handle, previewing live and committing on release',
		(direction, width, height) => {
			const { onResizeStart, onResizeEnd } = setup();
			const image = screen.getByRole('img');

			fireEvent.mouseDown(screen.getByTestId(`image-resizer-${direction}`), {
				clientX: 0,
				clientY: 0
			});
			expect(onResizeStart).toHaveBeenCalledTimes(1);

			fireEvent.mouseMove(document, { clientX: 20, clientY: 10 });
			expect(image).toHaveStyle({ width: `${width}px`, height: `${height}px` });
			expect(onResizeEnd).not.toHaveBeenCalled();

			fireEvent.mouseUp(document, { clientX: 20, clientY: 10 });
			expect(onResizeEnd).toHaveBeenCalledWith(width, height);
		}
	);

	it('never shrinks the image below the minimum size', () => {
		const { onResizeEnd } = setup();

		fireEvent.mouseDown(screen.getByTestId('image-resizer-w'), { clientX: 0, clientY: 0 });
		fireEvent.mouseUp(document, { clientX: 500, clientY: 0 });

		expect(onResizeEnd).toHaveBeenCalledWith(40, START_HEIGHT);
	});

	it('stops following the pointer once the drag is released', () => {
		setup();
		const image = screen.getByRole('img');

		fireEvent.mouseDown(screen.getByTestId('image-resizer-e'), { clientX: 0, clientY: 0 });
		fireEvent.mouseUp(document, { clientX: 20, clientY: 0 });
		fireEvent.mouseMove(document, { clientX: 200, clientY: 0 });

		expect(image).not.toHaveStyle({ width: '300px' });
	});

	it('does not start a resize when there is no image to measure', () => {
		const { onResizeStart, onResizeEnd } = setup(false);

		fireEvent.mouseDown(screen.getByTestId('image-resizer-se'), { clientX: 0, clientY: 0 });
		fireEvent.mouseMove(document, { clientX: 20, clientY: 10 });
		fireEvent.mouseUp(document, { clientX: 20, clientY: 10 });

		expect(onResizeStart).not.toHaveBeenCalled();
		expect(onResizeEnd).not.toHaveBeenCalled();
	});
});
