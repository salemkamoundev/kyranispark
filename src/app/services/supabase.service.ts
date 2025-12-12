import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface FileUploadResponse {
  path: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private readonly BUCKET_NAME = environment.supabase.bucket;

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.key);
  }

  /**
   * Upload d'une image dans un dossier spécifique
   */
  async uploadImage(file: File, folder: string = 'images'): Promise<FileUploadResponse> {
    const filePath = `${folder}/${Date.now()}-${file.name}`;

    const { data, error } = await this.supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      throw error;
    }

    return {
      path: data.path,
      url: this.getFileUrl(data.path)
    };
  }

  /**
   * Upload d'une vidéo
   */
  async uploadVideo(file: File, folder: string = 'videos'): Promise<FileUploadResponse> {
    const filePath = `${folder}/${Date.now()}-${file.name}`;
    
    const { data, error } = await this.supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      throw error;
    }

    return {
      path: data.path,
      url: this.getFileUrl(data.path)
    };
  }

  /**
   * Supprime un fichier via son chemin interne
   */
  async deleteFile(path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.BUCKET_NAME)
      .remove([path]);

    if (error) {
      throw error;
    }
  }

  /**
   * Tente de supprimer un fichier à partir de son URL publique
   * Extrait le chemin relatif à partir de l'URL.
   */
  async deleteFileByUrl(url: string): Promise<void> {
    try {
      // Structure URL typique: .../storage/v1/object/public/BUCKET_NAME/folder/file.jpg
      const bucketMarker = `/public/${this.BUCKET_NAME}/`;
      const parts = url.split(bucketMarker);
      
      if (parts.length === 2) {
        const path = parts[1];
        // Décoder l'URL au cas où il y aurait des espaces (%20)
        await this.deleteFile(decodeURIComponent(path));
      } else {
        console.warn('Impossible d\'extraire le chemin Supabase de l\'URL:', url);
      }
    } catch (e) {
      console.error('Erreur lors de la suppression Supabase:', e);
      throw e;
    }
  }

  /**
   * Obtient l'URL publique d'un fichier
   */
  getFileUrl(path: string): string {
    const { data } = this.supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(path);

    return data.publicUrl;
  }
}
