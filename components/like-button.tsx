"use client";

import { Heart } from "lucide-react";
import { useTransition, useState, useOptimistic } from "react";
import { toggleLike } from "@/app/artwork/[id]/actions";
import { useRouter } from "next/navigation";

interface LikeButtonProps {
  artworkId: string;
  initialIsLiked: boolean;
  initialLikesCount: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export function LikeButton({
  artworkId,
  initialIsLiked,
  initialLikesCount,
  size = "sm",
  showCount = true,
}: LikeButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Optimistic state for immediate UI feedback
  const [optimisticState, setOptimisticState] = useOptimistic(
    { isLiked: initialIsLiked, likesCount: initialLikesCount },
    (state, newIsLiked: boolean) => ({
      isLiked: newIsLiked,
      likesCount: newIsLiked ? state.likesCount + 1 : state.likesCount - 1,
    })
  );

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);

    const newIsLiked = !optimisticState.isLiked;

    startTransition(async () => {
      // Update UI optimistically
      setOptimisticState(newIsLiked);

      // Call server action
      const result = await toggleLike(artworkId);

      if (!result.success) {
        // Revert optimistic update on error
        setOptimisticState(!newIsLiked);
        setError(result.error || "오류가 발생했습니다.");

        // Redirect to login if authentication error
        if (result.error === "로그인이 필요합니다.") {
          router.push("/login");
        }
      }
    });
  };

  const iconSize = size === "lg" ? "w-6 h-6" : size === "md" ? "w-5 h-5" : "w-4 h-4";

  return (
    <button
      onClick={handleLike}
      disabled={isPending}
      className="flex items-center space-x-1 hover:text-red-500 transition-colors disabled:opacity-50"
      aria-label={optimisticState.isLiked ? "좋아요 취소" : "좋아요"}
    >
      <Heart
        className={`${iconSize} transition-all ${
          optimisticState.isLiked
            ? "fill-red-500 text-red-500"
            : "fill-none text-current"
        }`}
      />
      {showCount && <span className="text-sm">{optimisticState.likesCount}</span>}
      {error && <span className="sr-only">{error}</span>}
    </button>
  );
}
