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
