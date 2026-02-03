export interface IAreaHeadResponse {
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
    checklist: Array<{
      id: number;
      code: string;
      checklist: string;
      sections: Array<{
        id: number;
        checklist_id: number;
        title: string;
        description: string;
        order_index: number;
        questions: Array<{
          id: number;
          section_id: number;
          question_type: string;
          question_text: string;
          order_index: number;
          options: Array<{
            id: number;
            question_id: number;
            option_text: string;
            order_index: number;
            created_at: string;
            updated_at: string;
            deleted_at: string;
            score_rating_id: number;
          }>;
          created_at: string;
          updated_at: string;
          deleted_at: string;
        }>;
        created_at: string;
        updated_at: string;
        deleted_at: string;
      }>;
      weekly_record: Array<{
        id: number;
        store_checklist_id: number;
        week: number;
        month: number;
        year: number;
        weekly_grade: string;
        is_auto_grade: boolean;
        grade_source: string;
        graded_by: number;
        grade_notes: string | null;
        store_visit: number;
        expired: number;
        condemned: number;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
      }>;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    }>;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  }>;
}

export interface IAreaHeadSearchParams {
  search?: string;
  page?: number;
  per_page?: number;
  sorts?: string;
  status?: "active" | "inactive";
}
