import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getProfileByUserId } from "@/lib/queries";
import { ProfileEditForm } from "./profile-edit-form";

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    // Profile should exist due to trigger, but handle edge case
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-destructive">프로필을 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">프로필 수정</h1>
      <p className="text-muted-foreground mb-8">
        프로필 정보를 수정하세요
      </p>
      <ProfileEditForm profile={profile} />
    </div>
  );
}
