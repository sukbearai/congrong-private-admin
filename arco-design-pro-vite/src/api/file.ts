import axios from 'axios';

export interface UploadImageResponse {
  url: string;
  fileName: string;
  size: number;
  type: string;
}

/**
 * Upload image to the server
 * @param formData The FormData object containing the file(s) to upload
 * @param config Optional configuration for the upload
 * @returns Promise with the upload response
 */
export function uploadImage(
  formData: FormData,
  config?: {
    controller?: AbortController;
    onUploadProgress?: (progressEvent: any) => void;
  }
) {
  return axios.post<UploadImageResponse>('/api/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    signal: config?.controller?.signal,
    onUploadProgress: config?.onUploadProgress,
  });
}
