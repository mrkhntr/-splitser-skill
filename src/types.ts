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

export interface ExpenseListItem {
  id: string;
  name: string;
  list_id: string;
  settle_id: string | null;
  payed_by_member_instance_id: string | null;
  status: string;
  payed_on: string;
  exchange_rate: string;
  payed_by_id: string;
  category: {
    id: number;
    sub_id: number;
    main_id: number;
    icon: string;
    category_source: string;
    main_description: string;
    sub_description: string;
  };
  created_at: number;
  updated_at: number;
  source_amount: MoneyAmount;
  amount: MoneyAmount;
  shares: Array<{
    share: {
      id: string;
      member_instance_id: string | null;
      member_id: string;
      meta: {
        type: string;
        multiplier: number;
      };
      member_instance: any;
      source_amount: MoneyAmount;
      amount: MoneyAmount;
    };
  }>;
  recurring_task: any;
  image: {
    image: {
      original: string | null;
      large: string | null;
      small: string | null;
      micro: string | null;
    };
  };
}

export interface ListItemsQueryParams {
  page?: number;
  per_page?: number;
  sort?: {
    payed_on?: 'asc' | 'desc';
    created_at?: 'asc' | 'desc';
    amount?: 'asc' | 'desc';
    updated_at?: 'asc' | 'desc';
  };
  filter?: {
    settled?: boolean;
  };
}

export interface ListItemsResponse {
  pagination: {
    total_pages: number;
    offset: number;
    per_page: number;
    total_entries: number;
    current_page: number;
  };
  data: Array<{
    permissions: any;
    expense: ExpenseListItem;
  }>;
}
