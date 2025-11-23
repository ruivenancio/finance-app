import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: string;
    category?: { name: string };
}

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
    if (!transactions || transactions.length === 0) {
        return <div className="text-sm text-muted-foreground">No recent transactions.</div>
    }

    return (
        <div className="space-y-8">
            {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>{tx.description[0]?.toUpperCase() || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{tx.description}</p>
                        <p className="text-sm text-muted-foreground">
                            {tx.category?.name || "Uncategorized"}
                        </p>
                    </div>
                    <div className={`ml-auto font-medium ${tx.amount < 0 ? "text-red-500" : "text-green-500"}`}>
                        {tx.amount < 0 ? "-" : "+"}${Math.abs(tx.amount).toFixed(2)}
                    </div>
                </div>
            ))}
        </div>
    )
}
