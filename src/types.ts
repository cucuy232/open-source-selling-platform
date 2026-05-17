export interface User {
  username: string;
  id: string;
  email?: string;
  location?: string;
  isPremium?: boolean;
}

export interface Listing {
  id: number;
  subject: string;
  name: string;
  body: string;
  price: string;
  images: string[];
  time: string;
  category: string;
  userId?: string;
  location: string;
  coordinates?: [number, number];
  likes: number;
  sponsored?: boolean;
  createdAt?: number;
}

export interface Board {
  id: string;
  name: string;
}

export interface Boards {
  [key: string]: Board[];
}
export interface ChatMessage {
  sender: string;
  text: string;
  time: string;
  image?: string;
}
export interface AuthData {
  username: string;
  email?: string;
  password: string;
  isRobotChecked?: boolean;
}
