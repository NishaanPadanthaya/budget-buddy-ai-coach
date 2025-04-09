
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Settings = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your account details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <h3 className="text-lg font-medium">Username</h3>
                <p className="text-muted-foreground">User</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Email</h3>
                <p className="text-muted-foreground">user@example.com</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>App Settings</CardTitle>
            <CardDescription>
              Customize your Budget Buddy experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Dark Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Turn on dark mode to reduce eye strain
                  </p>
                </div>
                <div>
                  <Button variant="outline">Coming Soon</Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Currency</h3>
                  <p className="text-sm text-muted-foreground">
                    Set your preferred currency
                  </p>
                </div>
                <div>
                  <Button variant="outline">USD ($)</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
