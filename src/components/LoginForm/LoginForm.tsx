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
import { validateEmail, validatePassword } from "@/lib/validation";
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
    const [errors, setErrors] = useState<{ loginOrEmail?: string; password?: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // базова валідація
        const nextErrors: { loginOrEmail?: string; password?: string } = {};
        const val = formData.loginOrEmail.trim();
        const isEmail = val.includes('@');
        if (!val) {
            nextErrors.loginOrEmail = 'Вкажіть логін або email';
        } else if (isEmail && !validateEmail(val)) {
            nextErrors.loginOrEmail = 'Некоректний email';
        }
        if (!validatePassword(formData.password, { min: 7 })) {
            nextErrors.password = 'Пароль має містити щонайменше 7 символів (латиниця та цифри)';
        }
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) {
            return; // зупинити відправку
        }
        setIsLoading(true);

        try {
            const data = await apiService.post(Quries.API.USERS.LOGIN, {
                loginOrEmail: formData.loginOrEmail,
                password: formData.password
            });

            if (data.token) {
                localStorage.setItem('token', data.token);

                // пробуємо дістати userId з JWT і зберегти його
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
                        }
                    }
                } catch (e) {
                    // Не вдалося декодувати JWT
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
                                {errors.loginOrEmail && (
                                  <span className="text-sm text-red-500">{errors.loginOrEmail}</span>
                                )}
                            </div>
                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Пароль</Label>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.password && (
                                  <span className="text-sm text-red-500">{errors.password}</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Вхід...' : 'Вхід'}
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