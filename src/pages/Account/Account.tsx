import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Award, Image, Lock, TrendingDown, TrendingUp, Target} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useState, useEffect} from "react";
import {apiService} from "@/api/api";
import {Quries} from "@/api/quries";
import useAwards from "@/api/useAwards/useAwards";
import { usePosts } from "@/hooks/usePosts";
import PostCard from "@/components/PostCard/PostCard";
import CreatePostModal from "@/components/PostModal/CreatePostModal.tsx";
import { getIsAdminFromToken } from "@/utils/tokenUtils";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

export default function Account() {
    const [activeTab, setActiveTab] = useState("posts");
    const [currentWeight, setCurrentWeight] = useState("");
    const [targetWeight, setTargetWeight] = useState("");
    const [weightHistory, setWeightHistory] = useState<any[]>([]);
    const { awards, loading: awardsLoading, error: awardsError } = useAwards();
    
    const { 
        posts, 
        loading: postsLoading, 
        error: postsError,
        toggleLike,
        updatePost,
        deletePost, 
        refetch: refetchPosts 
    } = usePosts({ userId: (localStorage.getItem('userId') || undefined) as string | undefined });

    // Получаем текущий userId: сначала из localStorage, иначе из payload JWT-товкена (fallback)
    const getUserIdFromToken = (): string | undefined => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return undefined;
            const parts = token.split('.');
            if (parts.length < 2) return undefined;
            const payload = JSON.parse(decodeURIComponent(escape(window.atob(parts[1]))));
            return payload?.id || payload?.userId || payload?.sub || undefined;
        } catch (e) {
            console.warn('Failed to decode token payload', e);
            return undefined;
        }
    };

    const currentUserId = localStorage.getItem('userId') || getUserIdFromToken();
    const isAdmin = getIsAdminFromToken();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await apiService.get(Quries.API.USERS.GET_CURRENT);
                setWeightHistory(userData.weightHistory || []);
                setTargetWeight(userData.targetWeight || "");
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        fetchUserData();
    }, []);

    const addWeightRecord = async () => {
        if (!currentWeight || isNaN(Number(currentWeight))) {
            toast.error("Введіть коректну вагу");
            return;
        }

        try {
            const response = await apiService.put(Quries.API.USERS.UPDATE, {
                weightHistory: [
                    ...weightHistory,
                    { weight: Number(currentWeight), date: new Date() }
                ]
            });
            
            setWeightHistory(response.weightHistory || []);
            setCurrentWeight("");
            toast.success("Вага збережена!");
        } catch (error) {
            console.error("Error saving weight:", error);
            toast.error("Помилка збереження ваги");
        }
    };

    const saveTargetWeight = async () => {
        if (!targetWeight || isNaN(Number(targetWeight))) {
            toast.error("Введіть коректну цільову вагу");
            return;
        }

        try {
            await apiService.put(Quries.API.USERS.UPDATE, {
                targetWeight: Number(targetWeight)
            });
            
            toast.success("Цільова вага збережена!");
        } catch (error) {
            console.error("Error saving target weight:", error);
            toast.error("Помилка збереження цільової ваги");
        }
    };

    const currentWeightValue = weightHistory.length > 0 
        ? weightHistory[weightHistory.length - 1].weight 
        : null;
    const weightDifference = currentWeightValue && targetWeight 
        ? currentWeightValue - Number(targetWeight) 
        : null;

    return (
        <div className="flex flex-col gap-4">
            {/* Custom Tab Navigation */}
            <div className="flex border-b mb-4">
                <Button
                    variant={activeTab === "posts" ? "default" : "ghost"}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                    data-state={activeTab === "posts" ? "active" : "inactive"}
                    onClick={() => setActiveTab("posts")}
                >
                    Пости
                </Button>
                <Button
                    variant={activeTab === "awards" ? "default" : "ghost"}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                    data-state={activeTab === "awards" ? "active" : "inactive"}
                    onClick={() => setActiveTab("awards")}
                >
                    Нагороди
                </Button>
                <Button
                    variant={activeTab === "progress" ? "default" : "ghost"}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                    data-state={activeTab === "progress" ? "active" : "inactive"}
                    onClick={() => setActiveTab("progress")}
                >
                    Прогрес Ваги
                </Button>
            </div>

            {/* Posts Section */}
            {activeTab === "posts" && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Мої пости</h2>
                        <CreatePostModal onPostCreated={refetchPosts} />
                    </div>

                    {postsLoading && (
                        <div className="text-center py-8">
                            <p>Завантаження постів...</p>
                        </div>
                    )}

                    {postsError && (
                        <div className="text-center py-8 text-red-500">
                            <p>Помилка завантаження постів: {postsError}</p>
                        </div>
                    )}

                    {!postsLoading && !postsError && posts.length > 0 && (
                        <div className="space-y-4">
                            {posts.map((post) => (
                                <PostCard
                                    key={post._id}
                                    post={post}
                                    currentUserId={currentUserId}
                                    onLike={toggleLike}
                                    onDelete={deletePost}
                                    onUpdate={updatePost}
                                    isAdmin={isAdmin}
                                />
                            ))}
                        </div>
                    )}

                    {!postsLoading && !postsError && posts.length === 0 && (
                        <Card className="border-dashed border-2">
                            <CardContent className="flex flex-col items-center justify-center p-6">
                                <div className="rounded-full bg-muted p-3">
                                    <Image className="h-6 w-6 text-muted-foreground"/>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold">Постів ще немає</h3>
                                <p className="text-sm text-muted-foreground text-center mt-2">
                                    Поділіться своєю фітнес-подорожжю, створивши свій перший пост.
                                    Ви зможете додавати фотографії та відстежувати свій прогрес.
                                </p>
                                <CreatePostModal onPostCreated={refetchPosts} />
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Awards Section */}
            {activeTab === "awards" && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Мої нагороди</h2>
                    </div>

                    {awardsLoading && (
                        <div className="text-center py-8">
                            <p>Завантаження нагород...</p>
                        </div>
                    )}

                    {awardsError && (
                        <div className="text-center py-8 text-red-500">
                            <p>Помилка завантаження нагород: {awardsError}</p>
                        </div>
                    )}

                    {!awardsLoading && !awardsError && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {awards && awards.length > 0 ? (
                                awards.map((award: any) => (
                                    <Card 
                                        key={award._id || award.id}
                                        className={!award.unlocked ? "opacity-60 relative" : ""}
                                    >
                                        <CardContent className="flex flex-col items-center p-6 relative">
                                            {!award.unlocked && (
                                                <div className="absolute top-4 right-4">
                                                    <Lock className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                            )}
                                            <Award 
                                                className={`h-12 w-12 ${award.unlocked ? 'text-yellow-500' : 'text-gray-400'}`}
                                            />
                                            <h3 className="mt-4 font-semibold">
                                                {award.title || award.name || 'Нагорода'}
                                            </h3>
                                            <p className="text-sm text-muted-foreground text-center mt-2">
                                                {award.description || 'Опис нагороди'}
                                            </p>
                                            {award.unlocked && award.dateEarned && (
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Отримано: {new Date(award.dateEarned).toLocaleDateString()}
                                                </p>
                                            )}
                                            {!award.unlocked && (
                                                <p className="text-xs text-muted-foreground mt-2 italic">
                                                    Заблоковано
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-8">
                                    <Card className="border-dashed border-2">
                                        <CardContent className="flex flex-col items-center p-6">
                                            <div className="rounded-full bg-muted p-3">
                                                <Award className="h-6 w-6 text-muted-foreground"/>
                                            </div>
                                            <h3 className="mt-4 font-semibold">Нагород ще немає</h3>
                                            <p className="text-sm text-muted-foreground text-center mt-2">
                                                Продовжуйте тренуватися щоб заробити нагороди!
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Weight Progress Section */}
            {activeTab === "progress" && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Прогрес Ваги</h2>

                    {/* Цільова вага */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Цільова Вага
                            </CardTitle>
                            <CardDescription>
                                Встановіть свою цільову вагу
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    placeholder="Цільова вага (кг)"
                                    value={targetWeight}
                                    onChange={(e) => setTargetWeight(e.target.value)}
                                />
                                <Button onClick={saveTargetWeight}>
                                    Зберегти
                                </Button>
                            </div>
                            {currentWeightValue && targetWeight && (
                                <div className="mt-4 p-4 bg-muted rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Поточна вага</p>
                                            <p className="text-2xl font-bold">{currentWeightValue} кг</p>
                                        </div>
                                        <div className="text-center">
                                            {weightDifference! > 0 ? (
                                                <TrendingDown className="h-8 w-8 text-green-500 mx-auto" />
                                            ) : (
                                                <TrendingUp className="h-8 w-8 text-blue-500 mx-auto" />
                                            )}
                                            <p className="text-sm font-medium mt-1">
                                                {Math.abs(weightDifference!).toFixed(1)} кг до цілі
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Ціль</p>
                                            <p className="text-2xl font-bold">{targetWeight} кг</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Додати запис ваги */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Додати Запис Ваги</CardTitle>
                            <CardDescription>
                                Записуйте свою вагу для відстеження прогресу
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    placeholder="Поточна вага (кг)"
                                    value={currentWeight}
                                    onChange={(e) => setCurrentWeight(e.target.value)}
                                />
                                <Button onClick={addWeightRecord}>
                                    Додати
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Історія ваги */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Історія Ваги</CardTitle>
                            <CardDescription>
                                Всі ваші записи ваги
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {weightHistory.length > 0 ? (
                                <div className="space-y-2">
                                    {[...weightHistory].reverse().slice(0, 10).map((record: any, index: number) => (
                                        <div 
                                            key={index} 
                                            className="flex justify-between items-center p-3 bg-muted rounded-lg"
                                        >
                                            <span className="font-medium">{record.weight} кг</span>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(record.date).toLocaleDateString('uk-UA', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-sm text-muted-foreground">
                                        Поки що немає записів. Додайте свій перший запис ваги!
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}