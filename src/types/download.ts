export interface Download {
  id: string;
  user_id: string;
  note_id: string;
  downloaded_at: string;
  note?: {
    id: string;
    title: string;
    subject: string;
    file_url: string;
  };
}

export interface Transaction {
  id: string;
  buyer_id: string;
  seller_id: string;
  note_id: string;
  amount: number;
  platform_fee: number;
  seller_amount: number;
  status: 'pending' | 'completed' | 'refunded';
  created_at: string;
  note?: {
    id: string;
    title: string;
  };
}

export interface Rating {
  id: string;
  user_id: string;
  note_id: string;
  rating: number;
  review: string | null;
  created_at: string;
}
