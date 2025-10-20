// Small helper to normalize image content coming from the API.
// Accepts a string (data URI, plain base64 string or URL), an array of bytes,
// a Uint8Array, or an object with a `data` property (like Buffer from backend).
export function getImageSrc(content) {
  if (!content) return null;

  // If it's already a string (could be data URI, URL or bare base64)
  if (typeof content === 'string') {
    if (content.startsWith('data:') || content.startsWith('http') || content.startsWith('https')) {
      return content;
    }
    // assume plain base64 payload (no data:image prefix)
    return `data:image/jpeg;base64,${content}`;
  }

  // If it's an object with .data (common from backend) or an array
  const byteSource = content.data || content;
  if (!byteSource) return null;

  try {
    let bytes;
    if (byteSource instanceof Uint8Array) {
      bytes = byteSource;
    } else if (Array.isArray(byteSource)) {
      bytes = new Uint8Array(byteSource);
    } else if (byteSource.buffer && byteSource.byteLength) {
      // ArrayBuffer-like
      bytes = new Uint8Array(byteSource);
    } else {
      return null;
    }

    // If small enough, inline as base64 (safer for immediate rendering)
    const INLINE_LIMIT = 500 * 1024; // 500KB
    if (bytes.length <= INLINE_LIMIT) {
      // convert to binary string then to base64
      let binary = '';
      const chunk = 0x8000; // to avoid call stack limits
      for (let i = 0; i < bytes.length; i += chunk) {
        const segment = bytes.subarray(i, Math.min(i + chunk, bytes.length));
        binary += String.fromCharCode.apply(null, segment);
      }
      return `data:image/jpeg;base64,${btoa(binary)}`;
    }

    // For large images, use a blob URL to avoid blowing memory with base64
    const blob = new Blob([bytes], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('getImageSrc error:', err, content);
    return null;
  }
}
