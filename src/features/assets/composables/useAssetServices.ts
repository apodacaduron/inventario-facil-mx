import { supabase } from '@/config/supabase';
import { Tables } from '../../../../types_db';

export type CreateAsset = Omit<Tables<'assets'>, 'created_at' | 'id'>
export type UpdateAsset = Partial<Omit<Tables<'assets'>, 'created_at' | 'id'>>

export function useAssetServices() {
  async function createAsset(asset: CreateAsset) {
    return await supabase.from('assets').insert(asset);
  }
  async function deleteAsset(id: string) {
    return await supabase.from('assets').delete().eq('id', id);
  }
  async function updateAsset(id: string, asset: UpdateAsset) {
    return await supabase.from('assets').update(asset).eq('id', id)
  }

  async function getAssetByRelatedId(related_id: string) {
    const asset = await supabase
      .from('assets')
      .select('*')
      .eq('related_id', related_id)
      .single();

    return asset;
  }

  async function getAssetByUrl(url: string | null | undefined) {
    if (!url) return;

    const asset = await supabase
      .from('assets')
      .select('*')
      .eq('url', url)
      .single();

    return asset;
  }

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
    getAssetByUrl,
    uploadFile,
    createAsset,
    getPublicUrlFromFile,
    deleteAsset,
    updateAsset,
    getAssetByRelatedId,
  };
}
