"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { updateProfileAction } from "./actions";
import type { Database } from "@/lib/types";

interface ProfileEditFormProps {
  profile: Database.Profile;
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [isPending, startTransition] = useTransition();
  const [username, setUsername] = useState(profile.username || "");
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [profileImage, setProfileImage] = useState(profile.profile_image || "");
  const [role, setRole] = useState(profile.role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("display_name", displayName);
      formData.append("bio", bio);
      formData.append("profile_image", profileImage);
      formData.append("role", role);

      const result = await updateProfileAction(formData);

      if (result.success) {
        toast.success(result.message || "프로필이 업데이트되었습니다!");
      } else {
        toast.error(result.error || "프로필 업데이트에 실패했습니다.");
      }
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">사용자명 *</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="예: artist_kim"
              disabled={isPending}
              required
            />
            <p className="text-sm text-muted-foreground">
              영문, 숫자, 언더스코어(_), 하이픈(-) 사용 가능 (3-30자)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">표시 이름</Label>
            <Input
              id="display_name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="예: 김작가"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">자기소개</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="자신을 소개해주세요..."
              disabled={isPending}
              className="w-full min-h-[120px] px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile_image">프로필 이미지 URL</Label>
            <Input
              id="profile_image"
              type="url"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              disabled={isPending}
            />
            <p className="text-sm text-muted-foreground">
              이미지 URL을 입력하세요
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">역할</Label>
            <Select value={role} onValueChange={(value: "buyer" | "artist") => setRole(value)} disabled={isPending}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buyer">구매자</SelectItem>
                <SelectItem value="artist">작가</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              작가로 변경하면 작품 등록이 가능합니다
            </p>
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "저장 중..." : "프로필 저장"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
