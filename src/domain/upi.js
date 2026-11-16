export const MAX_UPI_QR_IMAGE_LENGTH = 700_000;

export function isUpiQrImage(value) {
  return typeof value === 'string' && value.length <= MAX_UPI_QR_IMAGE_LENGTH &&
    /^data:image\/(?:png|jpeg);base64,[A-Za-z0-9+/]+={0,2}$/.test(value);
}
