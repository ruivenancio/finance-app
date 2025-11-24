"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, RefreshCw } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { StockForm } from "@/components/forms/stock-form";
import { stocksDal } from "@/dal/stocks";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

export default function StocksPage() {
    const [stocks, setStocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const { toast } = useToast();

    const fetchStocks = async () => {
        try {
            const res = await stocksDal.getAll();
            setStocks(res.data);
        } catch (error) {
            console.error("Failed to fetch stocks", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStocks();
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        try {
            await stocksDal.sync();
            toast({
                title: "Stocks synced",
                description: "Stock prices have been updated.",
            });
            fetchStocks();
        } catch (error) {
            console.error("Failed to sync stocks", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to sync stock prices.",
            });
        } finally {
            setSyncing(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this stock?")) return;
        try {
            await stocksDal.delete(id);
            toast({
                title: "Stock deleted",
                description: "The stock has been removed.",
            });
            fetchStocks();
        } catch (error) {
            console.error("Failed to delete stock", error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Stocks</h1>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                        Sync Prices
                    </Button>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Stock
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Stock</DialogTitle>
                            </DialogHeader>
                            <StockForm
                                onSuccess={() => {
                                    setIsAddOpen(false);
                                    fetchStocks();
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Symbol</TableHead>
                                <TableHead>Account</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Avg Price</TableHead>
                                <TableHead className="text-right">Current Price</TableHead>
                                <TableHead className="text-right">Total Value</TableHead>
                                <TableHead className="text-right">Gain/Loss</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stocks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center">
                                        No stocks found. Add one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                stocks.map((stock) => {
                                    const totalValue = stock.quantity * (stock.currentPrice || stock.averagePrice);
                                    const gainLoss = stock.currentPrice
                                        ? (stock.currentPrice - stock.averagePrice) * stock.quantity
                                        : 0;
                                    const gainLossPercent = stock.currentPrice
                                        ? ((stock.currentPrice - stock.averagePrice) / stock.averagePrice) * 100
                                        : 0;

                                    return (
                                        <TableRow key={stock.id}>
                                            <TableCell className="font-medium">{stock.symbol}</TableCell>
                                            <TableCell>{stock.account.name}</TableCell>
                                            <TableCell className="text-right">{stock.quantity}</TableCell>
                                            <TableCell className="text-right">${stock.averagePrice.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">
                                                {stock.currentPrice ? `$${stock.currentPrice.toFixed(2)}` : "N/A"}
                                            </TableCell>
                                            <TableCell className="text-right">${totalValue.toFixed(2)}</TableCell>
                                            <TableCell className={`text-right ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                {stock.currentPrice ? (
                                                    <>
                                                        ${gainLoss.toFixed(2)} ({gainLossPercent.toFixed(2)}%)
                                                    </>
                                                ) : "N/A"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-800"
                                                    onClick={() => handleDelete(stock.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
