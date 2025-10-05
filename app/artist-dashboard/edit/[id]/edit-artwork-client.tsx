"use client";

import { useState } from "react";
import { ArtworkForm } from "@/components/artwork-form";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface EditArtworkClientProps {
  artworkId: string;
  initialData: {
    title: string;
    description: string;
    image_url: string;
    category: string;
    sale_type: "auction" | "fixed";
    fixed_price?: number;
    current_price?: number;
    auction_end_time?: string;
  };
  updateAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  deleteAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

export function EditArtworkClient({
  artworkId,
  initialData,
  updateAction,
  deleteAction,
}: EditArtworkClientProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    const formData = new FormData();
    formData.append("artwork_id", artworkId);

    const result = await deleteAction(formData);

    if (!result.success) {
      setDeleteError(result.error || "삭제 중 오류가 발생했습니다.");
      setIsDeleting(false);
    }
    // If successful, redirect will happen in the action
  };

  return (
    <div className="space-y-6">
      <ArtworkForm
        initialData={initialData}
        onSubmit={async (formData) => {
          formData.append("artwork_id", artworkId);
          return await updateAction(formData);
        }}
        submitLabel="수정 완료"
      />

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-2 text-destructive">위험 구역</h3>
        <p className="text-sm text-muted-foreground mb-4">
          작품을 삭제하면 복구할 수 없습니다.
        </p>

        {deleteError && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-4">
            {deleteError}
          </div>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting}>
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "삭제 중..." : "작품 삭제"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                이 작업은 되돌릴 수 없습니다. 작품이 영구적으로 삭제됩니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
