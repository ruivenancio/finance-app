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
    categoryId: z.string().min(1, "Please select a category"),
    accountId: z.string().min(1, "Please select an account"),
});

export const categorySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    type: z.enum(["INCOME", "EXPENSE"], {
        required_error: "Please select a type",
    }),
    parentId: z.string().optional(),
});

export type AccountFormValues = z.infer<typeof accountSchema>;
export type TransactionFormValues = z.infer<typeof transactionSchema>;
export type CategoryFormValues = z.infer<typeof categorySchema>;
