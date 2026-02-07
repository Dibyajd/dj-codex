declare module "iconv-lite" {
  export function decode(input: Uint8Array | Buffer, encoding?: string): string;
  export function encode(input: string, encoding?: string): Uint8Array | Buffer;
  const _default: {
    decode: typeof decode;
    encode: typeof encode;
  };
  export default _default;
}
