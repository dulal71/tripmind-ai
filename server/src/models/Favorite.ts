import { ObjectId } from 'mongodb';

export interface Favorite {
  _id?: ObjectId;
  userId: string;
  destinationId: ObjectId;
  destinationName?: string;
  destinationImage?: string;
  destinationCountry?: string;
  destinationRating?: number;
  destinationCostPerDay?: number;
  createdAt: Date;
}
