import { http } from "@/src/lib/request";
import type {
  CustomerCredentialInput,
  CustomerCredentialRecord,
} from "@/src/pages/customers/model/credential-types";

export const credentialsApi = {
  list() {
    return http.get<{ items: CustomerCredentialRecord[]; total: number }>(
      "/v1/customer-credentials",
    );
  },
  create(customerId: number, input: CustomerCredentialInput) {
    return http.post<CustomerCredentialRecord>(`/v1/customers/${customerId}/credentials`, input);
  },
  update(id: number, input: CustomerCredentialInput) {
    return http.patch<CustomerCredentialRecord>(`/v1/customer-credentials/${id}`, input);
  },
  remove(id: number) {
    return http.delete<{ deleted: boolean }>(`/v1/customer-credentials/${id}`);
  },
};
