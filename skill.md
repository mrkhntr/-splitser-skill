# Splitser Skill

Expense tracking and bill splitting automation using the Splitser API.

## Description

This skill allows you to manage expenses, split bills, and track shared costs through the Splitser platform. It handles authentication, expense creation, receipt uploads, and list management.

## Configuration

Before using this skill, initialize it with your Splitser credentials:

```bash
splitser init <email> <password>
```

Your credentials are securely stored in `~/.splitser/config.json` and session cookies are maintained automatically.

## Important Concepts

### Payer vs. Splitters

**Understanding expense splitting:**

- **Payer (`payed_by_id`)**: The person who physically paid the bill/expense. This is typically the person making the request unless explicitly stated otherwise.
  
- **Splitters (`shares_attributes`)**: The people splitting/owing portions of the expense. This includes BOTH the payer and anyone they're splitting with.

**Example Scenarios:**

1. **"Split a $50 dinner with Henry"**
   - Payer: You (the requester) - you paid the bill
   - Splitters: You ($25) + Henry ($25)
   - `payed_by_id`: Your member ID
   - `shares_attributes`: Array with 2 shares (you and Henry, each $25)

2. **"Henry paid $60 for groceries, split with me"**
   - Payer: Henry - he paid the bill
   - Splitters: Henry ($30) + You ($30)
   - `payed_by_id`: Henry's member ID
   - `shares_attributes`: Array with 2 shares (Henry and you, each $30)

3. **"I paid $90 for concert tickets, split 3 ways with Henry and Sarah"**
   - Payer: You (the requester)
   - Splitters: You ($30) + Henry ($30) + Sarah ($30)
   - `payed_by_id`: Your member ID
   - `shares_attributes`: Array with 3 shares (you, Henry, Sarah, each $30)

**Default Behavior:**
- Unless otherwise specified, assume the requester is the payer
- "Split with X" means the requester AND X are both splitting (2 people total)
- The payer should always be included in the shares_attributes array

---

## Commands

### init
Initialize the skill with Splitser credentials.

**Usage:**
```bash
npm start init <email> <password>
```

**Parameters:**
- `email` (required): Your Splitser account email
- `password` (required): Your Splitser account password

**Example:**
```bash
splitser init user@example.com mypassword
```

---

### lists
Retrieve all expense lists/groups.

**Usage:**
```bash
splitser lists [--archived]
```

**Flags:**
- `--archived`: Show archived lists instead of active ones

**Examples:**
```bash
splitser lists
splitser lists --archived
```

---

### members
Get all members of a specific list.

**Usage:**
```bash
splitser members <list-id>
```

**Parameters:**
- `list-id` (required): UUID of the list

**Example:**
```bash
splitser members 9b991c11-1442-4120-bf8f-5f9c4c2ad0de
```

**Output:**
Displays member details including:
- Nickname
- Email
- Member ID (needed for creating expenses)
- Full name
- Initials

---

### expenses
Get all expenses/transactions from a specific list.

**Usage:**
```bash
splitser expenses <list-id>
```

**Parameters:**
- `list-id` (required): UUID of the list

**Example:**
```bash
splitser expenses 9b991c11-1442-4120-bf8f-5f9c4c2ad0de
```

**Output:**
Displays expense details including:
- Name and amount
- Expense ID
- Payment date
- Status (active/deleted/settled)
- Category
- Receipt image URL (if available)

---

### create-expense
Create a new expense in a list.

**Usage:**
```bash
splitser create-expense <list-id> <name> <amount> <payer-id>
```

**Parameters:**
- `list-id` (required): UUID of the list to add the expense to
- `name` (required): Description of the expense
- `amount` (required): Amount in dollars (e.g., 25.50)
- `payer-id` (required): UUID of the member who paid

**Example:**
```bash
splitser create-expense 9b991c11-1442-4120-bf8f-5f9c4c2ad0de "Lunch at Cafe" 45.75 41f925fe-004e-40e2-8a16-e3f639b55e7f
```

**Important Notes:**
- `payer-id` is the person who PAID the bill (usually the requester)
- To split the expense, you must include shares_attributes with ALL people splitting (including the payer)
- See the "Payer vs. Splitters" section above for detailed examples
- The basic CLI command creates a simple expense; for complex splits, use the library API

---

### upload-image
Upload a receipt image to an existing expense.

**Usage:**
```bash
splitser upload-image <expense-id> <image-path>
```

**Parameters:**
- `expense-id` (required): UUID of the expense
- `image-path` (required): Local path to the receipt image

**Example:**
```bash
splitser upload-image 1cd082cc-51ec-483c-9fee-b1ec876f26db ./receipt.jpg
```

---

### delete-expense
Delete an existing expense.

**Usage:**
```bash
splitser delete-expense <expense-id>
```

**Parameters:**
- `expense-id` (required): UUID of the expense to delete

**Example:**
```bash
splitser delete-expense b3e63512-0d57-4610-9d77-d28e05904933
```

**Notes:**
- Only the creator or list owner can delete expenses
- Deleted expenses are removed from balance calculations
- The expense may still appear in the list with status="deleted"

---

## API Reference

### SplitserClient Class

The main client for interacting with the Splitser API.

#### Methods

##### `async init(email: string, password: string): Promise<void>`
Initialize the client with credentials and authenticate.

##### `async getLists(params?: ListQueryParams): Promise<SplitserList[]>`
Get all lists with optional filtering.

**Parameters:**
- `params.page` (number): Page number (0-indexed)
- `params.per_page` (number): Results per page
- `params.filter.archived` (boolean): Filter archived lists

##### `async getMembers(listId: string, params?: MembersQueryParams): Promise<MembersResponse>`
Get members of a specific list.

**Parameters:**
- `listId` (string): UUID of the list
- `params.page` (number): Page number (1-indexed)
- `params.per_page` (number): Results per page
- `params.filter.member_set` (string): Filter by 'available' or 'archived'

##### `async getListItems(listId: string, params?: ListItemsQueryParams): Promise<ListItemsResponse>`
Get expenses/transactions from a specific list.

**Parameters:**
- `listId` (string): UUID of the list
- `params.page` (number): Page number (1-indexed)
- `params.per_page` (number): Results per page
- `params.sort.payed_on` (string): Sort by payment date ('asc'/'desc')
- `params.sort.created_at` (string): Sort by creation date ('asc'/'desc')
- `params.filter.settled` (boolean): Filter by settled status

##### `async createExpense(listId: string, expense: Expense): Promise<any>`
Create a new expense in a list.

**Parameters:**
- `listId` (string): UUID of the list
- `expense` (Expense): Complete expense object

##### `async deleteExpense(expenseId: string): Promise<void>`
Delete an existing expense.

**Parameters:**
- `expenseId` (string): UUID of the expense to delete

##### `async uploadExpenseImage(expenseId: string, imagePath: string): Promise<any>`
Upload a receipt image to an expense.

**Parameters:**
- `expenseId` (string): UUID of the expense
- `imagePath` (string): Local file path

##### `static createAmount(dollars: number, currency?: string): MoneyAmount`
Helper to create money amount objects.

**Parameters:**
- `dollars` (number): Amount in dollars
- `currency` (string): Currency code (default: 'USD')

**Returns:** `{ fractional: number, currency: string }`

##### `static getLocalDate(date?: Date): string`
Get local date string in YYYY-MM-DD format using machine's local timezone.

**Parameters:**
- `date` (Date): Date object (default: current date)

**Returns:** Date string in YYYY-MM-DD format (e.g., '2026-02-11')

**Note:** Uses local timezone, not UTC. This ensures dates match what the user sees on their machine.

##### `static generateUUID(): string`
Generate a random UUID v4.

---

## Types

### Expense
```typescript
interface Expense {
  id: string;                          // UUID
  category: {
    id: number;                        // Category ID (999999999 for auto)
    category_source: string;           // 'auto' or manual
  };
  name: string;                        // Description
  payed_by_id: string;                // Member UUID who paid
  payed_on: string;                   // Date (YYYY-MM-DD)
  source_amount: MoneyAmount;         // Original amount
  amount: MoneyAmount;                // Converted amount
  exchange_rate: number;              // Exchange rate
  shares_attributes: ExpenseShare[];  // Split configuration
}
```

### MoneyAmount
```typescript
interface MoneyAmount {
  fractional: number;  // Amount in cents
  currency: string;    // ISO 4217 currency code
}
```

### ExpenseShare
```typescript
interface ExpenseShare {
  id?: string;           // Member UUID
  member_id: string;     // Member UUID who owes
  meta: {
    type: string;        // 'exact', 'percentage', etc.
    multiplier: number;  // Share weight
  };
  source_amount: MoneyAmount;
}
```

---

## Usage Examples

### Library Usage

```typescript
import { SplitserClient } from 'splitser-skill';

const client = new SplitserClient();

// Initialize (only once)
await client.init('user@example.com', 'password');

// Get lists
const lists = await client.getLists({ page: 0, per_page: 15 });
console.log('My lists:', lists);

// Create expense
const expense = {
  id: SplitserClient.generateUUID(),
  category: { id: 999999999, category_source: 'auto' },
  name: 'Dinner',
  payed_by_id: 'member-uuid',
  payed_on: SplitserClient.getLocalDate(),
  source_amount: SplitserClient.createAmount(75.50),
  amount: SplitserClient.createAmount(75.50),
  exchange_rate: 1,
  shares_attributes: [
    {
      member_id: 'member-uuid',
      meta: { type: 'exact', multiplier: 0 },
      source_amount: SplitserClient.createAmount(75.50)
    }
  ]
};

await client.createExpense('list-uuid', expense);

// Upload receipt
await client.uploadExpenseImage('expense-uuid', './receipt.png');
```

### Split a restaurant bill 3 ways

**Scenario:** Alice paid $120 for dinner and wants to split it 3 ways with Bob and Charlie.

```typescript
const expense = {
  id: SplitserClient.generateUUID(),
  name: 'Dinner at Italian Restaurant',
  payed_by_id: 'alice-uuid',  // Alice paid the bill
  payed_on: SplitserClient.getLocalDate(),
  source_amount: SplitserClient.createAmount(120.00),
  amount: SplitserClient.createAmount(120.00),
  exchange_rate: 1,
  shares_attributes: [  // ALL 3 people splitting the bill
    {
      member_id: 'alice-uuid',  // Alice owes $40 (but already paid $120)
      meta: { type: 'exact', multiplier: 1 },
      source_amount: SplitserClient.createAmount(40.00)
    },
    {
      member_id: 'bob-uuid',  // Bob owes Alice $40
      meta: { type: 'exact', multiplier: 1 },
      source_amount: SplitserClient.createAmount(40.00)
    },
    {
      member_id: 'charlie-uuid',  // Charlie owes Alice $40
      meta: { type: 'exact', multiplier: 1 },
      source_amount: SplitserClient.createAmount(40.00)
    }
  ]
};

await client.createExpense('list-uuid', expense);
// Result: Bob and Charlie each owe Alice $40
```

### Split a bill 50/50

**Scenario:** You paid $60 for groceries and want to split evenly with your roommate.

```typescript
const expense = {
  id: SplitserClient.generateUUID(),
  name: 'Groceries',
  payed_by_id: 'your-uuid',  // You paid
  payed_on: SplitserClient.getLocalDate(),
  source_amount: SplitserClient.createAmount(60.00),
  amount: SplitserClient.createAmount(60.00),
  exchange_rate: 1,
  shares_attributes: [  // Both people splitting 50/50
    {
      member_id: 'your-uuid',  // You owe $30 (already paid $60)
      meta: { type: 'exact', multiplier: 1 },
      source_amount: SplitserClient.createAmount(30.00)
    },
    {
      member_id: 'roommate-uuid',  // Roommate owes you $30
      meta: { type: 'exact', multiplier: 1 },
      source_amount: SplitserClient.createAmount(30.00)
    }
  ]
};

await client.createExpense('list-uuid', expense);
// Result: Roommate owes you $30
```

---

## Environment

- **Node.js**: 18.0.0 or higher
- **TypeScript**: 5.3.3 or higher
- **Config Location**: `~/.splitser/config.json`

## Security

- Credentials are stored locally in `~/.splitser/config.json`
- Session cookies are encrypted and maintained automatically
- Never commit your config file to version control
- The `.gitignore` includes config files by default

## Error Handling

All API methods throw errors with descriptive messages:

```typescript
try {
  await client.createExpense(listId, expense);
} catch (error) {
  console.error('Failed:', error.message);
  // Handle authentication, validation, or network errors
}
```

Common error codes:
- `401 Unauthorized`: Session expired, re-run `init`
- `400 Bad Request`: Invalid parameters
- `422 Unprocessable Entity`: Validation failed
- `404 Not Found`: List/expense not found

## Dependencies

- `node-fetch`: HTTP client
- `form-data`: Multipart form data handling

## Links

- [Full API Documentation](../SPLITSER_API_DOCS.md)
- [Splitser Web App](https://app.splitser.com)
