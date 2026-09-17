import { http } from "@/src/lib/request";
import type { CustomerCredentialRecord } from "@/src/pages/customers/model/credential-types";

export const credentialsApi = {
  list() {
    return http.get<{ items: CustomerCredentialRecord[]; total: number }>(
      "/v1/customer-credentials",
    );
  },
};
