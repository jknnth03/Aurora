import { QAStoreChecklist } from "./qa-dashboard-types";

export interface IRegionHeadResponse {
  id: number;
  name: string;
  region_head: {
    id: number;
    full_name: string;
    user_status: string;
  };
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  areas: Array<{
    id: number;
    name: string;
    region: {
      id: number;
      name: string;
    };
    area_head: {
      id: number;
      full_name: string;
      user_status: string;
    };
    store: Array<{
      id: number;
      code: string;
      name: string;
      checklist: QAStoreChecklist["store"][number]["checklist"];
      region: {
        id: number;
        name: string;
      };
      area: {
        id: number;
        name: string;
      };
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    }>;
  }>;
}
