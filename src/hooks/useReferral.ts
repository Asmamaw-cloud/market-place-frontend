import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import {
  fetchReferralCode,
  createReferralCode,
  updateReferralCode,
  deleteReferralCode,
  fetchReferrals,
  fetchReferralStats,
  useReferralCode as applyReferralCodeAction,
  clearError,
} from '@/store/slices/referralSlice'

export function useReferral() {
  const dispatch = useAppDispatch()
  const { 
    referralCode, 
    referrals, 
    stats,
    isLoading, 
    error 
  } = useAppSelector(state => state.referral)

  const loadReferralData = useCallback(() => {
    dispatch(fetchReferralCode())
    dispatch(fetchReferrals())
    dispatch(fetchReferralStats())
  }, [dispatch])

  useEffect(() => {
    loadReferralData()
  }, [loadReferralData])

  const createReferralCodeData = useCallback(async (data: any) => {
    try {
      const result = await dispatch(createReferralCode(data)).unwrap()
      return result
    } catch (error) {
      console.error('Failed to create referral code:', error)
      throw error
    }
  }, [dispatch])

  const updateReferralCodeData = useCallback(async (codeId: string, data: any) => {
    try {
      await dispatch(updateReferralCode({ codeId, data })).unwrap()
    } catch (error) {
      console.error('Failed to update referral code:', error)
      throw error
    }
  }, [dispatch])

  const deleteReferralCodeData = useCallback(async (codeId: string) => {
    try {
      await dispatch(deleteReferralCode(codeId)).unwrap()
    } catch (error) {
      console.error('Failed to delete referral code:', error)
      throw error
    }
  }, [dispatch])

  const getReferralCodeData = useCallback(async () => {
    try {
      const result = await dispatch(fetchReferralCode()).unwrap()
      return result
    } catch (error) {
      console.error('Failed to get referral code:', error)
      throw error
    }
  }, [dispatch])

  const getReferralsData = useCallback(async () => {
    try {
      const result = await dispatch(fetchReferrals()).unwrap()
      return result
    } catch (error) {
      console.error('Failed to get referrals:', error)
      throw error
    }
  }, [dispatch])

  const getReferralStatsData = useCallback(async () => {
    try {
      const result = await dispatch(fetchReferralStats()).unwrap()
      return result
    } catch (error) {
      console.error('Failed to get referral stats:', error)
      throw error
    }
  }, [dispatch])

  const applyReferralCode = useCallback(async (code: string, orderId?: string) => {
    try {
      const result = await dispatch(applyReferralCodeAction({ code, orderId })).unwrap()
      return result
    } catch (error) {
      console.error('Failed to use referral code:', error)
      throw error
    }
  }, [dispatch])

  return {
    // State
    referralCode,
    referrals,
    stats,
    isLoading,
    error,
    // Actions
    loadReferralData,
    createReferralCode: createReferralCodeData,
    updateReferralCode: updateReferralCodeData,
    deleteReferralCode: deleteReferralCodeData,
    getReferralCode: getReferralCodeData,
    getReferrals: getReferralsData,
    getReferralStats: getReferralStatsData,
    useReferralCode: applyReferralCode,
    clearError: () => dispatch(clearError()),
  }
}
