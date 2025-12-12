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
   * Upload d'une vidéo (logique séparée pour gestion potentielle de gros fichiers)
   */
  async uploadVideo(file: File, folder: string = 'videos'): Promise<FileUploadResponse> {
    const filePath = `${folder}/${Date.now()}-${file.name}`;
    
    // Pour les vidéos, on peut vouloir augmenter le timeout ou gérer les chunks
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
   * Supprime un fichier via son chemin
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
   * Obtient l'URL publique d'un fichier
   */
  getFileUrl(path: string): string {
    const { data } = this.supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
}
