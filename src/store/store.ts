import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'

// Import slices
import authSlice from './slices/authSlice'
import cartSlice from './slices/cartSlice'
import productsSlice from './slices/productsSlice'
import ordersSlice from './slices/ordersSlice'
import merchantsSlice from './slices/merchantsSlice'
import chatSlice from './slices/chatSlice'
import notificationsSlice from './slices/notificationsSlice'
import wishlistSlice from './slices/wishlistSlice'
import priceAlertsSlice from './slices/priceAlertsSlice'
import stockNotificationsSlice from './slices/stockNotificationsSlice'
import giftRegistrySlice from './slices/giftRegistrySlice'
import inventorySlice from './slices/inventorySlice'
import referralSlice from './slices/referralSlice'
import bulkOrderingSlice from './slices/bulkOrderingSlice'
import uiSlice from './slices/uiSlice'

// Persist config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'cart'], // Only persist auth and cart
}

const rootReducer = combineReducers({
  auth: authSlice,
  cart: cartSlice,
  products: productsSlice,
  orders: ordersSlice,
  merchants: merchantsSlice,
  chat: chatSlice,
  notifications: notificationsSlice,
  wishlist: wishlistSlice,
  priceAlerts: priceAlertsSlice,
  stockNotifications: stockNotificationsSlice,
  giftRegistry: giftRegistrySlice,
  inventory: inventorySlice,
  referral: referralSlice,
  bulkOrdering: bulkOrderingSlice,
  ui: uiSlice,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
