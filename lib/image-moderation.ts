import axios from 'axios';

/**
 * Checks an image for inappropriate content using the Sightengine API.
 * @param {File|Blob} imageFile - The image file to check.
 * @returns {Promise<boolean>} - Resolves true if image is safe, false if inappropriate.
 */
export async function isImageSafe(imageFile: File | Blob): Promise<boolean> {
  const apiUser = process.env.NEXT_PUBLIC_SIGHTENGINE_USER || '';
  const apiSecret = process.env.NEXT_PUBLIC_SIGHTENGINE_SECRET || '';
  if (!apiUser || !apiSecret) {
    // If not configured, allow all images (fail open)
    return true;
  }

  const formData = new FormData();
  formData.append('media', imageFile);
  formData.append('models', 'nudity,wad,offensive');
  formData.append('api_user', apiUser);
  formData.append('api_secret', apiSecret);

  try {
    const response = await axios.post('https://api.sightengine.com/1.0/check.json', formData);
    const result = response.data;
    // Check for nudity, weapons, alcohol, drugs, offensive
    if (
      result.nudity?.safe === false ||
      result.nudity?.raw > 0.2 ||
      result.weapon > 0.2 ||
      result.alcohol > 0.2 ||
      result.drugs > 0.2 ||
      result.offensive?.prob > 0.2
    ) {
      return false;
    }
    return true;
  } catch (err) {
    // On error, fail open
    return true;
  }
}
