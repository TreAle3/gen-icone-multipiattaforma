// ic-funzioni-utili.js - Definizioni delle costanti inerenti alle piattaforme

/**
 * Converte un dataURL in Blob
 * @param {string} dataURL - DataURL dell'immagine
 * @returns {Blob} Blob dell'immagine
 */
export const dataURLtoBlob = (dataURL) => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * Converte un dataURL in Uint8Array
 * @param {string} dataURL - DataURL dell'immagine
 * @returns {Uint8Array} Array di bytes dell'immagine
 */
export const dataURLtoUint8Array = (dataURL) => {
  const arr = dataURL.split(',');
  const bstr = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return u8arr;
};
