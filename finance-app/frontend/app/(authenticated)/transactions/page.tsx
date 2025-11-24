"use client";

import { useEffect, useState } from "react";
import { transactionsDal } from "@/dal/transactions";
import { DataTable } from "@/components/dashboard/data-table";
import { columns } from "@/components/dashboard/columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { TransactionForm } from "@/components/forms/transaction-form";
import { TransactionsProvider } from "@/components/dashboard/transactions-context";

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);

    const fetchTransactions = async () => {
        try {
            const response = await transactionsDal.getAll();
            setTransactions(response.data);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    return (
        <TransactionsProvider value={{ refreshTransactions: fetchTransactions }}>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
                    <div className="flex items-center space-x-2">
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Add Transaction
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Transaction</DialogTitle>
                                </DialogHeader>
                                <TransactionForm
                                    onSuccess={() => {
                                        setIsAddOpen(false);
                                        fetchTransactions();
                                    }}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <div className="rounded-md border">
                    {loading ? (
                        <div className="p-8 text-center">Loading...</div>
                    ) : (
                        <DataTable columns={columns} data={transactions} />
                    )}
                </div>
            </div>
        </TransactionsProvider>
    );
}
