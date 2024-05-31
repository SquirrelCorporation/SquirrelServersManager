const getWasmInlined = async (info) => {
  return import('shiki/wasm').then((wasm) => wasm.default(info));
};

export { getWasmInlined as g };
