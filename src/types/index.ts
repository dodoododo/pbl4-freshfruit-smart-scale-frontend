export interface User {
  id: string;
  email: string;
  password: string;
  isAdmin: boolean;
  name: string;
  phone?: string;
  birthday?: string; 
  gender?: string;
  address?: string;
}


export interface Fruit {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  quantity: number;
}

export interface CartItem {
  fruit: Fruit;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed';
  createdAt: string;
  shippingAddress: {
    name: string;
    email: string;
    address: string;
    city: string;
    zipCode: string;
  };
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  signup: (email: string, password: string, name: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
}