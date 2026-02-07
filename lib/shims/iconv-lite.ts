export function decode(input: Uint8Array | Buffer, _encoding: string = "utf8") {
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(input)) {
    return input.toString("utf8");
  }
  return new TextDecoder("utf-8").decode(input);
}

export function encode(input: string, _encoding: string = "utf8") {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(input, "utf8");
  }
  return new TextEncoder().encode(input);
}

const iconvLite = {
  decode,
  encode
};

export default iconvLite;
