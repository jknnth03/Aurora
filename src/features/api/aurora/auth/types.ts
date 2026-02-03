// User Auth Types
export interface ICredentials {
  username: string;
  password: string;
}

export type IPermission = string;
export type IPermissions = IPermission[];
// Token data stored in cookie
export interface ITokenData {
  userId: number | null;
  username: string | null;
  token?: string;
  role: string | null;
  permissions: IPermissions | null;
  firstName: string | null;
  lastName: string | null;
}

// API Responses
export interface ILoginResponse {
  message: string;
  token: string;
  data: IUserData;
}

export interface IUserData {
  id: number;
  id_prefix: string;
  id_no: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  mobile_number: string;
  gender: string;
  company_id: number;
  business_unit_id: number;
  department_id: number;
  unit_id: number;
  sub_unit_id: number;
  location_id: number;
  username: string;
  role_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  role: IUserRole;
}

export interface IUserRole {
  id: number;
  name: string;
  access_permission: string[];
  created_at: string;
  deleted_at: null | string;
}
