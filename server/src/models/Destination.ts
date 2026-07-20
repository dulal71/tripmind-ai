import { ObjectId } from 'mongodb';

export type DestinationCategory =
  | 'beach'
  | 'mountain'
  | 'city'
  | 'cultural'
  | 'adventure'
  | 'nature'
  | 'island'
  | 'desert';

export type Continent =
  | 'Africa'
  | 'Asia'
  | 'Europe'
  | 'North America'
  | 'South America'
  | 'Oceania'
  | 'Antarctica';

export interface Destination {
  _id?: ObjectId;
  name: string;
  country: string;
  continent: Continent;
  description: string;
  shortDescription: string;
  imageUrl: string;
  gallery: string[];
  rating: number;
  reviewCount: number;
  categories: DestinationCategory[];
  bestTimeToVisit: string;
  averageCostPerDay: number;
  currency: string;
  language: string;
  timezone: string;
  highlights: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}
