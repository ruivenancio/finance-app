import { TransactionForm } from "@/components/forms/transaction-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewTransactionPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Add Transaction</h2>
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Transaction Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TransactionForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
