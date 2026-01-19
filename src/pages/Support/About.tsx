import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Heart } from "lucide-react";

export default function About() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Про FitForge</h1>
        <p className="text-muted-foreground mt-2">
          Дізнайтеся більше про нашу програму та місію
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Наша місія</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-3">
          <p>
            FitForge - це соціальна мережа, яка спеціально розроблена для
            людей, які займаються фітнесом та здоровим способом життя. Ми
            вірим, що спільнота і мотивація - це ключі до успіху.
          </p>
          <p>
            Наша мета - створити простір, де люди можуть ділитися своїми
            досягненнями, отримувати підтримку від однодумців та бути
            мотивованими на шляху до своїх цілей.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <Heart className="h-8 w-8 text-red-500 mb-2" />
            <CardTitle className="text-lg">Спільнота</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Приєднуйтеся до тисяч фітнес-ентузіастів та ділітеся своїм
            прогресом
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Target className="h-8 w-8 text-blue-500 mb-2" />
            <CardTitle className="text-lg">Цілі</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Встановлюйте цілі та відстежуйте свій прогрес з нашими
            інструментами
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Дякуємо!</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Дякуємо за те, що ви є частиною FitForge. Ваш відгук допомагає нам
          постійно поліпшуватися!
        </CardContent>
      </Card>
    </div>
  );
}
