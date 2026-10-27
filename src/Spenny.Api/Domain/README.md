# Domain (spending month projection)

| Folder | Purpose |
|--------|---------|
| **Spending/** | Series, exceptions, occurrences, categories, frequency |
| **Scheduling/** | Recurrence expansion, weekend adjustment, exception merge rules |
| **Projection/** | Month burndown and coming-up (`SpendingMonthProjection`); range total (`AmountRequiredBy`) |

Entry points: `Projection/SpendingMonthProjection.Project(...)`, `Projection/AmountRequiredBy.Sum(...)`.
