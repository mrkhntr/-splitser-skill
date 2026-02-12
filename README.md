# Splitser Skill

OpenClaw-compatible skill for automating expense tracking with the Splitser API.

## Features

- 🔐 Secure local credential storage
- 📝 Create expenses programmatically
- 📸 Upload receipt images
- 📋 List and filter expense groups
- 💰 Automatic currency conversion handling
- 🔄 Session management with auto-refresh

## Installation

```bash
cd splitser-skill
npm install
npm run build
```

## Quick Start

### 1. Initialize with your credentials

```bash
npm start init your-email@example.com your-password
```

This will:
- Authenticate with Splitser
- Save your session locally to `~/.splitser/config.json`
- Keep you logged in for future requests

### 2. Use the skill

```bash
# Get all active lists
npm start lists

# Get archived lists
npm start lists --archived

# Create an expense
npm start create-expense <list-id> "Coffee" 4.50 <your-member-id>

# Upload a receipt image
npm start upload-image <expense-id> ./receipt.jpg
```

## Usage as a Library

You can also use this as a Node.js library:

```typescript
import { SplitserClient } from './dist/index.js';

const client = new SplitserClient();

// Initialize (only needed once)
await client.init('your-email@example.com', 'your-password');

// Get lists
const lists = await client.getLists({ 
  page: 0, 
  per_page: 15 
});

// Create an expense
const expense = {
  id: SplitserClient.generateUUID(),
  category: {
    id: 999999999,
    category_source: 'auto'
  },
  name: 'Lunch',
  payed_by_id: 'your-member-uuid',
  payed_on: '2026-02-11',
  source_amount: SplitserClient.createAmount(25.00),
  amount: SplitserClient.createAmount(25.00),
  exchange_rate: 1,
  shares_attributes: [
    {
      member_id: 'your-member-uuid',
      meta: { type: 'exact', multiplier: 0 },
      source_amount: SplitserClient.createAmount(25.00)
    }
  ]
};

await client.createExpense('list-uuid', expense);

// Upload receipt
await client.uploadExpenseImage('expense-uuid', './receipt.jpg');
```

## API Methods

### `init(email, password)`
Initialize the client with your Splitser credentials. This must be called before using other methods.

### `getLists(params?)`
Retrieve expense lists with optional filtering.

**Parameters:**
- `page` (number): Page number (0-indexed)
- `per_page` (number): Results per page
- `filter.archived` (boolean): Show archived lists

### `createExpense(listId, expense)`
Create a new expense in a specific list.

**Parameters:**
- `listId` (string): UUID of the list
- `expense` (Expense): Expense object (see types)

### `uploadExpenseImage(expenseId, imagePath)`
Upload a receipt image to an existing expense.

**Parameters:**
- `expenseId` (string): UUID of the expense
- `imagePath` (string): Local path to image file

### Helper Methods

#### `SplitserClient.createAmount(dollars, currency?)`
Convert dollar amount to fractional representation.

```typescript
SplitserClient.createAmount(12.34, 'USD')
// Returns: { fractional: 1234, currency: 'USD' }
```

#### `SplitserClient.generateUUID()`
Generate a random UUID v4 for new expenses.

## Configuration

Configuration is stored in `~/.splitser/config.json`:

```json
{
  "email": "your-email@example.com",
  "password": "your-password",
  "sessionCookie": "encrypted-session-token"
}
```

**Security Note:** Keep this file secure as it contains your credentials and session token.

## Currency Handling

All amounts use fractional representation (cents):

```typescript
// $12.34
{
  fractional: 1234,
  currency: 'USD'
}

// €50.00
{
  fractional: 5000,
  currency: 'EUR'
}
```

## Error Handling

All methods throw errors for:
- Authentication failures (401)
- Invalid requests (400, 422)
- Server errors (500)

```typescript
try {
  await client.createExpense(listId, expense);
} catch (error) {
  console.error('Failed to create expense:', error.message);
}
```

## Full API Documentation

See [API Documentation](../SPLITSER_API_DOCS.md) for complete endpoint reference.

## OpenClaw Integration

This skill can be used with OpenClaw or similar automation systems:

1. Initialize once with credentials
2. Call methods programmatically from your automation scripts
3. Session is maintained automatically across requests

## Examples

### Split a restaurant bill

```typescript
const expense = {
  id: SplitserClient.generateUUID(),
  name: 'Dinner at Italian Restaurant',
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

await client.createExpense(listId, expense);
```

## License

MIT
