"use client";

import * as React from "react"
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { dashboardDal } from "@/dal/dashboard";
import { useRouter } from "next/navigation";
import { CreditCard, Wallet, PieChart } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { DataTable } from "@/components/dashboard/data-table";
import { columns } from "@/components/dashboard/columns";
import { TransactionsProvider } from "@/components/dashboard/transactions-context";

interface DashboardData {
    totalBalance: number;
    accountCount: number;
    monthlyExpenses: number;
    monthlyIncome: number;
    totalBudget: number;
    monthlyStats: { month: string; income: number; expenses: number }[];
    recentTransactions: any[];
}

const chartConfig = {
    income: {
        label: "Income",
        color: "hsl(var(--chart-2))",
    },
    expenses: {
        label: "Expenses",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

export default function Home() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchData = useCallback(async () => {
        try {
            const response = await dashboardDal.getSummary();
            setData(response.data);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
            router.push("/login");
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
    }
    return (
        <TransactionsProvider value={{ refreshTransactions: fetchData }}>
            <div className="flex min-h-screen bg-background">

                {/* Main Content */}
                <div className="flex flex-col w-full">

                    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                                    <span className="text-muted-foreground">$</span>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">${(data?.totalBalance || 0).toFixed(2)}</div>
                                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{data?.accountCount || 0}</div>
                                    <p className="text-xs text-muted-foreground">Connected banks & cards</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                                    <Wallet className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">${(data?.monthlyExpenses || 0).toFixed(2)}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Income: ${(data?.monthlyIncome || 0).toFixed(2)}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
                                    <PieChart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {data?.totalBudget ? `${((data.monthlyExpenses / data.totalBudget) * 100).toFixed(0)}%` : "No Budget"}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {data?.totalBudget ? `${data.monthlyExpenses.toFixed(0)} / ${data.totalBudget.toFixed(0)} used` : "Set a budget to track"}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="pt-0">
                            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                                <div className="grid flex-1 gap-1">
                                    <CardTitle>Financial Overview</CardTitle>
                                    <CardDescription>
                                        Showing income and expenses for the current year
                                    </CardDescription>
                                </div>

                            </CardHeader>
                            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                                <ChartContainer
                                    config={chartConfig}
                                    className="aspect-auto h-[250px] w-full"
                                >
                                    <AreaChart data={data?.monthlyStats || []}>
                                        <defs>
                                            <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                                                <stop
                                                    offset="5%"
                                                    stopColor="var(--color-income)"
                                                    stopOpacity={0.8}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="var(--color-income)"
                                                    stopOpacity={0.1}
                                                />
                                            </linearGradient>
                                            <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                                                <stop
                                                    offset="5%"
                                                    stopColor="var(--color-expenses)"
                                                    stopOpacity={0.8}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="var(--color-expenses)"
                                                    stopOpacity={0.1}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent indicator="dot" />}
                                        />
                                        <Area
                                            dataKey="income"
                                            type="natural"
                                            fill="url(#fillIncome)"
                                            stroke="var(--color-income)"
                                            stackId="a"
                                        />
                                        <Area
                                            dataKey="expenses"
                                            type="natural"
                                            fill="url(#fillExpenses)"
                                            stroke="var(--color-expenses)"
                                            stackId="a"
                                        />
                                        <ChartLegend content={<ChartLegendContent />} />
                                    </AreaChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Transactions</CardTitle>
                                <CardDescription>
                                    You made {data?.recentTransactions?.length || 0} transactions this month.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DataTable columns={columns} data={data?.recentTransactions || []} />
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </div>
        </TransactionsProvider>
    );
}
