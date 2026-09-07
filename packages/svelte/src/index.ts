import type { Component } from 'svelte';
import HeelslideComponent from './Heelslide.svelte';
import type { HeelslideProps } from './types.js';

export const Heelslide: Component<HeelslideProps> =
  HeelslideComponent as unknown as Component<HeelslideProps>;
export default Heelslide;

export { createHeelslide } from './createHeelslide.svelte.js';
export type * from './types.js';
