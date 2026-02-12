export interface SplitserConfig {
  email: string;
  password: string;
  sessionCookie?: string;
}

export interface MoneyAmount {
  fractional: number;
  currency: string;
}

export interface ExpenseCategory {
  id: number;
  category_source: string;
}

export interface ExpenseShare {
  id?: string;
  member_id: string;
  meta: {
    type: string;
    multiplier: number;
  };
  source_amount: MoneyAmount;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  name: string;
  payed_by_id: string;
  payed_on: string;
  source_amount: MoneyAmount;
  amount: MoneyAmount;
  exchange_rate: number;
  shares_attributes: ExpenseShare[];
}

export interface CreateExpenseRequest {
  expense: Expense;
}

export interface ListQueryParams {
  page?: number;
  per_page?: number;
  filter?: {
    archived?: boolean;
  };
}

export interface SplitserList {
  id: string;
  name: string;
  archived: boolean;
  // Add other list fields as needed
}

export interface Member {
  id: string;
  nickname: string;
  email: string;
  list_id: string;
  user_id: string;
  default_split_template_id: string | null;
  full_name: string;
  commitments_to_pay: number;
  commitments_to_receive: number;
  archived: boolean;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
  accepted_at: number;
  avatar: {
    image: string | null;
    user_id: string;
    initials: string;
  };
  invitation: {
    invitation: {
      state: string;
      url: string | null;
    };
  };
}

export interface MembersQueryParams {
  page?: number;
  per_page?: number;
  filter?: {
    member_set?: 'available' | 'archived';
  };
}

export interface MembersResponse {
  pagination: {
    total_pages: number;
    offset: number;
    per_page: number;
    total_entries: number;
    current_page: number;
  };
  data: Array<{
    permissions: any;
    member: Member;
  }>;
}
