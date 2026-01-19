import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";
import { api } from "@/api/api";
import { Quries } from "@/api/quries";

export default function Security() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(null);

    // Валідація
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError("Будь ласка, заповніть всі поля");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Новий пароль повинен містити мінімум 6 символів");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Новий пароль і підтвердження не співпадають");
      return;
    }

    setLoading(true);

    try {
      await api.put(Quries.API.USERS.UPDATE_PASSWORD, {
        password: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setSuccess("Пароль успішно змінен!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      console.error("Error changing password:", err);
      const errorMessage = err.response?.data?.password || err.response?.data?.message || "Не вдалося змінити пароль";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Безпека</h2>
        <p className="text-muted-foreground">
          Керуйте паролем та параметрами безпеки
        </p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg border border-green-500/20">
          {success}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Змінити пароль</CardTitle>
          <CardDescription>
            Оновите пароль для доступу до вашого облікового запису
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Поточний пароль</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handleInputChange}
              placeholder="Введіть поточний пароль"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Новий пароль</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handleInputChange}
              placeholder="Введіть новий пароль"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Підтвердіть новий пароль</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Повторіть новий пароль"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleChangePassword} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Змінювання...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Змінити пароль
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
