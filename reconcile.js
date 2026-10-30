// Payment reconciliation.
//
// Reads payments.jsonl and works out how much money we actually collected.
// Run:  node reconcile.js

const fs = require("fs");

let total = 0;
let count = 0;
const latestTransactions = new Map();

const lines = fs.readFileSync("payments.jsonl", "utf8").split("\n").filter((l) => l.length > 0);
for (const line of lines) {
  try {
    const event = JSON.parse(line);
    if (!event.txn_id) continue;
    const existing = latestTransactions.get(event.txn_id);

    if (!existing || new Date(event.ts) > new Date(existing.ts)) {
        latestTransactions.set(event.txn_id, event);
    }
} catch (error) {
    // console.error(`Error parsing line: ${line}`);
    continue;
  }
}

const successfulPayments = Array.from(latestTransactions.values()).filter((event) => event.status === "success");
total = successfulPayments.reduce((sum, event) => sum + Number(event.amount), 0);
count = successfulPayments.length;


const expected = parseInt(fs.readFileSync("expected.txt", "utf8").trim(), 10);

if (count !== expected) {
  console.log(`Check failed: counted ${count} successful payments, expected ${expected}.`);
  console.log("Something in the data isn't being handled the way the README describes.");
} else {
  console.log(`Check passed: ${count} successful payments.`);
  console.log(`Your code: KOYA-${Math.round(total)}`);
}
