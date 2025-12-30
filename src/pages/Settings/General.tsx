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
  };

  // Загрузка аватара
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith("image/")) {
      setError("Пожалуйста, выберите изображение");
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
        const imageUrl = `http://localhost:4000/uploads/${response.files[0]}`;
        setUserData((prev) => ({ ...prev, avatarUrl: imageUrl }));
        setSuccess("Аватар успешно загружен");
      }
    } catch (err: any) {
      console.error("Error uploading avatar:", err);
      setError("Не удалось загрузить аватар");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Сохранение изменений профиля
  const handleSaveProfile = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const updateData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        login: userData.login,
        email: userData.email,
        birthdate: userData.birthdate,
        gender: userData.gender,
        avatarUrl: userData.avatarUrl,
      };

      const response = await api.put(Quries.API.USERS.UPDATE, updateData);
      
      if (response.data) {
        setUserData(response.data);
        setSuccess("Профиль успешно обновлен!");
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.email || "Не удалось обновить профиль";
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
        <h2 className="text-2xl font-bold tracking-tight">Общие настройки</h2>
        <p className="text-muted-foreground">
          Управляйте информацией вашего профиля
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
          <CardTitle>Фотография профиля</CardTitle>
          <CardDescription>
            Загрузите фотографию профиля. Рекомендуемый размер: 400x400px
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
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Загрузить фото
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
              JPG, PNG или GIF. Максимум 5MB.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Личная информация</CardTitle>
          <CardDescription>
            Обновите данные вашего профиля
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Имя</Label>
              <Input
                id="firstName"
                name="firstName"
                value={userData.firstName}
                onChange={handleInputChange}
                placeholder="Введите имя"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Фамилия</Label>
              <Input
                id="lastName"
                name="lastName"
                value={userData.lastName}
                onChange={handleInputChange}
                placeholder="Введите фамилию"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login">Логин</Label>
              <Input
                id="login"
                name="login"
                value={userData.login}
                onChange={handleInputChange}
                placeholder="Введите логин"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={userData.email}
                onChange={handleInputChange}
                placeholder="Введите email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthdate">Дата рождения</Label>
              <Input
                id="birthdate"
                name="birthdate"
                type="date"
                value={userData.birthdate}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Пол</Label>
              <select
                id="gender"
                name="gender"
                value={userData.gender}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Выберите пол</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
                <option value="other">Другой</option>
              </select>
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
                  Сохранить изменения
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Изменить пароль</CardTitle>
          <CardDescription>
            Для изменения пароля используйте отдельный раздел безопасности
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => navigate(Quries.CLIENT.PROFILE.SETTINGS + "/security")}>
            Перейти к настройкам безопасности
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}