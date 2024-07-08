import { writable } from "svelte/store";
import skio from "./socket";

export const socket = writable(skio.get());
