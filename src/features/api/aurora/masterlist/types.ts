export interface ICompany {
  company_id: number;
  company_code: string;
  company_name: string;
}

export interface IBusinessUnit {
  business_unit_id: number;
  business_unit_code: string;
  business_unit_name: string;
}

export interface IDepartment {
  department_id: number;
  department_code: string;
  department_name: string;
}

export interface IUnit {
  department_unit_id: number;
  department_unit_code: string;
  department_unit_name: string;
}

export interface ISubUnit {
  sub_unit_id: number;
  sub_unit_code: string;
  sub_unit_name: string;
}

export interface ILocation {
  location_id: number;
  location_code: string;
  location_name: string;
}

export interface ISearchParams {
  search?: string;
  page?: number;
  per_page?: number;
  status?: "active" | "inactive";
}

export type ISearchParamsUnpaginated = Omit<ISearchParams, "page" | "per_page">;
