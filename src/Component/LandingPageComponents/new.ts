export type NewsCategory =
  | 'photos'
  | 'videos'
  | 'events'
  | 'promotions'
  | 'news'
  | 'announcements'
  | 'maintenance';

export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: NewsCategory;
  sourceCategory?: string;
  date: string;
  timeAgo: string;
  isFeatured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  label: string;
}
