# Budget Management Feature - Implementation Guide

## Overview
A complete budgeting feature has been implemented for the Financial Management Web application. Users can:
- Set budgets by category and month
- Track spending against their budgets
- Receive alerts when approaching or exceeding budget limits
- View spending progress with visual indicators

## Architecture

### Backend Implementation (Bank Service)

#### 1. **Database Model** - `Budget.java`
```java
@Entity
@Table(name = "budgets")
public class Budget {
    - budgetId: Long (Primary Key)
    - accountId: String (Account reference)
    - categoryId: Long (Category reference)
    - monthYear: String (Format: YYYY-MM, e.g., "2024-12")
    - budgetAmount: BigDecimal (Total budget limit)
    - spent: BigDecimal (Amount spent to date)
    - alertThreshold: Integer (Alert percentage, default: 80%)
    - alertSent: Boolean (Flag to track if alert was sent)
    - createdAt, updatedAt: Timestamps
}
```

**Key Methods:**
- `getSpendingPercentage()`: Calculate percentage of budget spent
- `isExceeded()`: Check if spending exceeds budget limit
- `shouldTriggerAlert()`: Check if alert should be triggered

#### 2. **Repository** - `BudgetRepository.java`
Provides database operations:
- `findByAccountIdAndCategoryIdAndMonthYear()`: Get specific budget
- `findByAccountId()`: Get all budgets for an account
- `findByAccountIdAndMonthYear()`: Get budgets for a specific month
- `findBudgetsNeedingAlert()`: Get budgets that need alerts

#### 3. **DTOs** (Data Transfer Objects)
- **CreateBudgetRequest**: For creating new budgets
- **UpdateBudgetRequest**: For updating existing budgets
- **BudgetResponse**: For returning budget details
- **BudgetProgressDTO**: For displaying spending progress
- **BudgetSummaryDTO**: For monthly summary statistics

#### 4. **Service Layer** - `BudgetService.java`
Core business logic:
- `createBudget()`: Create new budget with validation
- `getBudgetById()`, `getBudgetsByAccountId()`, `getBudgetsByMonthYear()`: Retrieve budgets
- `updateBudget()`: Update budget details
- `deleteBudget()`: Delete budget
- `recordSpending()`: Update budget spent amount and trigger alerts
- `getProgress()`: Get spending progress for a budget
- `getMonthlyProgress()`: Get progress for all budgets in a month
- `getMonthlySummary()`: Get summary statistics for a month

#### 5. **REST API Controller** - `BudgetController.java`

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/budgets` | Create new budget |
| GET | `/api/budgets/{budgetId}` | Get budget by ID |
| GET | `/api/budgets/account/{accountId}` | Get all budgets for account |
| GET | `/api/budgets/account/{accountId}/month?monthYear=YYYY-MM` | Get budgets for specific month |
| PUT | `/api/budgets/{budgetId}` | Update budget |
| DELETE | `/api/budgets/{budgetId}` | Delete budget |
| GET | `/api/budgets/{budgetId}/progress` | Get spending progress |
| GET | `/api/budgets/account/{accountId}/progress?monthYear=YYYY-MM` | Get monthly progress |
| GET | `/api/budgets/account/{accountId}/summary?monthYear=YYYY-MM` | Get monthly summary |

#### 6. **Event Messaging** - `BudgetAlertEvent.java` & `BudgetAlertProducer.java`

**BudgetAlertEvent Structure:**
- budgetId, accountId, categoryName, monthYear
- budgetAmount, spent, spendingPercentage
- alertThreshold, exceeded, timestamp

**BudgetAlertProducer:**
- Sends alert events to ActiveMQ queue: `budget-alert-queue`
- Triggered when spending reaches alert threshold
- Integrates with Notification Service via message queue

#### 7. **Transaction Service Integration**
Updated `TransactionService.java` to:
- Inject `BudgetService`
- Call `recordBudgetSpending()` after transaction approval
- Automatically track spending against budgets
- Trigger alerts when needed

### Frontend Implementation

#### 1. **API Service** - `BudgetService.jsx`
```javascript
- createBudget(budgetData)
- getBudgetById(budgetId)
- getBudgetsByAccountId(accountId)
- getBudgetsByMonth(accountId, monthYear)
- updateBudget(budgetId, updateData)
- deleteBudget(budgetId)
- getBudgetProgress(budgetId)
- getMonthlyProgress(accountId, monthYear)
- getMonthlySummary(accountId, monthYear)
```

#### 2. **React Components** - `Budget.jsx`
**Features:**
- Month selector to view budgets for different months
- Create new budget form with validation
- Edit existing budgets
- Delete budgets with confirmation
- Visual progress bars with color coding:
  - Green: Normal (< threshold)
  - Orange: Warning (>= threshold but not exceeded)
  - Red: Exceeded (over limit)
- Alert badges for approaching/exceeded budgets
- Real-time spending percentage display
- Category selector with existing categories

#### 3. **Styling** - `Budget.css`
- Responsive grid layout for budget cards
- Mobile-friendly design
- Color-coded status indicators
- Form styling for create/edit functionality
- Progress bar visualization

#### 4. **Integration**
- Added Budget route to `main.jsx`
- Added Budget menu item to `Sidebar.jsx`
- Admin-only access control

## Usage Examples

### Backend API Usage

**Create a Budget:**
```bash
POST /api/budgets
{
  "accountId": "account-id-123",
  "categoryId": 1,
  "monthYear": "2024-12",
  "budgetAmount": 1000.00,
  "alertThreshold": 80
}
```

**Response:**
```json
{
  "budgetId": 1,
  "accountId": "account-id-123",
  "categoryId": 1,
  "categoryName": "Food & Dining",
  "monthYear": "2024-12",
  "budgetAmount": 1000.00,
  "spent": 0.00,
  "spendingPercentage": 0.0,
  "alertThreshold": 80,
  "alertSent": false,
  "exceeded": false,
  "createdAt": "2024-12-14T10:30:00",
  "updatedAt": "2024-12-14T10:30:00"
}
```

**Get Monthly Progress:**
```bash
GET /api/budgets/account/account-id-123/progress?monthYear=2024-12
```

**Response:**
```json
[
  {
    "budgetId": 1,
    "categoryName": "Food & Dining",
    "monthYear": "2024-12",
    "budgetAmount": 1000.00,
    "spent": 250.00,
    "remaining": 750.00,
    "spendingPercentage": 25.0,
    "alertThreshold": 80,
    "exceeded": false,
    "shouldAlert": false
  }
]
```

### Frontend Usage

**Example Scenario:**
1. User navigates to Budget Management page
2. Selects a month (default: current month)
3. Clicks "Add Budget" button
4. Fills form with:
   - Category: "Food & Dining"
   - Budget Amount: 1000.00
   - Alert Threshold: 80%
5. System creates budget: 0/1000.00
6. User makes a transaction for 250.00 in the Food category
7. Budget updates to: 250.00/1000.00 (25% spent)
8. User makes another transaction for 700.00
9. Budget updates to: 950.00/1000.00 (95% spent) - Alert triggered ⚠️
10. User receives notification about approaching budget limit

## Integration with Notification Service

When a budget alert is triggered:
1. `BudgetAlertProducer` sends `BudgetAlertEvent` to ActiveMQ
2. Queue: `budget-alert-queue`
3. Notification Service listens to queue and:
   - Sends email notification to user's registered email
   - Optionally sends SMS notification
   - Records alert in notification history

## Configuration

### Application Properties (`application.yaml`)
```yaml
spring:
  jms:
    activemq:
      broker-url: tcp://localhost:61616
      user: admin
      password: admin
```

### Dependencies Added (pom.xml)
```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-activemq</artifactId>
</dependency>
<dependency>
  <groupId>org.apache.activemq</groupId>
  <artifactId>activemq-client</artifactId>
</dependency>
```

## Database Migration

Run SQL to create budget table:
```sql
CREATE TABLE budgets (
  budget_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  account_id VARCHAR(255) NOT NULL,
  category_id BIGINT NOT NULL,
  month_year VARCHAR(7) NOT NULL,
  budget_amount DECIMAL(19, 2) NOT NULL,
  spent DECIMAL(19, 2) NOT NULL DEFAULT 0.00,
  alert_threshold INT NOT NULL DEFAULT 80,
  alert_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(category_id),
  FOREIGN KEY (account_id) REFERENCES accounts(account_id),
  UNIQUE KEY unique_budget (account_id, category_id, month_year)
);

CREATE INDEX idx_account_id ON budgets(account_id);
CREATE INDEX idx_account_month ON budgets(account_id, month_year);
CREATE INDEX idx_alert ON budgets(account_id, alert_sent);
```

## Features & Benefits

✅ **Monthly & Category-Based Budgets**
- Set different budgets for different spending categories
- Manage multiple budgets per month

✅ **Real-Time Spending Tracking**
- Automatic updates when transactions are recorded
- Accurate spending percentages

✅ **Smart Alerts**
- Configurable alert thresholds (default: 80%)
- Alert sent only once per budget to avoid spam
- Integration with email/SMS notifications

✅ **Visual Progress Indicators**
- Color-coded status (Green → Orange → Red)
- Clear percentage displays
- Responsive design

✅ **Budget Management**
- Create, edit, delete budgets
- View historical budget data
- Monthly summaries with statistics

✅ **Data Validation**
- Prevents duplicate budgets for same category/month
- Validates amount and threshold values
- Month format validation (YYYY-MM)

## Testing

### Test Scenarios

1. **Create Budget**
   - Create budget with valid data ✓
   - Prevent duplicate budgets for same category/month ✓
   - Validate month format ✓

2. **Update Spending**
   - Record transaction spending automatically ✓
   - Update spent amount correctly ✓
   - Calculate percentage accurately ✓

3. **Alert Triggering**
   - Trigger alert when threshold reached ✓
   - Send only one alert per budget ✓
   - Reset alert flag when budget is updated ✓

4. **Frontend**
   - Display budgets correctly ✓
   - Create/edit/delete with proper validation ✓
   - Show progress visually ✓
   - Handle loading and error states ✓

## Future Enhancements

- Recurring budgets (auto-create for next months)
- Budget templates for quick setup
- Advanced analytics and trends
- Budget comparison (vs. previous months)
- Spending recommendations
- Budget sharing for family accounts
- Mobile app support
