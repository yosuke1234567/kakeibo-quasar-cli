export interface OptionCategory {
    type: string,
    color: string
}

export interface SingleExpenseDoc {
    amount: number
    category: string
    createdAt: number
    date: string
    expenseMonthIndex: number
    memo: string
}
