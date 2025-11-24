import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BudgetPage() {
    return (
        <main className="p-24">

            <Card>
                <CardHeader>
                    <CardTitle>Annual Budget</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Budget planning tools will go here.</p>
                </CardContent>
            </Card>
        </main>
    );
}
