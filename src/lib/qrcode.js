/**
 * Minimal QR Code generator - no dependencies.
 * Supports byte mode, error correction level M, versions 1-10.
 * Returns a 2D boolean matrix (true = dark module).
 */

// --- Galois Field GF(256) arithmetic for Reed-Solomon ---
const EXP = new Uint8Array(256);
const LOG = new Uint8Array(256);
(() => {
  let v = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = v;
    LOG[v] = i;
    v = (v << 1) ^ (v >= 128 ? 0x11d : 0);
  }
  EXP[255] = EXP[0];
})();

function gfMul(a, b) {
  if (a === 0 || b === 0) return 0;
  return EXP[(LOG[a] + LOG[b]) % 255];
}

function rsGenPoly(n) {
  let poly = [1];
  for (let i = 0; i < n; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], EXP[i]);
    }
    poly = next;
  }
  return poly;
}

function rsEncode(data, ecLen) {
  const gen = rsGenPoly(ecLen);
  const result = new Array(ecLen).fill(0);
  for (let i = 0; i < data.length; i++) {
    const coef = data[i] ^ result[0];
    result.shift();
    result.push(0);
    for (let j = 0; j < gen.length - 1; j++) {
      result[j] ^= gfMul(gen[j + 1], coef);
    }
  }
  return result;
}

// --- QR version/capacity tables (byte mode, EC level M) ---
// [totalCodewords, ecCodewordsPerBlock, numBlocks1, dataPerBlock1, numBlocks2, dataPerBlock2]
const VERSION_TABLE = [
  null, // index 0 unused
  [26, 10, 1, 16, 0, 0],      // v1
  [44, 16, 1, 28, 0, 0],      // v2
  [70, 26, 1, 44, 0, 0],      // v3
  [100, 18, 2, 32, 0, 0],     // v4
  [134, 24, 2, 43, 0, 0],     // v5
  [172, 16, 4, 27, 0, 0],     // v6
  [196, 18, 4, 31, 0, 0],     // v7
  [242, 22, 2, 38, 2, 39],    // v8
  [292, 22, 3, 36, 2, 37],    // v9
  [346, 26, 4, 43, 1, 44],    // v10
];

// Alignment pattern positions per version
const ALIGN_POS = [
  null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
  [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
];

function getVersion(dataLen) {
  for (let v = 1; v <= 10; v++) {
    const t = VERSION_TABLE[v];
    const capacity = t[2] * t[3] + t[4] * t[5];
    if (dataLen <= capacity) return v;
  }
  throw new Error('Data too long for QR versions 1-10');
}

// --- Module placement ---
function makeMatrix(version) {
  const size = version * 4 + 17;
  const matrix = Array.from({ length: size }, () => new Uint8Array(size));
  const reserved = Array.from({ length: size }, () => new Uint8Array(size));
  return { matrix, reserved, size };
}

function setModule(m, r, row, col, val) {
  m[row][col] = val ? 1 : 0;
  r[row][col] = 1;
}

function placeFinderPattern(m, r, row, col) {
  for (let dr = -1; dr <= 7; dr++) {
    for (let dc = -1; dc <= 7; dc++) {
      const rr = row + dr, cc = col + dc;
      if (rr < 0 || rr >= m.length || cc < 0 || cc >= m.length) continue;
      const inOuter = dr === -1 || dr === 7 || dc === -1 || dc === 7;
      const inBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
      const inInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
      const val = !inOuter && (inBorder || inInner);
      setModule(m, r, rr, cc, val);
    }
  }
}

function placeAlignmentPattern(m, r, row, col) {
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      const val = Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
      setModule(m, r, row + dr, col + dc, val);
    }
  }
}

function placePatterns(qr, version) {
  const { matrix: m, reserved: r, size: s } = qr;

  // Finder patterns
  placeFinderPattern(m, r, 0, 0);
  placeFinderPattern(m, r, s - 7, 0);
  placeFinderPattern(m, r, 0, s - 7);

  // Timing patterns
  for (let i = 8; i < s - 8; i++) {
    setModule(m, r, 6, i, i % 2 === 0);
    setModule(m, r, i, 6, i % 2 === 0);
  }

  // Alignment patterns
  const pos = ALIGN_POS[version];
  if (pos.length > 0) {
    for (const row of pos) {
      for (const col of pos) {
        // Skip if overlapping finder patterns
        if (row <= 8 && col <= 8) continue;
        if (row <= 8 && col >= s - 9) continue;
        if (row >= s - 9 && col <= 8) continue;
        placeAlignmentPattern(m, r, row, col);
      }
    }
  }

  // Dark module
  setModule(m, r, (4 * version) + 9, 8, true);

  // Reserve format info areas
  for (let i = 0; i < 8; i++) {
    if (!r[8][i]) { r[8][i] = 1; m[8][i] = 0; }
    if (!r[8][s - 1 - i]) { r[8][s - 1 - i] = 1; m[8][s - 1 - i] = 0; }
    if (!r[i][8]) { r[i][8] = 1; m[i][8] = 0; }
    if (!r[s - 1 - i][8]) { r[s - 1 - i][8] = 1; m[s - 1 - i][8] = 0; }
  }
  if (!r[8][8]) { r[8][8] = 1; m[8][8] = 0; }
}

function placeData(qr, bits) {
  const { matrix: m, reserved: r, size: s } = qr;
  let bitIdx = 0;
  // Traverse right-to-left in column pairs, bottom-to-top then top-to-bottom alternating
  for (let right = s - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5; // skip timing column
    for (let vert = 0; vert < s; vert++) {
      for (let j = 0; j < 2; j++) {
        const col = right - j;
        const upward = ((Math.floor((s - 1 - right) / 2)) % 2 === 0);
        const row = upward ? s - 1 - vert : vert;
        if (r[row][col]) continue;
        m[row][col] = bitIdx < bits.length ? bits[bitIdx] : 0;
        bitIdx++;
      }
    }
  }
}

// Format info (EC level M = 0, mask patterns 0-7)
// Pre-computed BCH(15,5) encoded format strings for level M (binary 00)
const FORMAT_BITS = [
  0x5412, 0x5125, 0x5E7C, 0x5B4B, 0x45F9, 0x40CE, 0x4F97, 0x4AA0,
];

function applyFormatInfo(qr, mask) {
  const { matrix: m, size: s } = qr;
  const bits = FORMAT_BITS[mask];
  for (let i = 0; i < 15; i++) {
    const bit = (bits >> (14 - i)) & 1;
    // Around top-left finder
    if (i < 6) m[8][i] = bit;
    else if (i === 6) m[8][7] = bit;
    else if (i === 7) m[8][8] = bit;
    else if (i === 8) m[7][8] = bit;
    else m[14 - i][8] = bit;

    // Other copy
    if (i < 8) m[s - 1 - i][8] = bit;
    else m[8][s - 15 + i] = bit;
  }
}

// --- Masking ---
const MASK_FNS = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2 + (r * c) % 3) === 0,
  (r, c) => ((r * c) % 2 + (r * c) % 3) % 2 === 0,
  (r, c) => ((r + c) % 2 + (r * c) % 3) % 2 === 0,
];

function applyMask(qr, maskIdx) {
  const { matrix: m, reserved: r, size: s } = qr;
  const fn = MASK_FNS[maskIdx];
  for (let row = 0; row < s; row++) {
    for (let col = 0; col < s; col++) {
      if (!r[row][col] && fn(row, col)) {
        m[row][col] ^= 1;
      }
    }
  }
}

function penaltyScore(m, s) {
  let score = 0;
  // Rule 1: runs of same color
  for (let row = 0; row < s; row++) {
    let run = 1;
    for (let col = 1; col < s; col++) {
      if (m[row][col] === m[row][col - 1]) { run++; }
      else { if (run >= 5) score += run - 2; run = 1; }
    }
    if (run >= 5) score += run - 2;
  }
  for (let col = 0; col < s; col++) {
    let run = 1;
    for (let row = 1; row < s; row++) {
      if (m[row][col] === m[row - 1][col]) { run++; }
      else { if (run >= 5) score += run - 2; run = 1; }
    }
    if (run >= 5) score += run - 2;
  }
  // Rule 2: 2x2 blocks
  for (let row = 0; row < s - 1; row++) {
    for (let col = 0; col < s - 1; col++) {
      const v = m[row][col];
      if (v === m[row][col + 1] && v === m[row + 1][col] && v === m[row + 1][col + 1]) {
        score += 3;
      }
    }
  }
  return score;
}

// --- Main encode function ---
export function encodeQR(text) {
  // Convert to byte array
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const dataLen = data.length;

  const version = getVersion(dataLen);
  const vt = VERSION_TABLE[version];
  const totalCodewords = vt[0];
  const ecPerBlock = vt[1];
  const numBlocks1 = vt[2];
  const dataPerBlock1 = vt[3];
  const numBlocks2 = vt[4];
  const dataPerBlock2 = vt[5];
  const totalDataCodewords = numBlocks1 * dataPerBlock1 + numBlocks2 * dataPerBlock2;

  // Build data bitstream: mode(4) + count(8 or 16) + data + terminator + padding
  const bitCapacity = totalDataCodewords * 8;
  const countBits = version <= 9 ? 8 : 16;
  const bits = [];

  function pushBits(val, len) {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
  }

  pushBits(0b0100, 4); // byte mode
  pushBits(dataLen, countBits);
  for (const b of data) pushBits(b, 8);

  // Terminator
  const termLen = Math.min(4, bitCapacity - bits.length);
  pushBits(0, termLen);

  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);

  // Pad bytes
  const padBytes = [0xEC, 0x11];
  let padIdx = 0;
  while (bits.length < bitCapacity) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bits to codewords
  const codewords = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    codewords.push(byte);
  }

  // Split into blocks and compute EC
  const blocks = [];
  const ecBlocks = [];
  let offset = 0;
  for (let i = 0; i < numBlocks1; i++) {
    const block = codewords.slice(offset, offset + dataPerBlock1);
    blocks.push(block);
    ecBlocks.push(rsEncode(block, ecPerBlock));
    offset += dataPerBlock1;
  }
  for (let i = 0; i < numBlocks2; i++) {
    const block = codewords.slice(offset, offset + dataPerBlock2);
    blocks.push(block);
    ecBlocks.push(rsEncode(block, ecPerBlock));
    offset += dataPerBlock2;
  }

  // Interleave data codewords
  const interleaved = [];
  const maxDataLen = Math.max(dataPerBlock1, dataPerBlock2);
  for (let i = 0; i < maxDataLen; i++) {
    for (const block of blocks) {
      if (i < block.length) interleaved.push(block[i]);
    }
  }
  // Interleave EC codewords
  for (let i = 0; i < ecPerBlock; i++) {
    for (const block of ecBlocks) {
      if (i < block.length) interleaved.push(block[i]);
    }
  }

  // Convert to bit array
  const dataBits = [];
  for (const cw of interleaved) {
    for (let i = 7; i >= 0; i--) dataBits.push((cw >> i) & 1);
  }

  // Build QR matrix
  const qr = makeMatrix(version);
  placePatterns(qr, version);

  // Try all masks and pick best
  let bestMask = 0;
  let bestPenalty = Infinity;
  let bestMatrix = null;

  for (let mask = 0; mask < 8; mask++) {
    // Clone matrix
    const clone = {
      matrix: qr.matrix.map(row => new Uint8Array(row)),
      reserved: qr.reserved,
      size: qr.size,
    };
    placeData(clone, dataBits);
    applyMask(clone, mask);
    applyFormatInfo(clone, mask);
    const p = penaltyScore(clone.matrix, clone.size);
    if (p < bestPenalty) {
      bestPenalty = p;
      bestMask = mask;
      bestMatrix = clone.matrix;
    }
  }

  return bestMatrix;
}

/**
 * Render a QR matrix to a data URL (PNG via canvas).
 * @param {string} text - The text to encode
 * @param {number} size - Desired image size in pixels
 * @param {object} opts - Options: { dark, light } colors
 * @returns {string} data URL
 */
export function generateQRDataURL(text, size = 200, opts = {}) {
  const { dark = '#000000', light = '#ffffff' } = opts;
  const matrix = encodeQR(text);
  const modules = matrix.length;
  const quiet = 4; // quiet zone
  const total = modules + quiet * 2;
  const scale = Math.max(1, Math.floor(size / total));
  const actualSize = total * scale;

  const canvas = document.createElement('canvas');
  canvas.width = actualSize;
  canvas.height = actualSize;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, actualSize, actualSize);

  // Modules
  ctx.fillStyle = dark;
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      if (matrix[row][col]) {
        ctx.fillRect((col + quiet) * scale, (row + quiet) * scale, scale, scale);
      }
    }
  }

  return canvas.toDataURL('image/png');
}
