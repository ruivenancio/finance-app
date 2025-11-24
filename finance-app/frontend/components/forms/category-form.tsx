"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { categoriesDal } from "@/dal/categories";
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
import { categorySchema, CategoryFormValues } from "@/lib/schemas";
import { useEffect, useState } from "react";

import { useToast } from "@/components/ui/use-toast";

export function CategoryForm({
    initialData,
    onSuccess,
    defaultType = "EXPENSE"
}: {
    initialData?: any,
    onSuccess?: () => void,
    defaultType?: "INCOME" | "EXPENSE"
}) {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoriesDal.getAll();
                setCategories(response.data);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: initialData || {
            name: "",
            type: defaultType,
            parentId: "none",
        },
    });

    async function onSubmit(data: CategoryFormValues) {
        setLoading(true);
        try {
            const payload = { ...data };
            if (payload.parentId === "none") {
                payload.parentId = undefined;
            }

            if (initialData?.id) {
                await categoriesDal.update(initialData.id, payload);
                toast({
                    title: "Category updated",
                    description: "The category has been successfully updated.",
                });
            } else {
                await categoriesDal.create(payload);
                toast({
                    title: "Category created",
                    description: "The new category has been successfully created.",
                });
            }

            if (onSuccess) {
                onSuccess();
            } else {
                router.push("/categories"); // Redirect to categories list
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to save category", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save category. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={(e) => {
                    e.stopPropagation();
                    form.handleSubmit(onSubmit)(e);
                }}
                className="space-y-8"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Groceries" {...field} />
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
                                    <SelectItem value="INCOME">Income</SelectItem>
                                    <SelectItem value="EXPENSE">Expense</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Parent Category (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select parent category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {categories.filter(c => c.id !== initialData?.id).map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : (initialData ? "Update Category" : "Create Category")}
                </Button>
            </form>
        </Form>
    );
}
