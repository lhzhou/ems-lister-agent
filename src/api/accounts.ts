import { http } from "@/src/lib/request";
import type { AccountPage, AccountRecord, CreateAccountInput, ResetAccountPasswordInput, UpdateAccountInput } from "@/src/pages/accounts/model/types";

export const accountsApi = {
  list(params: { page: number; size: number; keyword?: string; type?: string; status?: string }) {
    return http.get<AccountPage>("/v1/accounts", params);
  },
  get(id: number) {
    return http.get<AccountRecord>(`/v1/accounts/${id}`);
  },
  create(input: CreateAccountInput) {
    return http.post<AccountRecord>("/v1/accounts", input);
  },
  update(id: number, input: UpdateAccountInput) {
    return http.patch<AccountRecord>(`/v1/accounts/${id}`, input);
  },
  remove(id: number) {
    return http.delete<{ deleted: boolean }>(`/v1/accounts/${id}`);
  },
  resetPassword(id: number, input: ResetAccountPasswordInput) {
    return http.post<{ reset: boolean }>(`/v1/accounts/${id}/reset-password`, input);
  },
};
