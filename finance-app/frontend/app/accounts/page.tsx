"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import Link from "next/link";

interface Account {
    id: string;
    name: string;
    type: string;
    balance: number;
}

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [newAccountName, setNewAccountName] = useState("");
    const [newAccountType, setNewAccountType] = useState("BANK");
    const [newAccountBalance, setNewAccountBalance] = useState(0);

    const fetchAccounts = async () => {
        try {
            const response = await api.get("/accounts/");
            setAccounts(response.data);
        } catch (error) {
            console.error("Failed to fetch accounts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/accounts/", {
                name: newAccountName,
                type: newAccountType,
                balance: Number(newAccountBalance)
            });
            setNewAccountName("");
            setNewAccountBalance(0);
            fetchAccounts(); // Refresh list
        } catch (error) {
            console.error("Failed to create account", error);
        }
    };

    const handleDeleteAccount = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/accounts/${id}`);
            fetchAccounts();
        } catch (error) {
            console.error("Failed to delete account", error);
        }
    }

    if (loading) return <div className="p-24">Loading...</div>;

    return (
        <main className="p-24">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">Accounts</h1>
                <Link href="/">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Accounts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {accounts.length === 0 ? (
                            <p>No accounts found.</p>
                        ) : (
                            <ul className="space-y-4">
                                {accounts.map((acc) => (
                                    <li key={acc.id} className="flex justify-between items-center border p-4 rounded">
                                        <div>
                                            <p className="font-bold">{acc.name}</p>
                                            <p className="text-sm text-muted-foreground">{acc.type}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">${acc.balance.toFixed(2)}</p>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteAccount(acc.id)}>Delete</Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Add New Account</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateAccount} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    className="w-full p-2 border rounded"
                                    value={newAccountName}
                                    onChange={e => setNewAccountName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Type</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={newAccountType}
                                    onChange={e => setNewAccountType(e.target.value)}
                                >
                                    <option value="BANK">Bank</option>
                                    <option value="STOCK">Stock</option>
                                    <option value="CARD">Card</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Initial Balance</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full p-2 border rounded"
                                    value={newAccountBalance}
                                    onChange={e => setNewAccountBalance(Number(e.target.value))}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">Create Account</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
