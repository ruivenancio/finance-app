import { z } from "zod";

export const accountSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    type: z.enum(["BANK", "STOCK", "CARD"], {
        required_error: "Please select an account type",
    }),
    balance: z.coerce.number().min(0, "Balance must be positive"),
});

export const transactionSchema = z.object({
    description: z.string().min(2, "Description must be at least 2 characters"),
    amount: z.coerce.number().refine((val) => val !== 0, "Amount cannot be zero"),
    date: z.date({
        required_error: "Please select a date",
    }),
    categoryId: z.string().optional(),
    accountId: z.string().min(1, "Please select an account"),
    toAccountId: z.string().optional(),
    type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
}).superRefine((data, ctx) => {
    if (data.type === "TRANSFER") {
        if (!data.toAccountId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please select a destination account",
                path: ["toAccountId"],
            });
        }
        if (data.accountId === data.toAccountId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Source and destination accounts must be different",
                path: ["toAccountId"],
            });
        }
    } else {
        if (!data.categoryId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please select a category",
                path: ["categoryId"],
            });
        }
    }
});

export const categorySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    type: z.enum(["INCOME", "EXPENSE"], {
        required_error: "Please select a type",
    }),
    parentId: z.string().optional(),
});

export const stockSchema = z.object({
    symbol: z.string().min(1, "Symbol is required").toUpperCase(),
    quantity: z.coerce.number().min(0.000001, "Quantity must be positive"),
    averagePrice: z.coerce.number().min(0, "Price must be positive"),
    accountId: z.string().min(1, "Please select an account"),
});

export const stockTransactionSchema = z.object({
    type: z.enum(["BUY", "SELL", "DIVIDEND"]),
    quantity: z.coerce.number().min(0, "Quantity must be positive").optional(),
    price: z.coerce.number().min(0, "Price must be positive").optional(),
    amount: z.coerce.number().min(0.01, "Amount must be positive"),
    date: z.date({
        required_error: "Please select a date",
    }),
}).refine((data) => {
    if (data.type !== "DIVIDEND") {
        return data.quantity && data.quantity > 0;
    }
    return true;
}, {
    message: "Quantity is required for Buy/Sell",
    path: ["quantity"],
});

export type AccountFormValues = z.infer<typeof accountSchema>;
export type TransactionFormValues = z.infer<typeof transactionSchema>;
export type CategoryFormValues = z.infer<typeof categorySchema>;
export type StockFormValues = z.infer<typeof stockSchema>;
export type StockTransactionFormValues = z.infer<typeof stockTransactionSchema>;
