# Splitser Skill

Expense tracking and bill splitting automation using the Splitser API.

## Description

This skill allows you to manage expenses, split bills, and track shared costs through the Splitser platform. It handles authentication, expense creation, receipt uploads, and list management.

## Configuration

Before using this skill, initialize it with your Splitser credentials:

```bash
npm start init <email> <password>
```

Your credentials are securely stored in `~/.splitser/config.json` and session cookies are maintained automatically.

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
npm start init user@example.com mypassword
```

---

### lists
Retrieve all expense lists/groups.

**Usage:**
```bash
npm start lists [--archived]
```

**Flags:**
- `--archived`: Show archived lists instead of active ones

**Examples:**
```bash
npm start lists
npm start lists --archived
```

---

### create-expense
Create a new expense in a list.

**Usage:**
```bash
npm start create-expense <list-id> <name> <amount> <payer-id>
```

**Parameters:**
- `list-id` (required): UUID of the list to add the expense to
- `name` (required): Description of the expense
- `amount` (required): Amount in dollars (e.g., 25.50)
- `payer-id` (required): UUID of the member who paid

**Example:**
```bash
npm start create-expense 9b991c11-1442-4120-bf8f-5f9c4c2ad0de "Lunch at Cafe" 45.75 41f925fe-004e-40e2-8a16-e3f639b55e7f
```

---

### upload-image
Upload a receipt image to an existing expense.

**Usage:**
```bash
npm start upload-image <expense-id> <image-path>
```

**Parameters:**
- `expense-id` (required): UUID of the expense
- `image-path` (required): Local path to the receipt image

**Example:**
```bash
npm start upload-image 1cd082cc-51ec-483c-9fee-b1ec876f26db ./receipt.jpg
```

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

##### `async createExpense(listId: string, expense: Expense): Promise<any>`
Create a new expense in a list.

**Parameters:**
- `listId` (string): UUID of the list
- `expense` (Expense): Complete expense object

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
  payed_on: '2026-02-11',
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

### Split Bill Among Multiple People

```typescript
const expense = {
  id: SplitserClient.generateUUID(),
  name: 'Restaurant Bill',
  payed_by_id: 'alice-uuid',
  payed_on: '2026-02-11',
  source_amount: SplitserClient.createAmount(120.00),
  amount: SplitserClient.createAmount(120.00),
  exchange_rate: 1,
  shares_attributes: [
    {
      member_id: 'alice-uuid',
      meta: { type: 'exact', multiplier: 1 },
      source_amount: SplitserClient.createAmount(40.00)
    },
    {
      member_id: 'bob-uuid',
      meta: { type: 'exact', multiplier: 1 },
      source_amount: SplitserClient.createAmount(40.00)
    },
    {
      member_id: 'charlie-uuid',
      meta: { type: 'exact', multiplier: 1 },
      source_amount: SplitserClient.createAmount(40.00)
    }
  ]
};

await client.createExpense('list-uuid', expense);
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
