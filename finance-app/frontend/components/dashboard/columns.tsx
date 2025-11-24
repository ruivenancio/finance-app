"use client"

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { TransactionActions } from "./transaction-actions";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Transaction = {
    id: string
    description: string
    amount: number
    date: string
    category?: {
        name: string
    }
}

export const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: "date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => format(new Date(row.getValue("date")), "PPP"),
    },
    {
        accessorKey: "description",
        header: "Description",
    },
    {
        accessorKey: "category.name",
        header: "Category",
        cell: ({ row }) => {
            const categoryName = row.original.category?.name
            return categoryName || "Uncategorized"
        },
    },
    {
        accessorKey: "amount",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"));
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount);
            return <div className={`text-right font-medium ${amount < 0 ? "text-red-500" : "text-green-500"}`}>{formatted}</div>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <TransactionActions transaction={row.original} />,
    },
]
