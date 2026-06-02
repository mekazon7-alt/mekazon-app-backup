export interface NotificationPreferences {
  offers: boolean;
  freshStock: boolean;
  newArrivals: boolean;
  reorder: boolean;
  orderUpdates: boolean;
  weeklyBasket: boolean;
}

export interface UserProfile {
  phone: string;
  name: string;
  email?: string;
  homeCountry?: string;
  language?: string;
  emirateId?: string;
  savedAddress?: string;
  notificationPreferences: NotificationPreferences;
  pushToken?: string;
  /** Linked Shopify customer GID from the backend, used for order history. */
  shopifyCustomerId?: string | null;
}

export interface AuthSession {
  user: UserProfile;
  createdAt: number;
  /** Signed session token from the backend; sent on order-history requests. */
  token?: string;
}