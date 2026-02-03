export interface SurveyApproversResponse {
  uniqueId: string | number;
  id: number;
  code: string;
  name: string;
  store_checklist: Array<{
    id: number;
    code: string;
    checklist: {
      id: number;
      name: string;
      created_at: string | null;
      updated_at: string | null;
      deleted_at: string | null;
    };
    sections: Array<{
      id: number;
      checklist_id: number;
      title: string;
      description: string | null;
      order_index: number;
      category_id: number;
      questions: Array<{
        id: number;
        section_id: number;
        question_type: "multiple_choice" | "checkboxes" | "paragraph";
        question_text: string;
        order_index: number;
        options: Array<{
          id: number;
          question_id: number;
          option_text: string;
          order_index: number;
          created_at: string | null;
          updated_at: string | null;
          deleted_at: string | null;
          score_rating_id: number;
        }>;
        created_at: string | null;
        updated_at: string | null;
        deleted_at: string | null;
      }>;
      created_at: string | null;
      updated_at: string | null;
      deleted_at: string | null;
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
      status: string;
      grade_notes: string | null;
      store_visit: string | null;
      expired: string | null;
      condemned: string | null;
      for_approval_reason: string;
      created_at: string | null;
      updated_at: string | null;
      deleted_at: string | null;
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
        created_at: string | null;
        updated_at: string | null;
        deleted_at: string | null;
      };
    }>;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
  }>;
  region: {
    id: number;
    name: string;
  };
  area: {
    id: number;
    name: string;
  };
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}
