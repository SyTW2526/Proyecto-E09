import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/apiService'
import { Trade, TradeStatus } from '../../types'

interface TradesState {
  list: Trade[]
  loading: boolean
  error: string | null
}

const initialState: TradesState = {
  list: [],
  loading: false,
  error: null,
}

export const fetchUserTrades = createAsyncThunk(
  'trades/fetch',
  async (userId: string) => await api.getUserTrades(userId)
)

export const createTrade = createAsyncThunk(
  'trades/create',
  async (data: {
    from: string
    to: string
    offeredCards: string[]
    requestedCards: string[]
  }) => {
    const success = await api.createTrade(
      data.from,
      data.to,
      data.offeredCards,
      data.requestedCards
    )
    if (!success) throw new Error('Error creando intercambio')
    return data
  }
)

export const updateTradeStatus = createAsyncThunk(
  'trades/updateStatus',
  async ({ tradeId, status }: { tradeId: string; status: TradeStatus}) => {
    const success = await api.updateTradeStatus(tradeId, status)
    if (!success) throw new Error('Error actualizando estado')
    return { tradeId, status }
  }
)

const tradesSlice = createSlice({
  name: 'trades',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserTrades.pending, (state) => { state.loading = true })
      .addCase(fetchUserTrades.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchUserTrades.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Error al cargar trades'
      })
      .addCase(updateTradeStatus.fulfilled, (state, action) => {
        const trade = state.list.find(t => t.id === action.payload.tradeId)
        if (trade) trade.status = action.payload.status
      })
  },
})

export default tradesSlice.reducer
