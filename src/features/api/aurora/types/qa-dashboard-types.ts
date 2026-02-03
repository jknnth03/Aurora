import { ISectionsWeek, IStoreChecklistWeek, IWeeklyRecord } from "./types";

export interface IQADashboardResponse {
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
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    };
    sections: ISectionsWeek[];
    weekly_record: IWeeklyRecord[];
    created_at: string;
    updated_at: string;
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
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface IQAWeekResponse {
  id: number;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  store_checklist: Array<{
    id: number;
    code: string;
    checklist: string;
    weekly_record: Array<{
      approver_remarks: string;
      id: number;
      store_checklist_id: number;
      week: number;
      month: number;
      year: number;
      start_time: string;
      end_time: string;
      weekly_grade: string;
      is_auto_grade: boolean;
      grade_source: string;
      graded_by: {
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
        created_at: string | null;
        updated_at: string | null;
        deleted_at: string | null;
      };
      status: string;
      grade_notes: null;
      store_visit: number;
      condemned: number;
      create_at: string | null;
      updated_at: string | null;
      deleted_at: string | null;
      for_approval_reason: string | null;
      audit_trail: Array<{
        id: 6;
        module_type: string;
        module_name: string;
        module_id: number;
        action: string;
        action_by: number;
        action_by_name: string;
        log_info: string;
        previous_data: string | null;
        new_data: {
          inspection_metadata: {
            week: number;
            month: number;
            year: number;
            inspection_date: string | null;
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
            store_visit: string;
            expired: string;
            condemned: string;
            good_points: string;
            notes: string;
          };
          checklist_snapshot: {
            id: number;
            code: string;
            name: string;
            sections: Array<{
              id: number;
              category_id: number;
              category_name: string;
              title: string;
              description: string | null;
              order_index: number;
              grade: {
                max_points: number;
                earned_points: number;
                percentage: number;
                total_questions: number;
              };
              questions: Array<{
                id: number;
                question_type: string;
                question_text: string;
                order_index: number;
                options: Array<{
                  id: number;
                  option_text: string;
                  order_index: number;
                  score_rating_id: number;
                  score_rating: {
                    id: number;
                    rating: number;
                    score: number;
                  };
                }>;
                response: {
                  question_type: "multiple_choice";
                  answer: string;
                  answer_text: string;
                  remarks: string;
                  attachment: {
                    file_name: string;
                    file_path: string;
                    file_url: string;
                    original_name: string;
                    mime_type: string;
                    size: number;
                  };
                  selected_option: {
                    id: number;
                    option_text: string;
                    score_rating_id: number;
                    score_rating: {
                      id: number;
                      rating: number;
                      score: number;
                    };
                  };
                };
              }>;
            }>;
          };
          grade_summary: {
            total_grade: number;
            total_score: number;
            max_score: number;
            percentage: number;
            total_sections: number;
            points_per_section: number;
          };
        };
        remarks: string;
        ip_address: string;
        user_agent: string;
        created_at: string;
        updated_at: string;
        deleted_at: string;
      }>;
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
    created_at: string;
    updated_at: string;
    deleted_at: string;
  }>;
}

export interface QAStoreChecklist {
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
  store: {
    id: number;
    code: number;
    name: string;
    checklist: {
      id: number;
      code: string;
      checklist: string;
      sections: ISectionsWeek[];
      weekly_record: IWeeklyRecord[];
      store_visit: string | null;
      expired: string | null;
      condemned: string | null;
      store_duty_id: string | null;
      good_points: string | null;
      notes: string | null;
      grade: string | null;
      status: "Done" | "Pending";
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    }[];
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
  }[];
}

export interface IQAWeekAnswer {
  id: number;
  category_id: number;
  category_name: string;
  title: string;
  description: string | null;
  order_index: number;
  questions: Array<{
    id: number;
    question_type: string;
    question_text: string;
    order_index: number;
    options: Array<{
      id: number;
      option_text: string;
      order_index: number;
      score_rating_id: number;
      score_rating: {
        id: number;
        rating: number;
        score: number;
      };
    }>;
    response: {
      question_type: "multiple_choice" | "checkboxes" | "paragraph";
      answer: string | number;
      answer_text: string;
      remarks: string;
      attachment: {
        file_name: string;
        file_path: string;
        file_url: string;
        original_name: string;
        mime_type: string;
        size: number;
      };
      selected_option: {
        id: number;
        option_text: string;
        score_rating_id: number;
        score_rating: {
          id: number;
          rating: number;
          score: number;
        };
      };
    };
  }>;
}

export interface ResurveyResponse {
  grade_data: {
    grade: number;
    total_score: number;
    max_score: number;
    percentage: number;
    total_sections: number;
    points_per_section: number;
    breakdown: Array<{
      section_id: number;
      section_title: string;
      section_order_index: number;
      section_category_id: number;
      max_points: number;
      earned_points: number;
      percentage: number;
      total_questions: number;
      questions: Array<{
        question_id: number;
        question_text: string;
        question_order_index: number;
        max_points: number;
        earned_points: number;
        has_remarks: boolean;
        remarks: string;
        answered: boolean;
        answer_text: string;
        rating_id: string;
        question_type: string;
      }>;
    }>;
    store_visit: boolean;
  };
  weekly_record: {
    id: number;
    store_checklist_id: number;
    week: number;
    month: number;
    year: number;
    weekly_grade: string;
    is_auto_grade: boolean;
    grade_source: string;
    graded_by: number;
    grade_notes: string;
    store_visit: boolean;
    expired: boolean;
    condemned: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string;
  };
  store_duties: Array<{
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    full_name: string;
  }>;
  final_grade: number;
  updated: boolean;
  snapshot: {
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
      store_visit: string;
      expired: string;
      condemned: string;
      good_points: string;
      notes: string;
    };
    checklist_snapshot: {
      id: number;
      code: string;
      name: string;
      sections: Array<{
        id: number;
        category_id: number;
        category_name: string;
        title: string;
        description: string;
        order_index: number;
        questions: Array<{
          id: 1;
          question_type: "multiple_choice";
          question_text: "Question 1";
          order_index: 1;
          options: Array<{
            id: number;
            option_text: string;
            order_index: number;
            score_rating_id: number;
            score_rating: {
              id: number;
              rating: number;
              score: number;
            };
          }>;
          response: {
            question_type: "multiple_choice" | "checkboxes" | "paragraph";
            answer: string;
            answer_text: string;
            remarks: string;
            attachment: string;
            selected_option: {
              id: number;
              option_text: string;
              score_rating_id: number;
              score_rating: {
                id: number;
                rating: number;
                score: number;
              };
            };
          };
        }>;
      }>;
    };
    grade_summary: {
      total_grade: number;
      total_score: number;
      max_score: number;
      percentage: number;
      total_sections: number;
      points_per_section: number;
    };
  };
}

export interface ForApprovalResponse {
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
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
