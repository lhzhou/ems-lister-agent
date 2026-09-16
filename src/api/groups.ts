import { http } from "@/src/lib/request";
import type { CreateGroupInput, GroupPage, GroupRecord, UpdateGroupInput } from "@/src/pages/groups/model/types";

export const groupsApi = {
  list(params: { page: number; size: number }) {
    return http.get<GroupPage>("/v1/groups", params);
  },
  get(id: number) {
    return http.get<GroupRecord>(`/v1/groups/${id}`);
  },
  create(input: CreateGroupInput) {
    return http.post<GroupRecord>("/v1/groups", input);
  },
  update(id: number, input: UpdateGroupInput) {
    return http.patch<GroupRecord>(`/v1/groups/${id}`, input);
  },
  remove(id: number) {
    return http.delete<{ deleted: boolean }>(`/v1/groups/${id}`);
  },
};
