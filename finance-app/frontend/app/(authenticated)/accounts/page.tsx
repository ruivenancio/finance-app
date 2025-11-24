"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AccountForm } from "@/components/forms/account-form";
import { accountsDal } from "@/dal/accounts";
import { useToast } from "@/components/ui/use-toast";

interface Account {
    id: string;
    name: string;
    type: string;
    balance: number;
}

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const { toast } = useToast();

    const fetchAccounts = async () => {
        try {
            const response = await accountsDal.getAll();
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

    const handleDelete = async (id: string) => {
        try {
            await accountsDal.delete(id);
            toast({
                title: "Account deleted",
                description: "The account has been successfully deleted.",
            });
            fetchAccounts();
        } catch (error) {
            console.error("Failed to delete account", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete account. Please try again.",
            });
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Accounts</h2>
                <div className="flex items-center space-x-2">
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Account
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Account</DialogTitle>
                            </DialogHeader>
                            <AccountForm
                                onSuccess={() => {
                                    setIsAddOpen(false);
                                    fetchAccounts();
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accounts.length === 0 ? (
                    <p className="col-span-full text-center text-muted-foreground">No accounts found.</p>
                ) : (
                    accounts.map((acc) => (
                        <Card key={acc.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {acc.name}
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Dialog open={isEditOpen && editingAccount?.id === acc.id} onOpenChange={(open) => {
                                        setIsEditOpen(open);
                                        if (!open) setEditingAccount(null);
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => {
                                                    setEditingAccount(acc);
                                                    setIsEditOpen(true);
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Edit Account</DialogTitle>
                                            </DialogHeader>
                                            <AccountForm
                                                initialData={acc}
                                                onSuccess={() => {
                                                    setIsEditOpen(false);
                                                    setEditingAccount(null);
                                                    fetchAccounts();
                                                }}
                                            />
                                        </DialogContent>
                                    </Dialog>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the account and all associated transactions.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteAccount(acc.id)}>
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${acc.balance.toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground">
                                    {acc.type}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
