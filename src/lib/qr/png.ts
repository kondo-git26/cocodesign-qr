/**
 * 最小構成の PNG エンコーダ（8bit グレースケール・無圧縮 zlib）。
 *
 * 「変換前」のビジュアルで、粗い支給画像そのものを再現するために使います。
 * canvas が使えないビルド時（サーバー側）でも動くよう、依存なしで実装しています。
 * 画像が小さいため無圧縮でも数 KB に収まります。
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function adler32(bytes: Uint8Array): number {
  let a = 1;
  let b = 0;
  for (let i = 0; i < bytes.length; i += 1) {
    a = (a + bytes[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function uint32be(value: number): Uint8Array {
  return new Uint8Array([(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff]);
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new Uint8Array(4);
  for (let i = 0; i < 4; i += 1) typeBytes[i] = type.charCodeAt(i);
  const body = concat([typeBytes, data]);
  return concat([uint32be(data.length), body, uint32be(crc32(body))]);
}

/** zlib ストリーム（非圧縮ブロックのみ） */
function zlibStore(data: Uint8Array): Uint8Array {
  const parts: Uint8Array[] = [new Uint8Array([0x78, 0x01])];
  const MAX = 0xffff;
  for (let offset = 0; offset < data.length || offset === 0; offset += MAX) {
    const slice = data.subarray(offset, Math.min(offset + MAX, data.length));
    const isLast = offset + MAX >= data.length ? 1 : 0;
    const len = slice.length;
    parts.push(
      new Uint8Array([isLast, len & 0xff, (len >>> 8) & 0xff, ~len & 0xff, (~len >>> 8) & 0xff]),
    );
    parts.push(slice);
    if (isLast) break;
  }
  parts.push(uint32be(adler32(data)));
  return concat(parts);
}

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function toBase64(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += BASE64_CHARS[b0 >> 2];
    out += BASE64_CHARS[((b0 & 0x03) << 4) | ((b1 ?? 0) >> 4)];
    out += i + 1 < bytes.length ? BASE64_CHARS[(((b1 ?? 0) & 0x0f) << 2) | ((b2 ?? 0) >> 6)] : '=';
    out += i + 2 < bytes.length ? BASE64_CHARS[(b2 ?? 0) & 0x3f] : '=';
  }
  return out;
}

/**
 * 8bit グレースケールの PNG を data URI として返します。
 * @param gray 長さ width * height の輝度値（0 = 黒、255 = 白）
 */
export function grayscalePngDataUri(gray: Uint8Array, width: number, height: number): string {
  const raw = new Uint8Array((width + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (width + 1)] = 0; // フィルタ種別: None
    raw.set(gray.subarray(y * width, (y + 1) * width), y * (width + 1) + 1);
  }

  const ihdr = concat([
    uint32be(width),
    uint32be(height),
    new Uint8Array([8, 0, 0, 0, 0]), // 8bit / グレースケール / deflate / 標準フィルタ / 非インターレース
  ]);

  const png = concat([
    new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlibStore(raw)),
    chunk('IEND', new Uint8Array(0)),
  ]);

  return `data:image/png;base64,${toBase64(png)}`;
}
