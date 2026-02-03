import { IOneCharging } from "../features/api/aurora/masterlist/one-charging.api";
import { Role } from "../features/api/aurora/masterlist/role.api";

export interface LoginResponse {
	message: string;
	result: UserResult;
}

export interface UserResult extends UserName {
	id: number;
	id_prefix: string;
	id_no: string;
	gender: string;
	position: string;
	one_charging: IOneCharging;
	warehouse: Warehouse;
	username: string;
	updated_at: string;
	token: string;
	role: Role;
	created_at: string;
	deleted_at: string | null;
	mobile_number: string;
	should_change_password: boolean;
}

export interface UserName {
	first_name: string;
	last_name: string;
	middle_name: string;
	suffix: string | null;
}

export interface Warehouse {
	id: number;
	name: string;
	code: string;
	account_titles: AccountTitle[];
}

export interface AccountTitle {
	id: number;
	name: string;
	code: string;
	account_type_id: number;
	account_group_id: number;
	account_sub_group_id: number;
	financial_statement_id: number;
	normal_balance_id: number;
	account_title_unit_id: number;
	credit_id: string;
	credit_name: string;
	credit_code: string;
	request_id: string;
	request_type: string;
	updated_at: string;
	deleted_at: string | null;
	pivot: Pivot;
}

export interface Pivot {
	warehouse_id: number;
	account_title_id: number;
}
