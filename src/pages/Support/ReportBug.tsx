import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { useState } from "react";

export default function ReportBug() {
  const [bugType, setBugType] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bugType || !description.trim() || !email.trim()) {
      toast.error("Будь ласка, заповніть всі поля");
      return;
    }

    setIsSubmitting(true);
    try {
      // Тут можна додати відправку на backend
      console.log({
        bugType,
        description,
        email,
        timestamp: new Date().toISOString(),
      });

      toast.success("Дякуємо! Ваш звіт про проблему отримано");
      setBugType("");
      setDescription("");
      setEmail("");
    } catch (error) {
      toast.error("Помилка при відправці звіту");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Звіт про проблему</h1>
        <p className="text-muted-foreground mt-2">
          Допоможіть нам поліпшити FitForge, повідомивши про проблеми
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Заповніть форму</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Тип проблеми
              </label>
              <select
                value={bugType}
                onChange={(e) => setBugType(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Виберіть тип проблеми</option>
                <option value="bug">Баг/Помилка</option>
                <option value="performance">Проблема з продуктивністю</option>
                <option value="ui">Проблема з UI/UX</option>
                <option value="crash">Крах додатку</option>
                <option value="other">Інше</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Опис проблеми
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Опишіть деталі проблеми, кроки для відтворення..."
                rows={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Ваш email для зв'язку
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Відправка..." : "Відправити звіт"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Совіти</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            • Будьте якомога детальнішими - це допоможе нам швидше вирішити
            проблему
          </p>
          <p>• Включіть номер помилки, якщо він присутній</p>
          <p>• Опишіть, що ви робили перед появою проблеми</p>
          <p>• Повідомте ваш браузер та операційну систему</p>
        </CardContent>
      </Card>
    </div>
  );
}
