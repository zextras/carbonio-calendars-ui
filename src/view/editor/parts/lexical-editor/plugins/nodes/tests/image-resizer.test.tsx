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

type Size = { width: number; height: number };
type Pointer = { clientX: number; clientY: number };

/** A 2:1 image, rendered at its natural size unless a test says otherwise. */
const START_SIZE: Size = { width: 200, height: 100 };
/** Size of the 2:1 image once dragged to 300px of width. */
const RESIZED: Size = { width: 300, height: 150 };

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

/**
 * jsdom has no layout and loads no image: gives the image a natural size and the
 * size it is rendered with.
 */
function mockImageGeometry(natural: Size, rendered: Size): void {
	vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(natural.width);
	vi.spyOn(HTMLImageElement.prototype, 'naturalHeight', 'get').mockReturnValue(natural.height);
	vi.spyOn(HTMLImageElement.prototype, 'getBoundingClientRect').mockReturnValue(
		rendered as DOMRect
	);
}

function setup({
	withImage = true,
	natural = START_SIZE,
	rendered = natural
}: {
	withImage?: boolean;
	natural?: Size;
	rendered?: Size;
} = {}): {
	onResizeStart: ReturnType<typeof vi.fn>;
	onResizeEnd: ReturnType<typeof vi.fn>;
	unmount: () => void;
} {
	mockImageGeometry(natural, rendered);
	const onResizeStart = vi.fn();
	const onResizeEnd = vi.fn();
	const { unmount } = setupTest(
		<Harness withImage={withImage} onResizeStart={onResizeStart} onResizeEnd={onResizeEnd} />
	);
	return { onResizeStart, onResizeEnd, unmount };
}

/** Drags the `direction` handle from the origin to `to` and releases it there. */
function drag(direction: string, to: Pointer): void {
	fireEvent.mouseDown(screen.getByTestId(`image-resizer-${direction}`), {
		clientX: 0,
		clientY: 0
	});
	fireEvent.mouseMove(document, to);
	fireEvent.mouseUp(document, to);
}

describe('ImageResizer', () => {
	it('renders a handle for every direction', () => {
		setup();

		['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].forEach((direction) => {
			expect(screen.getByTestId(`image-resizer-${direction}`)).toBeInTheDocument();
		});
	});

	// Side handles drive their own axis; corner handles follow the axis moved the most
	it.each([
		{ direction: 'e', to: { clientX: 100, clientY: 70 } },
		{ direction: 'w', to: { clientX: -100, clientY: 70 } },
		{ direction: 's', to: { clientX: 70, clientY: 50 } },
		{ direction: 'n', to: { clientX: 70, clientY: -50 } },
		{ direction: 'se', to: { clientX: 100, clientY: 10 } },
		{ direction: 'nw', to: { clientX: -100, clientY: -5 } },
		{ direction: 'ne', to: { clientX: 100, clientY: -5 } },
		{ direction: 'sw', to: { clientX: -5, clientY: 50 } }
	])('keeps the aspect ratio when dragging the $direction handle', ({ direction, to }) => {
		const { onResizeEnd } = setup();

		drag(direction, to);

		expect(onResizeEnd).toHaveBeenCalledWith(RESIZED.width, RESIZED.height);
	});

	it('previews the size while dragging and commits it only on release', () => {
		const { onResizeStart, onResizeEnd } = setup();
		const image = screen.getByRole('img');

		fireEvent.mouseDown(screen.getByTestId('image-resizer-e'), { clientX: 0, clientY: 0 });
		expect(onResizeStart).toHaveBeenCalledTimes(1);

		fireEvent.mouseMove(document, { clientX: 100, clientY: 0 });
		// The height follows the ratio, so a container narrower than the image can't distort it
		expect(image).toHaveStyle({ width: `${RESIZED.width}px`, height: 'auto' });
		// eslint-disable-next-line jest-dom/prefer-to-have-style -- jsdom's CSS parser drops aspect-ratio, so toHaveStyle can't see it
		expect(image.style.aspectRatio).toBe(`${RESIZED.width} / ${RESIZED.height}`);
		expect(onResizeEnd).not.toHaveBeenCalled();

		fireEvent.mouseUp(document, { clientX: 100, clientY: 0 });
		expect(onResizeEnd).toHaveBeenCalledWith(RESIZED.width, RESIZED.height);
	});

	it.each<[string, Size, Size]>([
		['the natural ratio over the rendered one', START_SIZE, { width: 200, height: 200 }],
		['the rendered ratio while the image is not loaded', { width: 0, height: 0 }, START_SIZE]
	])('keeps %s', (_, natural, rendered) => {
		const { onResizeEnd } = setup({ natural, rendered });

		drag('e', { clientX: 100, clientY: 0 });

		expect(onResizeEnd).toHaveBeenCalledWith(RESIZED.width, RESIZED.height);
	});

	it('resizes freely when the size of the image cannot be read', () => {
		const { onResizeEnd } = setup({
			natural: { width: 0, height: 0 },
			rendered: { width: 0, height: 0 }
		});

		drag('se', { clientX: 120, clientY: 80 });

		expect(onResizeEnd).toHaveBeenCalledWith(120, 80);
	});

	it.each([
		{ shape: 'wide', size: { width: 200, height: 100 }, expected: { width: 80, height: 40 } },
		{ shape: 'tall', size: { width: 100, height: 200 }, expected: { width: 40, height: 80 } }
	])(
		'stops shrinking a $shape image when its smaller side reaches 40px, keeping the ratio',
		({ size, expected }) => {
			const { onResizeEnd } = setup({ natural: size });

			drag('se', { clientX: -500, clientY: -500 });

			expect(onResizeEnd).toHaveBeenCalledWith(expected.width, expected.height);
		}
	);

	it('does not enlarge an image already thinner than the minimum to reach it', () => {
		// A 600x10 divider: reaching 40px of height would make it 2400px wide
		const { onResizeEnd } = setup({ natural: { width: 600, height: 10 } });

		drag('e', { clientX: -300, clientY: 0 });

		expect(onResizeEnd).toHaveBeenCalledWith(600, 10);
	});

	it('stops following the pointer once the drag is released', () => {
		setup();
		const image = screen.getByRole('img');

		fireEvent.mouseDown(screen.getByTestId('image-resizer-e'), { clientX: 0, clientY: 0 });
		fireEvent.mouseUp(document, { clientX: 20, clientY: 0 });
		fireEvent.mouseMove(document, { clientX: 200, clientY: 0 });

		expect(image).not.toHaveStyle({ width: '400px' });
	});

	it('stops listening to the pointer when the handles are removed mid-drag', () => {
		const { onResizeEnd, unmount } = setup();
		const addListener = vi.spyOn(document, 'addEventListener');
		const removeListener = vi.spyOn(document, 'removeEventListener');

		fireEvent.mouseDown(screen.getByTestId('image-resizer-se'), { clientX: 0, clientY: 0 });
		const dragListeners = addListener.mock.calls.filter(
			([type]) => type === 'mousemove' || type === 'mouseup'
		);
		expect(dragListeners).toHaveLength(2);

		unmount();
		fireEvent.mouseUp(document, { clientX: 100, clientY: 0 });

		dragListeners.forEach(([type, listener]) => {
			expect(removeListener).toHaveBeenCalledWith(type, listener);
		});
		expect(onResizeEnd).not.toHaveBeenCalled();
	});

	it('does not start a resize when there is no image to measure', () => {
		const { onResizeStart, onResizeEnd } = setup({ withImage: false });

		drag('se', { clientX: 20, clientY: 10 });

		expect(onResizeStart).not.toHaveBeenCalled();
		expect(onResizeEnd).not.toHaveBeenCalled();
	});
});
