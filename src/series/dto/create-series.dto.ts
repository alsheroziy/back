export class CreateSeriesDto {
  uz: {
    title: string;
    description: string;
  };
  ru: {
    title: string;
    description: string;
  };
  category: string;
  studio: string;
  director: string;
  creators: string;
  genres: string;
  categories: string;
  published_year: number;
  thumbnail: string;
  cover: string;
  images: string;
  slug: string;
  trailer: string;
  age: number;
  type: 'free' | 'paid';
  video: string;
  duration: number;
  total_episodes: number;
}
