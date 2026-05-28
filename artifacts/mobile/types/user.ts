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
}

export interface AuthSession {
  user: UserProfile;
  createdAt: number;
}
