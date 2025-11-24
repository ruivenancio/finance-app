"use client";

import { useEffect, useState } from "react";
import { TransactionForm } from "@/components/forms/transaction-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/dashboard/data-table";
import { columns } from "@/components/dashboard/columns";
import { transactionsDal } from "@/dal/transactions";

export default function NewTransactionPage() {
    const [transactions, setTransactions] = useState<any[]>([]);

    const fetchTransactions = async () => {
        try {
            const response = await transactionsDal.getAll();
            setTransactions(response.data);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Transaction Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <TransactionForm onSuccess={fetchTransactions} />

                        <div className="rounded-md border">
                            <DataTable columns={columns} data={transactions} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
