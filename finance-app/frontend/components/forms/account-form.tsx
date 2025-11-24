"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { accountSchema, AccountFormValues } from "@/lib/schemas";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

export function AccountForm({ initialData, onSuccess }: { initialData?: any, onSuccess?: () => void }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<AccountFormValues>({
        resolver: zodResolver(accountSchema),
        defaultValues: initialData || {
            name: "",
            type: "BANK",
            balance: 0,
        },
    });

    async function onSubmit(data: AccountFormValues) {
        setLoading(true);
        try {
            if (initialData) {
                await accountsDal.update(initialData.id, data);
                toast({
                    title: "Account updated",
                    description: "The account has been successfully updated.",
                });
            } else {
                await accountsDal.create(data);
                toast({
                    title: "Account created",
                    description: "The new account has been successfully created.",
                });
            }

            if (onSuccess) {
                onSuccess();
            } else {
                router.push("/accounts");
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to save account", error);
            toast({
                title: "Error",
                description: "Failed to save account. Please try again.",
                variant: "destructive",
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
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Account Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Main Checking" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="BANK">Bank</SelectItem>
                                    <SelectItem value="CARD">Card</SelectItem>
                                    <SelectItem value="STOCK">Stock</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="balance"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current Balance</FormLabel>
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
                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : (initialData ? "Update Account" : "Create Account")}
                </Button>
            </form>
        </Form>
    );
}
