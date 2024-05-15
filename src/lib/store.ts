import { writable } from 'svelte/store';

export const selectedMethodName = writable('');
export const brushIntervalsStore = writable<BrushInterval[]>([]);

export type BrushInterval = {
    min: number | undefined;
    max: number | undefined;
};
