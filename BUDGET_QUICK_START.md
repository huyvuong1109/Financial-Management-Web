# Budget Feature - Quick Start Guide

## What is a Budget?

A budget is a spending limit for a specific category in a specific month. It helps you control your spending and get alerts when you're approaching your limit.

**Example:**
- **Month:** December 2024
- **Category:** Food & Dining
- **Budget Amount:** 1,000,000 VND
- **Alert Threshold:** 80%

When you spend money in the Food category:
- At 0 VND spent: 0% of budget used ✓
- At 200,000 VND: 20% of budget used ✓
- At 800,000 VND: 80% of budget used ⚠️ (Alert!)
- At 1,000,000 VND: 100% of budget used ❌ (Over limit)
- At 1,200,000 VND: 120% of budget used ❌ (Exceeded)

## How to Use Budget Feature

### Step 1: Access Budget Management
1. Log in as Admin
2. Click **"Budget Management"** in the sidebar
3. You'll see existing budgets for the current month

### Step 2: Create a New Budget
1. Click **"+ Add Budget"** button
2. Select **Month** (defaults to current month)
3. Fill the form:
   - **Category:** Choose spending category (Food, Transportation, etc.)
   - **Budget Amount:** Enter the limit (e.g., 1,000,000)
   - **Alert Threshold:** Set when alert triggers (default: 80%)
4. Click **"Create Budget"**

### Step 3: Track Your Spending
- Budgets automatically update when transactions are approved
- Visual progress bar shows your spending percentage:
  - 🟢 **Green:** Less than alert threshold
  - 🟠 **Orange:** At or near alert threshold
  - 🔴 **Red:** Over budget limit

### Step 4: Get Alerts
When spending reaches your alert threshold:
- ⚠️ Badge appears on the budget card
- 📧 Email notification sent to your account
- 💬 Optional SMS notification

### Step 5: Edit or Delete Budgets
- **Edit:** Click "Edit" button to change amount or threshold
- **Delete:** Click "Delete" button (with confirmation)
- **View:** See current spending vs. budget limit

## Budget Example Scenarios

### Scenario 1: Normal Spending (Within Budget)
```
Budget: Food & Dining - December 2024
Limit: 1,000,000 VND (Alert at 80%)

Transaction 1: -250,000 (Coffee shop)
  → Spent: 250,000 / 1,000,000 (25%) 🟢

Transaction 2: -350,000 (Restaurant)
  → Spent: 600,000 / 1,000,000 (60%) 🟢

Total Progress: 60% - Still comfortable
```

### Scenario 2: Approaching Limit (Alert Triggered)
```
Budget: Food & Dining - December 2024
Limit: 1,000,000 VND (Alert at 80%)

Previous spending: 600,000
Transaction 3: -250,000 (Grocery shopping)
  → Spent: 850,000 / 1,000,000 (85%) 🟠

⚠️ ALERT! Spending has reached 85%
📧 Email sent: "You've spent 85% of your Food & Dining budget"
```

### Scenario 3: Over Budget (Limit Exceeded)
```
Budget: Food & Dining - December 2024
Limit: 1,000,000 VND (Alert at 80%)

Previous spending: 950,000
Transaction 4: -200,000 (Birthday dinner)
  → Spent: 1,150,000 / 1,000,000 (115%) 🔴

❌ OVER BUDGET! 
📧 Email sent: "You've exceeded your Food & Dining budget"
Amount over: 150,000 VND
```

## Budget Best Practices

### 1. Set Realistic Amounts
- Review your past 3 months of spending
- Set budget 10-20% higher than average
- Leave room for unexpected expenses

### 2. Choose Smart Thresholds
- **Conservative (70%):** Gets alerts early, good for high spenders
- **Moderate (80%):** Balanced approach, good for most people
- **Aggressive (90%):** Less frequent alerts, requires discipline

### 3. Create Budgets by Need
- Essential categories: Food, Utilities, Transportation
- Discretionary: Entertainment, Dining Out
- Savings goals: Emergency Fund, Investments

### 4. Review Monthly
- Check each month's actual vs. budgeted
- Adjust budget amounts based on reality
- Update thresholds if needed

### 5. Use Multiple Budgets
- Create separate budgets for each category
- Track total spending across all budgets
- View monthly summary for all budgets

## Common Questions

**Q: Can I have multiple budgets for the same category?**
A: No, you can only have one budget per category per month. To change it, edit the existing budget.

**Q: What happens when I exceed my budget?**
A: The budget shows "Over Budget" in red. You still can make transactions, but the alert flag remains active.

**Q: Can I reset a budget mid-month?**
A: Yes, edit the budget and change the amount. You can also delete and create a new one.

**Q: How does alert notification work?**
A: When you hit your alert threshold, an event is sent to the Notification Service which sends you an email. SMS notifications are optional.

**Q: Can I change the alert threshold after creating budget?**
A: Yes, click "Edit" on the budget card and adjust the threshold percentage.

**Q: What if I need a budget for a past month?**
A: You can create budgets for any month using the month selector. Change the month first, then create the budget.

**Q: How are transactions connected to budgets?**
A: When you approve a transaction with a specific category, it automatically updates the budget spent amount for that category in the current month.

## Troubleshooting

### Issue: Budget not updating after transaction
- **Solution:** Ensure transaction was approved (not pending or rejected)
- Check that the category matches your budget's category
- Verify you're viewing the correct month

### Issue: Can't create budget
- **Solution:** Ensure category is selected
- Check if budget already exists for same category/month
- Verify you have admin permissions

### Issue: Alert not received
- **Solution:** Check if email is registered in account
- Verify threshold was reached (spent >= threshold %)
- Check spam folder for email

### Issue: Progress bar shows incorrect percentage
- **Solution:** Refresh the page to reload data
- Verify budget amount is correct
- Check for pending transactions that haven't been approved yet

## Quick Reference

### Month Format
Use YYYY-MM format in month selector
- Example: 2024-12 (December 2024)
- Example: 2025-01 (January 2025)

### Spending Percentage Formula
```
Spending % = (Amount Spent / Budget Amount) × 100
```

### Alert Trigger
```
Alert sends when: Spending % ≥ Alert Threshold %
Example: If alert threshold is 80%, alert triggers when 800,000+ spent on 1,000,000 budget
```

### Color Coding
```
🟢 Green:  Spending < Alert Threshold
🟠 Orange: Spending ≥ Alert Threshold (< 100%)
🔴 Red:    Spending ≥ 100% (Over Budget)
```

## Tips & Tricks

1. **Set higher thresholds for variable spending**
   - Food, Entertainment: 85-90%
   - Set lower for fixed costs: 70-75%

2. **Create monthly checkpoints**
   - Review budget status on 15th and 30th
   - Make adjustments before month ends

3. **Use summary view**
   - See total budget vs. actual
   - Identify spending patterns
   - Plan next month's budgets

4. **Link budgets to income**
   - If monthly income is 10M
   - Create budgets totaling 8-9M
   - Keep 10-20% as buffer/savings

5. **Set category budgets strategically**
   - Transportation: 15% of income
   - Food: 25% of income
   - Utilities: 10% of income
   - Entertainment: 10% of income
   - Savings: 30% of income

## Visual Indicators

### Progress Bar Colors
```
┌─────────────────────────┐
│ ████████░░░░░░░░░░░░░░│ 35% (🟢 Normal)
├─────────────────────────┤
│ ████████████████░░░░░░│ 80% (🟠 Alert!)
├─────────────────────────┤
│ █████████████████████│ 100%+ (🔴 Over Budget)
└─────────────────────────┘
```

### Budget Card Information
```
┌─────────────────────┐
│ Category Name       │
│ Month: 2024-12      │
├─────────────────────┤
│ Budget: 1,000,000   │
│ Spent:    800,000   │
├─────────────────────┤
│ [████████░░░░░ 80%] │
│ ⚠️ Approaching Limit│
├─────────────────────┤
│ [Edit]  [Delete]    │
└─────────────────────┘
```

---

**Need more help?** Refer to the detailed implementation guide: `BUDGET_FEATURE_GUIDE.md`
