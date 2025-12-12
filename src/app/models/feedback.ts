export type FeedbackStatus = 'pending' | 'approved' | 'rejected';

export interface Feedback {
  id?: string;
  name: string;
  message: string;
  rating: number; // 1 à 5
  status: FeedbackStatus;
  createdAt: Date;
}
