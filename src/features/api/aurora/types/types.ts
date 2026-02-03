// src/types/api.ts

import { IQAWeekAnswer } from "./qa-dashboard-types";

// Define the base API response structure with a generic result type
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// Define the pagination structure with a generic data type
export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

// Combine the two types for a paginated API response
export type PaginatedApiResponse<T> = ApiResponse<PaginatedResponse<T>>;

// Define unpaginated response type where result is directly an array
export type UnpaginatedApiResponse<T> = ApiResponse<T[]>;

export interface ApiError {
  status: number;
  title: string;
  detail: string;
  source: {
    pointer: "string";
  };
}

export interface ApiErrorResponse {
  data: {
    errors: ApiError[];
  };
}

export function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return (
    error !== null &&
    typeof error === "object" &&
    "data" in error &&
    error.data !== null &&
    typeof error.data === "object" &&
    "errors" in error.data &&
    Array.isArray(error.data.errors)
  );
}

export interface IStoreWeek {
  id: number;
  code: string;
  name: string;
  checklist: IChecklistWeek[];
}

export interface IStoreChecklistWeek {
  id: number;
  code: string;
  checklist: string;
  weekly_record: Array<{
    start_time: string;
    end_time: string;
    for_approval_reason: string | null;
    id: number;
    store_checklist_id: number;
    week: number;
    month: number;
    year: number;
    weekly_grade: string;
    status: string;
    is_auto_grade: boolean;
    grade_source: string;
    weekly_skipped: IWeeklySkipped;
    graded_by: IGradedBy;
    grade_notes: string | null;
    store_visit: "1" | "0" | null;
    condemned: "1" | "0" | null;
    expired: "1" | "0" | null;
    create_at: string;
    updated_at: string;
    deleted_at: string | null;
    audit_trail: Array<{
      id: number;
      module_type: string;
      module_name: string;
      module_id: number;
      action: string;
      action_by: number;
      action_by_name: string;
      log_info: string;
      previous_data: string | null;
      new_data: INewData;
      remarks: string;
      ip_address: string;
      user_agent: string;
      created_at: string;
      updated_at: string;
      deleted_at: string;
    }>;
  }>;
}

export interface IChecklistWeek {
  id: number;
  code: string;
  checklist: string;
  sections: ISectionsWeek[];
  weekly_record: IWeeklyRecord[];
  store_visit: string;
  expired: string;
  condemned: string;
  store_duty_id: string;
  good_points: string;
  notes: string;
  grade: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ISectionsWeek {
  id: number;
  checklist_id: number;
  title: string;
  description: string | null;
  order_index: number;
  questions: IQuestions[];
}

export interface IQuestions {
  id: number;
  section_id: number;
  question_type: "multiple_choice" | "checkboxes" | "paragraph";
  question_text: string;
  order_index: number;
  options: IOptions[];
}

export interface IOptions {
  id: number;
  question_id: number;
  option_text: string;
  order_index: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface IWeeklyRecord {
  id: number;
  store_checklist_id: number;
  week: number;
  month: number;
  year: number;
  weekly_grade: string;
  for_approval_reason: string | null;
  start_time: string;
  end_time: string;
  status: string;
  weekly_skipped: {
    id: number;
    weekly_id: number;
    week: number;
    month: number;
    year: number;
    approver_id: number;
    approver_name: string;
    approved_at: string | null;
    rejected_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  is_auto_grade: boolean;
  grade_source: string;
  graded_by: number;
  grade_notes: string | null;
  store_visit: string | null;
  expired: string | null;
  condemned: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface IWeeklySkipped {
  id: number;
  weekly_id: number;
  week: number;
  month: number;
  year: number;
  approver_id: number;
  approver_name: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: null;
}

export interface IGradedBy {
  id: number;
  id_prefix: string;
  id_no: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix: string | null;
  position_name: string;
  mobile_number: string;
  gender: string;
  one_charging_id: number;
  one_charging_sync_id: number | null;
  one_charging_code: string | null;
  one_charging_name: string | null;
  username: string;
  role_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface INewData {
  inspection_metadata: {
    week: number;
    month: number;
    year: number;
    inspection_date: string;
    inspector: {
      id: number;
      full_name: string;
      employee_id: string;
    };
    store: {
      id: number;
      code: string;
      name: string;
    };
    area: {
      id: number;
      name: string;
    };
    region: {
      id: number;
      name: string;
    };
    store_duties: Array<{
      id: number;
      employee_id: string;
      first_name: string;
      last_name: string;
      full_name: string;
    }>;
    status: string;
    store_visit: "1" | "0" | null;
    expired: "1" | "0" | null;
    condemned: "1" | "0" | null;
    good_points: string;
    notes: string;
  };
  checklist_snapshot: IQAWeekAnswer;
  grade_summary: {
    total_grade: number;
    total_score: number;
    max_score: number;
    percentage: number;
    total_sections: number;
    points_per_section: number;
  };
}
