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

// 1. DEFINE AND EXPORT ShippingAddress HERE
export interface ShippingAddress {
  name: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
}



export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed';
  createdAt: string;
  // 2. USE THE NEW INTERFACE HERE
  shippingAddress: ShippingAddress;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  signup: (email: string, password: string, name: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
}


export interface BillDetail {
  detail_id: number;
  fruit_id: number;
  fruit_name: string;
  weight: number;
  price: number;
}

export interface Bill {
  bill_id: number;
  date: string;
  user_id: number;
  cus_id: number;
  total_cost: number;
  bill_details: BillDetail[];
}
