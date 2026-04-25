export interface MediaItem {
  id: string;
  type: 'photos' | 'videos' | 'events' | 'promotions' | 'news' | 'announcements' | 'maintenance';
  title: string;
  description?: string;
  imageUrl: string;
  images?: string[];
  date?: string;
  count?: string;
  duration?: string;
  categoryLabel?: string;
  category?: string;
  club?: string;
  videoUrl?: string;
}

export interface PhotoAlbum extends MediaItem {
  type: 'photos' | 'events' | 'promotions' | 'news' | 'announcements' | 'maintenance';
  count: string;
  date: string;
}

export interface Video extends MediaItem {
  type: 'videos';
  duration: string;
  description: string;
}
