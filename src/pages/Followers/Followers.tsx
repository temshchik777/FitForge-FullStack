import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";
import { apiService } from "@/api/api";
import { Quries } from "@/api/quries";
import { toast } from "react-toastify";

export default function Followers() {
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"followers" | "following">("followers");
  const [loading, setLoading] = useState(true);
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);

  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        setLoading(true);
        if (!currentUserId) return;
        const profile = await apiService.get(Quries.API.USERS.GET_BY_ID(String(currentUserId)));
        setFollowersList(profile?.followedBy || []);
        setFollowingList(profile?.followers || []);
      } catch (error) {
        console.error("Error fetching followers:", error);
        toast.error("Помилка завантаження підписок");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [currentUserId]);

  const handleUnfollow = async (userId: string) => {
    if (unfollowingId) return;
    setUnfollowingId(userId);
    try {
      await apiService.delete(Quries.API.USERS.DELETE_FOLLOWER(userId));
      setFollowingList(prev => prev.filter(u => u._id !== userId));
      toast.success("Ви відписалися");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Помилка відписки";
      toast.error(msg);
    } finally {
      setUnfollowingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Завантаження...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Підписки та підписники</h1>
        <p className="text-muted-foreground mt-2">Керуйте вашими підписками та переглядайте підписників</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === "followers" ? "default" : "ghost"}
          onClick={() => setActiveTab("followers")}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
        >
          Підписники ({followersList.length})
        </Button>
        <Button
          variant={activeTab === "following" ? "default" : "ghost"}
          onClick={() => setActiveTab("following")}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
        >
          Підписки ({followingList.length})
        </Button>
      </div>

      {/* Followers */}
      {activeTab === "followers" && (
        <Card>
          <CardHeader>
            <CardTitle>Підписники</CardTitle>
            <CardDescription>Люди, які стежать за вами</CardDescription>
          </CardHeader>
          <CardContent>
            {followersList.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Поки немає підписників</p>
            ) : (
              <div className="space-y-3">
                {followersList.map((u: any) => (
                  <div key={u._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={u.avatarUrl} />
                      <AvatarFallback>{`${(u.firstName || "").charAt(0)}${(u.lastName || "").charAt(0)}`}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{u.firstName} {u.lastName}</p>
                      <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Following */}
      {activeTab === "following" && (
        <Card>
          <CardHeader>
            <CardTitle>Підписки</CardTitle>
            <CardDescription>На кого ви підписані</CardDescription>
          </CardHeader>
          <CardContent>
            {followingList.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Поки ні на кого не підписані</p>
            ) : (
              <div className="space-y-3">
                {followingList.map((u: any) => (
                  <div key={u._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={u.avatarUrl} />
                      <AvatarFallback>{`${(u.firstName || "").charAt(0)}${(u.lastName || "").charAt(0)}`}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{u.firstName} {u.lastName}</p>
                      <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnfollow(u._id)}
                      disabled={unfollowingId === u._id}
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
