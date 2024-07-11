import { supabase } from '@/config/supabase';

export function useAssetServices() {
  async function uploadFile(options: {
    bucket: string;
    path: string;
    file: File | string | Blob;
  }) {
    const response = await supabase.storage
      .from(options.bucket)
      .upload(options.path, options.file, {
        upsert: true,
      });

    return response;
  }

  async function deleteFile(options: {
    bucket: string;
    path: string;
  }) {
    const response = await supabase.storage
      .from(options.bucket)
      .remove([options.path]);

    return response;
  }

  async function getPublicUrlFromFile(options: {
    bucket: string;
    path: string;
  }) {
        const response = await supabase.storage
          .from(options.bucket)
          .getPublicUrl(options.path);

    return response;
  }

  return {
    uploadFile,
    getPublicUrlFromFile,
    deleteFile,
  };
}
