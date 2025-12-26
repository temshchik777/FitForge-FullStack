import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Link} from "react-router";
import {ROUTS} from "@/routes/routes.tsx";
import {apiService} from "@/api/api";
import {Quries} from "@/api/quries";
import {useState} from "react";
import {toast} from "react-toastify";

export function LoginForm({
                              className,
                              ...props
                          }: React.ComponentProps<"div">) {
    const [formData, setFormData] = useState({
        loginOrEmail: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            const data = await apiService.post(Quries.API.USERS.LOGIN, {
                loginOrEmail: formData.loginOrEmail,
                password: formData.password
            });

            console.log('🔍 Login response:', data); // Отладка

            if (data.token) {
                localStorage.setItem('token', data.token);

                // Пытаемся извлечь userId из JWT, если сервер его не вернул явно
                try {
                    const bearer = String(data.token);
                    const rawToken = bearer.startsWith('Bearer ')
                        ? bearer.slice(7)
                        : bearer;
                    const base64Url = rawToken.split('.')[1];
                    if (base64Url) {
                        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
                        const payloadJson = atob(padded);
                        const payload = JSON.parse(payloadJson);
                        const uid = payload?.id || payload?.userId || payload?.sub;
                        if (uid) {
                            localStorage.setItem('userId', String(uid));
                            console.log('✅ Saved userId from JWT:', uid);
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ Failed to decode JWT payload for userId', e);
                }
                
                toast.success('Вхід успішний!');
                window.location.href = ROUTS.HOME;
            } else {
                toast.error('Помилка входу. Токен не отримано.');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Помилка входу. Перевірте ваші дані для входу.');
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Вхід до облікового запису</CardTitle>
                    <CardDescription>
                        Введіть вашу електронну пошту для входу до облікового запису
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={e => onSubmit(e)}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="loginOrEmail">Логін або електронна пошта</Label>
                                <Input
                                    id="loginOrEmail"
                                    type="text"
                                    placeholder="m@example.com"
                                    value={formData.loginOrEmail}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Пароль</Label>
                                    <a
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Забули пароль?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Вхід...' : 'Вхід'}
                                </Button>
                                <Button variant="outline" className="w-full">
                                    Вхід через Google
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            Немаєте облікового запису?{" "}
                            <Link to={ROUTS.REGISTER} className="underline underline-offset-4">
                                Зареєструватися
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}