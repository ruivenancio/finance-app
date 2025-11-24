import { AccountForm } from "@/components/forms/account-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewAccountPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Account Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AccountForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
