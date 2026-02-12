#!/usr/bin/env node

import { SplitserClient } from './client.js';
import type { Expense } from './types.js';

/**
 * Splitser Skill - OpenClaw compatible skill for expense tracking
 */

// Export the client for use as a library
export { SplitserClient };
export * from './types.js';

// CLI usage example
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const client = new SplitserClient();

  try {
    switch (command) {
      case 'init':
        {
          const email = args[1];
          const password = args[2];
          
          if (!email || !password) {
            console.error('Usage: splitser-skill init <email> <password>');
            process.exit(1);
          }
          
          await client.init(email, password);
          console.log('✓ Splitser skill initialized successfully');
        }
        break;

      case 'lists':
        {
          const archived = args[1] === '--archived';
          const lists = await client.getLists({
            page: 0,
            per_page: 15,
            filter: archived ? { archived: true } : undefined
          });
          console.log('Lists:', JSON.stringify(lists, null, 2));
        }
        break;

      case 'members':
        {
          const listId = args[1];
          
          if (!listId) {
            console.error('Usage: splitser-skill members <list-id>');
            process.exit(1);
          }

          const result = await client.getMembers(listId, {
            page: 1,
            per_page: 150,
            filter: { member_set: 'available' }
          });
          
          console.log('\nMembers:');
          result.data.forEach(({ member }) => {
            console.log(`  ${member.nickname} (${member.email})`);
            console.log(`    ID: ${member.id}`);
            console.log(`    Full Name: ${member.full_name}`);
            console.log(`    Initials: ${member.avatar.initials}`);
            console.log('');
          });
          console.log(`Total: ${result.pagination.total_entries} members`);
        }
        break;

      case 'create-expense':
        {
          const listId = args[1];
          const name = args[2];
          const amount = parseFloat(args[3]);
          const payerId = args[4];
          
          if (!listId || !name || !amount || !payerId) {
            console.error('Usage: splitser-skill create-expense <list-id> <name> <amount> <payer-id>');
            process.exit(1);
          }

          const expenseId = SplitserClient.generateUUID();
          const expense: Expense = {
            id: expenseId,
            category: {
              id: 999999999,
              category_source: 'auto'
            },
            name,
            payed_by_id: payerId,
            payed_on: new Date().toISOString().split('T')[0],
            source_amount: SplitserClient.createAmount(amount),
            amount: SplitserClient.createAmount(amount),
            exchange_rate: 1,
            shares_attributes: [
              {
                id: payerId,
                member_id: payerId,
                meta: {
                  type: 'exact',
                  multiplier: 0
                },
                source_amount: SplitserClient.createAmount(amount)
              }
            ]
          };

          const result = await client.createExpense(listId, expense);
          console.log('✓ Expense created:', JSON.stringify(result, null, 2));
        }
        break;

      case 'upload-image':
        {
          const expenseId = args[1];
          const imagePath = args[2];
          
          if (!expenseId || !imagePath) {
            console.error('Usage: splitser-skill upload-image <expense-id> <image-path>');
            process.exit(1);
          }

          const result = await client.uploadExpenseImage(expenseId, imagePath);
          console.log('✓ Image uploaded:', JSON.stringify(result, null, 2));
        }
        break;

      case 'help':
      default:
        console.log(`
Splitser Skill - Expense tracking automation

Usage:
  splitser-skill init <email> <password>          Initialize with credentials
  splitser-skill lists [--archived]               Get all lists
  splitser-skill members <list-id>                Get members of a list
  splitser-skill create-expense <list-id> <name> <amount> <payer-id>
  splitser-skill upload-image <expense-id> <image-path>
  splitser-skill help                             Show this help

Examples:
  # Initialize
  splitser-skill init user@example.com mypassword

  # Get active lists
  splitser-skill lists

  # Get archived lists
  splitser-skill lists --archived

  # Get members of a list
  splitser-skill members 9b991c11-1442-4120-bf8f-5f9c4c2ad0de

  # Create an expense
  splitser-skill create-expense abc-123 "Dinner" 45.50 user-uuid-123

  # Upload receipt image
  splitser-skill upload-image expense-uuid-456 ./receipt.jpg

Configuration is stored in: ~/.splitser/config.json
        `);
        break;
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
