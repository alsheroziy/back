export class CreateSliderDto {
  mediaType: 'movies' | 'series';
  media: string;
  is_active: boolean;
  image: string;
  mobile_image: string;
}
