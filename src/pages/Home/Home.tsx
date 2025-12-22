import { useEffect } from "react";
import axios from "axios";

export default function Home() {
  useEffect(() => {
    axios.get("http://localhost:4000/api/posts")
      .then(res => console.log("Posts from backend:", res.data))
      .catch(err => console.error("Error fetching posts:", err.response?.data || err.message));
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4 h-full">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
      <div className="bg-muted/50 min-h-[50vh] flex-1 rounded-xl" />
    </div>
  );
}
