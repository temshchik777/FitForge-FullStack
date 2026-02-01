import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Save, User } from "lucide-react";
import { api, apiService } from "@/api/api";
import { Quries } from "@/api/quries";
import { useNavigate } from "react-router-dom";
import { ROUTS } from "@/routes/routes.tsx";

interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  login: string;
  email: string;
  birthdate?: string;
  gender?: string;
  avatarUrl?: string;
}

export default function General() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const [userData, setUserData] = useState<UserData>({
    _id: "",
    firstName: "",
    lastName: "",
    login: "",
    email: "",
    birthdate: "",
    gender: "",
    avatarUrl: "",
  });

  // Загрузка данных текущего пользователя
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get(Quries.API.USERS.GET_CURRENT);
        setUserData(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching user data:", err);
        setError("Не удалось загрузить данные пользователя");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Обработка изменения полей формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Валидация полей формы
  const validateFields = () => {
    const errs: Record<string, string> = {};

    const firstName = (userData.firstName || "").trim();
    const lastName = (userData.lastName || "").trim();
    const login = (userData.login || "").trim();
    const email = (userData.email || "").trim();
    const birthdate = (userData.birthdate || "").trim();
    const gender = (userData.gender || "").trim();

    const nameRegex = /^[a-zA-Zа-яА-ЯІіЇїЄєҐґ]+$/;
    const loginRegex = /^[a-zA-Z0-9]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstName) errs.firstName = "Ім'я обов'язкове";
    else if (firstName.length < 2 || firstName.length > 25) errs.firstName = "Довжина 2–25 символів";
    else if (!nameRegex.test(firstName)) errs.firstName = "Лише літери";

    if (!lastName) errs.lastName = "Прізвище обов'язкове";
    else if (lastName.length < 2 || lastName.length > 25) errs.lastName = "Довжина 2–25 символів";
    else if (!nameRegex.test(lastName)) errs.lastName = "Лише літери";

    if (!login) errs.login = "Логін обов'язковий";
    else if (login.length < 3 || login.length > 20) errs.login = "Довжина 3–20 символів";
    else if (!loginRegex.test(login)) errs.login = "Лише латинські літери та цифри";

    if (!email) errs.email = "Email обов'язковий";
    else if (!emailRegex.test(email)) errs.email = "Некоректний email";

    if (birthdate) {
      const d = new Date(birthdate);
      const now = new Date();
      if (isNaN(d.getTime())) errs.birthdate = "Некоректна дата";
      else if (d > now) errs.birthdate = "Дата не може бути в майбутньому";
    }

    if (gender) {
      if (!["male", "female", "other"].includes(gender)) errs.gender = "Некоректне значення";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Загрузка аватара
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith("image/")) {
      setError("Будь ласка, виберіть зображення");
      return;
    }

    // Проверка размера файла (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Размер файла не должен превышать 5MB");
      return;
    }

    setUploadingAvatar(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("images", file);

      const response = await apiService.postFormData(Quries.API.UPLOAD.IMAGES, formData);

      if (response.files && response.files.length > 0) {
        const base = (api as any).defaults?.baseURL || window.location.origin;
        const imageUrl = `${base}/uploads/${response.files[0]}`;
        // Обновляем только локальное состояние для превью; без глобального события
        setUserData((prev) => ({ ...prev, avatarUrl: imageUrl }));
        setSuccess("Аватар успешно загружен");
      }
    } catch (err: any) {
      console.error("Error uploading avatar:", err);
      setError("Не вдалося завантажити аватар");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Збереження змін профіля
  const handleSaveProfile = async () => {
    setError(null);
    setSuccess(null);

    try {
      // Проверяем поля перед сохранением
      if (!validateFields()) {
        setError("Виправте помилки у полях");
        setSaving(false);
        return;
      }

      setSaving(true);

      const updateData = {
        firstName: (userData.firstName || "").trim(),
        lastName: (userData.lastName || "").trim(),
        login: (userData.login || "").trim(),
        email: userData.email,
        birthdate: userData.birthdate,
        gender: userData.gender,
        avatarUrl: userData.avatarUrl,
      };

      const response = await api.put(Quries.API.USERS.UPDATE, updateData);
      
      if (response.data) {
        const updated = response.data;
        const updatedAvatar = updated.avatarUrl ? `${updated.avatarUrl}?t=${Date.now()}` : '';
        setUserData({ ...updated, avatarUrl: updatedAvatar });
        // Обновим локальное хранилище и сообщим другим компонентам
        try {
          if (updatedAvatar) localStorage.setItem('avatarUrl', updatedAvatar);
          const name = `${updated.firstName ?? ''} ${updated.lastName ?? ''}`.trim();
          window.dispatchEvent(new CustomEvent('user:update', { detail: { avatarUrl: updatedAvatar, name, email: updated.email } }));
        } catch {}
        setSuccess("Профіль успішно оновлено!");
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.email || "Не вдалося оновити профіль";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Получение инициалов для аватара
  const getInitials = () => {
    return `${userData.firstName?.[0] || ""}${userData.lastName?.[0] || ""}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Загальні налаштування</h2>
        <p className="text-muted-foreground">
          Керуйте інформацією вашого профіля
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
          <CardTitle>Фото профіля</CardTitle>
          <CardDescription>
            Завантажте фото профіля. Рекомендований розмір: 400x400px
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={userData.avatarUrl} alt={userData.firstName} />
            <AvatarFallback className="text-2xl">
              {getInitials() || <User />}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="avatar-upload" className="cursor-pointer">
              <Button
                type="button"
                variant="outline"
                disabled={uploadingAvatar}
                asChild
              >
                <span>
                  {uploadingAvatar ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Завантаження...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Завантажити фото
                    </>
                  )}
                </span>
              </Button>
            </Label>
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
            />
            <p className="text-xs text-muted-foreground">
              JPG, PNG або GIF. Максимум 5MB.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Особиста інформація</CardTitle>
          <CardDescription>
            Оновіть дані вашого профілю
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Ім'я</Label>
              <Input
                id="firstName"
                name="firstName"
                value={userData.firstName}
                onChange={handleInputChange}
                placeholder="Введіть ім'я"
              />
              {fieldErrors.firstName && (
                <p className="text-xs text-destructive mt-1">{fieldErrors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Прізвище</Label>
              <Input
                id="lastName"
                name="lastName"
                value={userData.lastName}
                onChange={handleInputChange}
                placeholder="Введіть прізвище"
              />
              {fieldErrors.lastName && (
                <p className="text-xs text-destructive mt-1">{fieldErrors.lastName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="login">Логін</Label>
              <Input
                id="login"
                name="login"
                value={userData.login}
                onChange={handleInputChange}
                placeholder="Введіть логін"
              />
              {fieldErrors.login && (
                <p className="text-xs text-destructive mt-1">{fieldErrors.login}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={userData.email}
                onChange={handleInputChange}
                placeholder="Введіть email"
              />
              {fieldErrors.email && (
                <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthdate">Дата народження</Label>
              <Input
                id="birthdate"
                name="birthdate"
                type="date"
                value={userData.birthdate}
                onChange={handleInputChange}
              />
              {fieldErrors.birthdate && (
                <p className="text-xs text-destructive mt-1">{fieldErrors.birthdate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Стать</Label>
              <select
                id="gender"
                name="gender"
                value={userData.gender}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Виберіть стать</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
                <option value="other">Другой</option>
              </select>
              {fieldErrors.gender && (
                <p className="text-xs text-destructive mt-1">{fieldErrors.gender}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Зберегти зміни
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Змінити пароль</CardTitle>
          <CardDescription>
            Для зміни пароля використовуйте окремий розділ безпеки
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => navigate(ROUTS.SETTINGS.SECURITY)}>
            Перейти до налаштувань безпеки
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}