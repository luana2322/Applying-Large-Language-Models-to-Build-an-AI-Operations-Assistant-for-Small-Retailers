import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  DEBT_PAYMENTS_QUERY_KEY,
  DEBTS_LIST_QUERY_KEY,
  DEBT_DETAIL_QUERY_KEY,
  listDebtPayments,
  recordDebtPayment,
  type RecordDebtPaymentBody,
} from "../api/debtsApi"
import { CASH_FUNDS_LIST_QUERY_KEY, getCashFundsList } from "../api/cashFundsApi"

/** Danh sách lịch sử trả nợ cho một khoản nợ. */
export function useDebtPayments(debtId: number | null | undefined) {
  return useQuery({
    queryKey: [...DEBT_PAYMENTS_QUERY_KEY, debtId],
    queryFn: () => listDebtPayments(debtId!),
    enabled: debtId != null && debtId > 0,
  })
}

/** Danh sách quỹ (để chọn quỹ khi ghi trả nợ). */
export function useCashFundsList() {
  return useQuery({
    queryKey: [...CASH_FUNDS_LIST_QUERY_KEY],
    queryFn: getCashFundsList,
    staleTime: 60_000,
  })
}

/** Mutation ghi trả nợ — sau khi thành công tự invalidate payments + debt list. */
export function useRecordDebtPayment(debtId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: RecordDebtPaymentBody) => recordDebtPayment(debtId, body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...DEBT_PAYMENTS_QUERY_KEY, debtId] }),
        queryClient.invalidateQueries({ queryKey: [...DEBTS_LIST_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: [...DEBT_DETAIL_QUERY_KEY, debtId] }),
      ])
    },
  })
}
