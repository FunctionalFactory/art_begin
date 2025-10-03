import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signup } from "./actions";

interface RegisterPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { error } = await searchParams;

  const errorMessages: Record<string, string> = {
    'signup-failed': '회원가입에 실패했습니다. 이미 등록된 이메일이거나 잘못된 정보입니다.',
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
          <CardDescription>
            ART-XHIBIT에 가입하고 예술 작품을 발견하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg text-sm">
              {errorMessages[error] || '회원가입 중 오류가 발생했습니다.'}
            </div>
          )}
          <form action={signup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">비밀번호 확인</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 rounded border-gray-300"
                required
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                <Link href="/terms" className="text-primary hover:underline">
                  이용약관
                </Link>{" "}
                및{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  개인정보처리방침
                </Link>
                에 동의합니다
              </label>
            </div>

            <Button type="submit" className="w-full" size="lg">
              회원가입
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">이미 계정이 있으신가요? </span>
            <Link href="/login" className="text-primary hover:underline">
              로그인
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
