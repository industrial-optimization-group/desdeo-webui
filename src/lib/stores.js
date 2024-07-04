import { writable } from "svelte/store";
import skio from "./socket.js";

export const socket = writable(skio.get());
