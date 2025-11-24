"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { transactionsDal } from "@/dal/transactions";
import { categoriesDal } from "@/dal/categories";
import { accountsDal } from "@/dal/accounts";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { transactionSchema, TransactionFormValues } from "@/lib/schemas";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, ArrowRightLeft } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CategoryForm } from "@/components/forms/category-form";
import { Plus } from "lucide-react";

import { useToast } from "@/components/ui/use-toast";

export function TransactionForm({ initialData, onSuccess }: { initialData?: any, onSuccess?: () => void }) {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema),
        defaultValues: initialData ? {
            ...initialData,
            amount: Math.abs(initialData.amount),
            date: new Date(initialData.date),
            type: initialData.amount < 0 ? "EXPENSE" : "INCOME", // Default for edit, though transfers might be tricky to edit as transfers if not stored as such
        } : {
            description: "",
            amount: 0,
            date: new Date(),
            type: "EXPENSE",
        },
    });

    const type = form.watch("type");

    const fetchCategories = async () => {
        try {
            const res = await categoriesDal.getAll();
            setCategories(res.data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const accRes = await accountsDal.getAll();
                setAccounts(accRes.data);
                await fetchCategories();
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };
        fetchData();
    }, []);

    async function onSubmit(data: TransactionFormValues) {
        setLoading(true);
        try {
            if (data.type === "TRANSFER") {
                await transactionsDal.transfer({
                    fromAccountId: data.accountId,
                    toAccountId: data.toAccountId,
                    amount: data.amount,
                    date: data.date,
                    description: data.description,
                });
                toast({
                    title: "Transfer successful",
                    description: "Funds have been transferred successfully.",
                });
            } else {
                const finalAmount = data.type === "EXPENSE" ? -Math.abs(data.amount) : Math.abs(data.amount);
                const payload = {
                    description: data.description,
                    amount: finalAmount,
                    date: data.date,
                    categoryId: data.categoryId,
                    accountId: data.accountId,
                };

                if (initialData) {
                    await transactionsDal.update(initialData.id, payload);
                    toast({
                        title: "Transaction updated",
                        description: "The transaction has been successfully updated.",
                    });
                } else {
                    await transactionsDal.create(payload);
                    toast({
                        title: "Transaction created",
                        description: "The new transaction has been successfully created.",
                    });
                }
            }

            if (onSuccess) {
                onSuccess();
            } else {
                router.push("/transactions");
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to save transaction", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save transaction. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex gap-4">
                    <Button
                        type="button"
                        variant={type === "EXPENSE" ? "default" : "outline"}
                        onClick={() => form.setValue("type", "EXPENSE")}
                        className="w-full"
                    >
                        Expense
                    </Button>
                    <Button
                        type="button"
                        variant={type === "INCOME" ? "default" : "outline"}
                        onClick={() => form.setValue("type", "INCOME")}
                        className="w-full"
                    >
                        Income
                    </Button>
                    <Button
                        type="button"
                        variant={type === "TRANSFER" ? "default" : "outline"}
                        onClick={() => form.setValue("type", "TRANSFER")}
                        className="w-full"
                    >
                        Transfer
                    </Button>
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input placeholder={type === "TRANSFER" ? "e.g. Savings Transfer" : "e.g. Grocery Shopping"} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        {...field}
                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {type === "TRANSFER" ? (
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="accountId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>From Account</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select source account" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {accounts.map((acc) => (
                                                <SelectItem key={acc.id} value={acc.id}>
                                                    {acc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="toAccountId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>To Account</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select destination account" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {accounts.filter(acc => acc.id !== form.getValues("accountId")).map((acc) => (
                                                <SelectItem key={acc.id} value={acc.id}>
                                                    {acc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="accountId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select account" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {accounts.map((acc) => (
                                                <SelectItem key={acc.id} value={acc.id}>
                                                    {acc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <div className="flex gap-2">
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.filter(cat => cat.type === type).map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Dialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                                            <DialogTrigger asChild>
                                                <Button type="button" variant="outline" size="icon">
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Create Category</DialogTitle>
                                                </DialogHeader>
                                                <CategoryForm
                                                    defaultType={type === "TRANSFER" ? "EXPENSE" : type}
                                                    onSuccess={() => {
                                                        setIsCategoryOpen(false);
                                                        fetchCategories();
                                                    }}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : (initialData ? "Update Transaction" : (type === "TRANSFER" ? "Transfer Funds" : "Create Transaction"))}
                </Button>
            </form>
        </Form>
    );
}
