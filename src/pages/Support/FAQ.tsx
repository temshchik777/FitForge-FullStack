import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "Як розпочати роботу з FitForge?",
      answer:
        "Зареєструйтеся через форму реєстрації, заповніть ваш профіль з вашим ім'ям, прізвищем та фото. Після цього ви можете почати ділитися постами та слідкувати за іншими користувачами.",
    },
    {
      question: "Як я можу заробити нагороди?",
      answer:
        "Нагороди можна заробити, створюючи пості та отримуючи лайки від інших користувачів. За кожен новий пост та накопичені лайки ви отримуєте відповідні нагороди.",
    },
    {
      question: "Як я можу відстежувати свою вагу?",
      answer:
        "Перейдіть в розділ 'Мій облік' та знайдіть вкладку 'Прогрес Ваги'. Там ви можете додавати записи про вашу вагу та встановлювати цільову вагу для відстеження прогресу.",
    },
    {
      question: "Як я можу зберегти пост?",
      answer:
        "Нажміть на іконку закладки на будь-якому пості. Збережені пости будуть доступні в розділі 'Збережене' в бічній панелі.",
    },
    {
      question: "Як відредагувати або видалити мій пост?",
      answer:
        "Нажміть на три крапки (...) на своєму пості. Ви зможете відредагувати текст або видалити пост повністю. Адміністратори також можуть видаляти будь-які пости.",
    },
    {
      question: "Як я можу змінити свій пароль?",
      answer:
        "Перейдіть в 'Налаштування' > 'Безпека'. Там ви знайдете опцію для зміни вашого пароля. Введіть ваш поточний пароль та новий пароль.",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Часто задавані питання</h1>
        <p className="text-muted-foreground mt-2">
          Знайдіть відповіді на поширені запитання про FitForge
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <Card
            key={idx}
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => setOpenId(openId === idx ? null : idx)}
          >
            <CardHeader className="py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {faq.question}
                </CardTitle>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    openId === idx ? "rotate-180" : ""
                  }`}
                />
              </div>
            </CardHeader>
            {openId === idx && (
              <CardContent className="py-4 pt-0 text-sm text-muted-foreground">
                {faq.answer}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
