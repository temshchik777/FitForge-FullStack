import { useState } from "react";
import { cn } from "@/lib/utils.ts"
import { Button } from "@/components/ui/button.tsx"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { ROUTS } from "@/routes/routes.tsx";
import { Link, useNavigate } from "react-router";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/auth/useAuth.ts";
interface RegisterFormData {
    firstName: string;
    lastName: string;
    login: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export function RegisterForm({
                                 className,
                                 ...props
                             }: React.ComponentProps<"div">) {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState<RegisterFormData>({
        firstName: "",
        lastName: "",
        login: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Паролі не збігаються");
            return;
        }

        try {
            await register(
                formData.email,
                formData.password,
                formData.firstName,
                formData.lastName,
                formData.login,
            );
            setIsSuccess(true);
            setTimeout(() => {
                navigate(ROUTS.LOGIN);
            }, 2000);
        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError("Помилка при реєстрації");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <>
            <div className={cn("flex flex-col gap-6", className)} {...props}>
                <Card>
                    <CardHeader>
                        <CardTitle>Реєстрація нового облікового запису</CardTitle>
                        <CardDescription>
                            Заповніть дані для створення облікового запису
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="firstName">Ім’я</Label>
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        placeholder="Іван"
                                        required
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="lastName">Прізвище</Label>
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        placeholder="Петренко"
                                        required
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="login">Логін</Label>
                                    <Input
                                        id="login"
                                        name="login"
                                        type="text"
                                        placeholder="ivanpetrenko"
                                        required
                                        value={formData.login}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="password">Пароль</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="confirmPassword">Підтвердіть пароль</Label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>

                                {error && (
                                    <p className="text-sm text-red-500 text-center">{error}</p>
                                )}

                                <div className="flex flex-col gap-3">
                                    <Button type="submit" className="w-full">
                                        Зареєструватися
                                    </Button>
                                    <Button variant="outline" className="w-full">
                                        Вхід через Google
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-4 text-center text-sm">
                                Вже маєте обліковий запис?{" "}
                                <Link to={ROUTS.LOGIN} className="underline underline-offset-4">
                                    Вхід
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isSuccess} onOpenChange={setIsSuccess}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Реєстрація успішна!</DialogTitle>
                        <DialogDescription>
                            Ваш обліковий запис успішно створено. Вас будуть перенаправлено на сторінку входу.
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    )
}