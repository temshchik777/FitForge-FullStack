import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Award, Image, Plus, MinusCircle, PlusCircle} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import {apiService} from "@/api/api";
import {Quries} from "@/api/quries";
import useAwards from "@/api/useAwards/useAwards";
import { usePosts } from "@/hooks/usePosts";
import PostCard from "@/components/PostCard/PostCard";
import CreatePostModal from "@/components/PostModal/CreatePostModal.tsx";

export default function Account() {
    const [activeTab, setActiveTab] = useState("posts");
    const [weightValue, setWeightValue] = useState(0);
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

    const uploadAwards = async () => {
        const awardsData = [
            {
                title: "Early Bird",
                description: "You started your day early 5 times in a row!",
                type: "streak",
                threshold: 5,
                icon: "AlarmClock",
                imageUrl: "../awardsImg/alarm-clock-time-svgrepo-com.svg",
                content: "Early Bird Award - You started your day early 5 times in a row!",
                color: "blue"
            },
            {
                title: "First Badge",
                description: "You've earned your very first badge!",
                type: "achievement",
                threshold: 1,
                icon: "Badge",
                imageUrl: "../awardsImg/badge-svgrepo-com.svg",
                content: "First Badge Award - You've earned your very first badge!",
                color: "green"
            },
            {
                title: "10-Day Streak",
                description: "You have logged in for 10 days in a row!",
                type: "streak",
                threshold: 10,
                icon: "Calendar",
                imageUrl: "../awardsImg/calendar-svgrepo-com.svg",
                content: "10-Day Streak Award - You have logged in for 10 days in a row!",
                color: "yellow"
            },
            {
                title: "On Fire",
                description: "You maintained high activity for a whole week!",
                type: "activity",
                threshold: 7,
                icon: "Fire",
                imageUrl: "../awardsImg/fire-svgrepo-com.svg",
                content: "On Fire Award - You maintained high activity for a whole week!",
                color: "orange"
            },
            {
                title: "Flame Keeper",
                description: "Your motivation is burning bright!",
                type: "motivation",
                threshold: 30,
                icon: "Flame",
                imageUrl: "../awardsImg/flame-svgrepo-com.svg",
                content: "Flame Keeper Award - Your motivation is burning bright!",
                color: "red"
            },
            {
                title: "Strong Start",
                description: "You completed your first workout session!",
                type: "workout",
                threshold: 1,
                icon: "FlexedBiceps",
                imageUrl: "../awardsImg/flexed-biceps-medium-light-skin-tone-svgrepo-com.svg",
                content: "Strong Start Award - You completed your first workout session!",
                color: "purple"
            },
            {
                title: "Healthy Meal",
                description: "Logged your first healthy meal!",
                type: "nutrition",
                threshold: 1,
                icon: "Meal",
                imageUrl: "../awardsImg/meal-easter-svgrepo-com.svg",
                content: "Healthy Meal Award - Logged your first healthy meal!",
                color: "teal"
            },
            {
                title: "Medalist",
                description: "Earned 5 medals for achievements!",
                type: "achievement",
                threshold: 5,
                icon: "Medal",
                imageUrl: "../awardsImg/medal-svgrepo-com.svg",
                content: "Medalist Award - Earned 5 medals for achievements!",
                color: "gold"
            },
            {
                title: "Hydration Master",
                description: "Tracked your water intake for 7 days straight!",
                type: "streak",
                threshold: 7,
                icon: "WaterDrop",
                imageUrl: "../awardsImg/water-drop-svgrepo-com.svg",
                content: "Hydration Master Award - Tracked your water intake for 7 days straight!",
                color: "cyan"
            }
        ];

        try {
            const awardPromises = awardsData.map((award) => {
                return apiService.post(Quries.API.AWARDS.CREATE, award);
            });

            await Promise.all(awardPromises);
            console.log('All awards uploaded successfully');
        } catch (error) {
            console.error('Error uploading awards:', error);
        }
    };

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
                    Posts
                </Button>
                <Button
                    variant={activeTab === "awards" ? "default" : "ghost"}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                    data-state={activeTab === "awards" ? "active" : "inactive"}
                    onClick={() => setActiveTab("awards")}
                >
                    Awards
                </Button>
                <Button
                    variant={activeTab === "progress" ? "default" : "ghost"}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                    data-state={activeTab === "progress" ? "active" : "inactive"}
                    onClick={() => setActiveTab("progress")}
                >
                    Weight Progress
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
                        <Button onClick={uploadAwards} variant="outline" className="flex items-center gap-2">
                            <Plus className="h-4 w-4"/> Завантажити тестові нагороди
                        </Button>
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
                                    <Card key={award._id || award.id}>
                                        <CardContent className="flex flex-col items-center p-6">
                                            <Award className="h-12 w-12 text-yellow-500"/>
                                            <h3 className="mt-4 font-semibold">
                                                {award.title || award.name || 'Award'}
                                            </h3>
                                            <p className="text-sm text-muted-foreground text-center mt-2">
                                                {award.description || 'Award description'}
                                            </p>
                                            {award.dateEarned && (
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Earned: {new Date(award.dateEarned).toLocaleDateString()}
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
                                            <h3 className="mt-4 font-semibold">No awards yet</h3>
                                            <p className="text-sm text-muted-foreground text-center mt-2">
                                                Keep working out to earn awards!
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
                    <h2 className="text-2xl font-bold">Weight Progress</h2>

                    <Card>
                        <CardHeader>
                            <CardTitle>Track Your Weight Changes</CardTitle>
                            <CardDescription>
                                Use the controls to record your current weight
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span>Weight Loss</span>
                                        <span>Weight Gain</span>
                                    </div>

                                    <div className="flex items-center justify-center gap-4 my-6">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setWeightValue(Math.max(-20, weightValue - 1))}
                                        >
                                            <MinusCircle className="h-4 w-4"/>
                                        </Button>

                                        <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`absolute top-0 bottom-0 ${weightValue < 0 ? 'right-1/2' : 'left-1/2'} ${weightValue < 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                                                style={{
                                                    width: `${Math.abs(weightValue) * 2.5}%`,
                                                    maxWidth: '50%'
                                                }}
                                            />
                                            <div className="absolute top-0 bottom-0 left-1/2 w-4 h-4 bg-primary rounded-full -translate-x-1/2 -translate-y-1/4" />
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setWeightValue(Math.min(20, weightValue + 1))}
                                        >
                                            <PlusCircle className="h-4 w-4"/>
                                        </Button>
                                    </div>

                                    <div className="flex justify-between mt-2">
                                        <span className="text-sm text-muted-foreground">-20 lbs</span>
                                        <span className="text-sm font-medium">
                                            Current: {weightValue > 0 ? '+' : ''}{weightValue} lbs
                                        </span>
                                        <span className="text-sm text-muted-foreground">+20 lbs</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <h3 className="font-medium mb-2">Weight History</h3>
                                    <div className="h-[200px] bg-muted rounded-md flex items-center justify-center">
                                        <p className="text-sm text-muted-foreground">
                                            Your weight history chart will appear here
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}