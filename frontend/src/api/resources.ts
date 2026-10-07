import { http } from "./client";
import type { Resource, ResourceStatus, ResourceType } from "./types";

export interface ResourceQuery {
  resource_type?: ResourceType;
  status?: ResourceStatus;
  limit?: number;
  offset?: number;
}

export function listResources(query: ResourceQuery = {}): Promise<Resource[]> {
  return http.get<Resource[]>("/api/resources", { ...query });
}