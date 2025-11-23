"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import Link from "next/link";

interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    accountId: string;
    categoryId: string;
    category?: { name: string };
}

interface Account {
    id: string;
    name: string;
}

interface Category {
    id: string;
    name: string;
    type: string;
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState(0);
    const [accountId, setAccountId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [type, setType] = useState("EXPENSE"); // INCOME or EXPENSE
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // New Category State
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    const fetchData = async () => {
        try {
            const [txRes, accRes, catRes] = await Promise.all([
                api.get("/transactions/"),
                api.get("/accounts/"),
                api.get("/categories/")
            ]);
            setTransactions(txRes.data);
            setAccounts(accRes.data);
            setCategories(catRes.data);
            if (accRes.data.length > 0 && !accountId) {
                setAccountId(accRes.data[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const finalAmount = type === "EXPENSE" ? -Math.abs(Number(amount)) : Math.abs(Number(amount));

            await api.post("/transactions/", {
                description,
                amount: finalAmount,
                accountId,
                categoryId: categoryId || null,
                date: new Date(date).toISOString()
            });
            setDescription("");
            setAmount(0);
            fetchData(); // Refresh list
        } catch (error) {
            console.error("Failed to add transaction", error);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName) return;
        try {
            const res = await api.post("/categories/", {
                name: newCategoryName,
                type: type
            });
            setCategories([...categories, res.data]);
            setCategoryId(res.data.id); // Auto-select new category
            setNewCategoryName("");
            setIsAddingCategory(false);
        } catch (error) {
            console.error("Failed to add category", error);
        }
    };

    const filteredCategories = categories.filter(c => c.type === type);

    if (loading) return <div className="p-24">Loading...</div>;

    return (
        <main className="p-24">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">Transactions</h1>
                <Link href="/">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {transactions.length === 0 ? (
                            <p>No transactions found.</p>
                        ) : (
                            <ul className="space-y-4">
                                {transactions.map((tx) => (
                                    <li key={tx.id} className="flex justify-between items-center border-b pb-2">
                                        <div>
                                            <p className="font-bold">{tx.description}</p>
                                            <div className="flex gap-2 text-xs text-muted-foreground">
                                                <span>{new Date(tx.date).toLocaleDateString()}</span>
                                                {tx.category && <span className="bg-gray-100 px-1 rounded">{tx.category.name}</span>}
                                            </div>
                                        </div>
                                        <div className={tx.amount < 0 ? "text-red-500" : "text-green-500"}>
                                            ${tx.amount.toFixed(2)}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Add Transaction</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddTransaction} className="space-y-4">
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="EXPENSE"
                                        checked={type === "EXPENSE"}
                                        onChange={e => setType(e.target.value)}
                                    /> Expense
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="INCOME"
                                        checked={type === "INCOME"}
                                        onChange={e => setType(e.target.value)}
                                    /> Income
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <input
                                    className="w-full p-2 border rounded"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full p-2 border rounded"
                                    value={amount}
                                    onChange={e => setAmount(Number(e.target.value))}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Account</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={accountId}
                                    onChange={e => setAccountId(e.target.value)}
                                    required
                                >
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <div className="flex gap-2">
                                    <select
                                        className="w-full p-2 border rounded"
                                        value={categoryId}
                                        onChange={e => setCategoryId(e.target.value)}
                                    >
                                        <option value="">Uncategorized</option>
                                        {filteredCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <Button type="button" variant="outline" onClick={() => setIsAddingCategory(!isAddingCategory)}>
                                        {isAddingCategory ? "Cancel" : "+"}
                                    </Button>
                                </div>
                                {isAddingCategory && (
                                    <div className="mt-2 flex gap-2">
                                        <input
                                            className="flex-1 p-2 border rounded text-sm"
                                            placeholder="New Category Name"
                                            value={newCategoryName}
                                            onChange={e => setNewCategoryName(e.target.value)}
                                        />
                                        <Button type="button" size="sm" onClick={handleAddCategory}>Add</Button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Date</label>
                                <input
                                    type="date"
                                    className="w-full p-2 border rounded"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">Add Transaction</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
