import { W as WebAssemblyInstantiator } from './chunk-index.mjs';

declare const wasmBinary: ArrayBuffer;
declare const getWasmInstance: WebAssemblyInstantiator;

export { getWasmInstance as default, getWasmInstance, wasmBinary };
