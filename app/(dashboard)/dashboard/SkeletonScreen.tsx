import "react-loading-skeleton/dist/skeleton.css";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";

interface Post {
  id: number;
  title: string;
  body: string;
}
export default function SkeletonScreenComponent() {
  const [data, setData] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 10000));

      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts",
      );
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} - Network response was not ok`,
        );
      }
      const result = await response.json();
      setData(result);
      setLoading(false);
    } catch (err: any) {
      setError("Error fetching data " + err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 mx-11 my-11">
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} className="animate-pulse">
            <Skeleton count={2} className="mb-5" height={50} width="80%" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="mx-11 my-11">
      {data.map(({ id, title, body }) => (
        <div key={id} className="mb-[20px]">
          <h2 className="font-bold text-pretty text-xl">{title}</h2>
          <p className="font-light text-gray-600 text-sm">{body}</p>
        </div>
      ))}
    </div>
  );
}
