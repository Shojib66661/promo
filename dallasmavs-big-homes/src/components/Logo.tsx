import React from 'react';
import {Img, staticFile} from 'remotion';

/**
 * Dallas Mavericks | Infinite Roofing lockup, taken from the client's own end card
 * (source frame 1555, upscaled 3x). Their site was not reachable from the sandbox.
 * The image has a white background, so always place it on a white card.
 */
export const Lockup: React.FC<{width: number}> = ({width}) => (
	<Img src={staticFile('img/lockup.png')} style={{width, height: width * (576 / 1338), display: 'block'}} />
);
