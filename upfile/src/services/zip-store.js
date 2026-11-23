import { normalizeRelativePath } from "../core/paths.js";

const encoder = new TextEncoder();
const crcTable = Uint32Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit++)
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});

export function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

export function archiveName(path, directory = false) {
  normalizeRelativePath(path);
  if (/^[a-z]:/i.test(path))
    throw new Error(`Không thể đưa đường dẫn ổ đĩa vào ZIP: ${path}`);
  const name = path + (directory ? "/" : "");
  if (encoder.encode(name).length > 65535)
    throw new Error("Tên file quá dài cho ZIP.");
  return name;
}

// Standard ZIP32, STORE method (no recompression), UTF-8 filenames and CRC32.
// Blob parts retain exact binary/empty-file bytes. Download limits avoid ZIP64.
export function createZip(entries, date = new Date()) {
  if (!entries.length || entries.length > 65535)
    throw new Error("Số mục trong ZIP không hợp lệ.");
  const names = new Set(),
    localParts = [],
    centralParts = [];
  const year = Math.max(1980, Math.min(2107, date.getFullYear()));
  const dosDate =
    ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  const dosTime =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    (date.getSeconds() >>> 1);
  let offset = 0,
    centralSize = 0;
  for (const entry of entries) {
    const directory = entry.directory === true;
    const name = archiveName(entry.path, directory),
      nameBytes = encoder.encode(name);
    if (names.has(entry.path))
      throw new Error(`Trùng đường dẫn trong ZIP: ${entry.path}`);
    names.add(entry.path);
    const data = entry.data || new Uint8Array();
    if (!(data instanceof Uint8Array) || (directory && data.length))
      throw new Error(`Dữ liệu ZIP không hợp lệ: ${name}`);
    if (
      data.length > 0xffffffff ||
      offset + 30 + nameBytes.length + data.length > 0xffffffff
    )
      throw new Error("ZIP vượt giới hạn ZIP32.");
    const mode = directory
      ? 0o40755
      : entry.mode === "100755"
        ? 0o100755
        : 0o100644;
    const crc = crc32(data);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true);
    local.setUint16(8, 0, true);
    local.setUint16(10, dosTime, true);
    local.setUint16(12, dosDate, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, data.length, true);
    local.setUint32(22, data.length, true);
    local.setUint16(26, nameBytes.length, true);
    localParts.push(local.buffer, nameBytes, data);
    const central = new DataView(new ArrayBuffer(46));
    central.setUint32(0, 0x02014b50, true);
    central.setUint16(4, (3 << 8) | 20, true);
    central.setUint16(6, 20, true);
    central.setUint16(8, 0x0800, true);
    central.setUint16(12, dosTime, true);
    central.setUint16(14, dosDate, true);
    central.setUint32(16, crc, true);
    central.setUint32(20, data.length, true);
    central.setUint32(24, data.length, true);
    central.setUint16(28, nameBytes.length, true);
    central.setUint32(38, ((mode << 16) | (directory ? 16 : 0)) >>> 0, true);
    central.setUint32(42, offset, true);
    centralParts.push(central.buffer, nameBytes);
    offset += 30 + nameBytes.length + data.length;
    centralSize += 46 + nameBytes.length;
  }
  if (offset + centralSize + 22 > 0xffffffff)
    throw new Error("ZIP vượt giới hạn ZIP32.");
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, entries.length, true);
  end.setUint16(10, entries.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);
  return new Blob([...localParts, ...centralParts, end.buffer], {
    type: "application/zip",
  });
}
