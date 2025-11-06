import { configureStore } from '@reduxjs/toolkit'
import cardsReducer from '../features/cards/cardsSlice'
import collectionReducer from '../features/collection/collectionSlice'
import tradesReducer from '../features/trades/tradesSlice'
import usersReducer from '../features/users/usersSlice'
import wishlistReducer from '../features/whislist/whislistSlice'

export const store = configureStore({
  reducer: {
    users: usersReducer,
    cards: cardsReducer,
    collection: collectionReducer,
    trades: tradesReducer,
    wishlist: wishlistReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch