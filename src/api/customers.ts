import { http } from "@/src/lib/request";
import type {
  CreateCustomerInput,
  CustomerPage,
  CustomerRecord,
  UpdateCustomerInput,
} from "@/src/pages/customers/model/types";

export const customersApi = {
  list(params: { page: number; size: number; keyword?: string; status?: string }) {
    return http.get<CustomerPage>("/v1/customers", params);
  },
  get(id: number) {
    return http.get<CustomerRecord>(`/v1/customers/${id}`);
  },
  create(input: CreateCustomerInput) {
    return http.post<CustomerRecord>("/v1/customers", input);
  },
  update(id: number, input: UpdateCustomerInput) {
    return http.patch<CustomerRecord>(`/v1/customers/${id}`, input);
  },
  remove(id: number) {
    return http.delete<{ deleted: boolean }>(`/v1/customers/${id}`);
  },
};
