"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stocksDal } from "@/dal/stocks";
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
import { stockSchema, StockFormValues } from "@/lib/schemas";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export function StockForm({ onSuccess }: { onSuccess?: () => void }) {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState<any[]>([]);

    const form = useForm<StockFormValues>({
        resolver: zodResolver(stockSchema),
        defaultValues: {
            symbol: "",
            quantity: 0,
            averagePrice: 0,
            accountId: "",
        },
    });

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await accountsDal.getAll();
                // Filter only STOCK accounts
                const stockAccounts = res.data.filter((acc: any) => acc.type === "STOCK");
                setAccounts(stockAccounts);
            } catch (error) {
                console.error("Failed to fetch accounts", error);
            }
        };
        fetchAccounts();
    }, []);

    async function onSubmit(data: StockFormValues) {
        setLoading(true);
        try {
            await stocksDal.create(data);
            toast({
                title: "Stock added",
                description: "The stock has been successfully added to your portfolio.",
            });
            if (onSuccess) {
                onSuccess();
            } else {
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to add stock", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to add stock. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="symbol"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Symbol</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. AAPL" {...field} onChange={e => field.onChange(e.target.value.toUpperCase())} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.000001"
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
                        name="averagePrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Average Price</FormLabel>
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
                </div>
                <FormField
                    control={form.control}
                    name="accountId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Account</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select stock account" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {accounts.length > 0 ? (
                                        accounts.map((acc) => (
                                            <SelectItem key={acc.id} value={acc.id}>
                                                {acc.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="none" disabled>No stock accounts found</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={loading}>
                    {loading ? "Adding..." : "Add Stock"}
                </Button>
            </form>
        </Form>
    );
}
