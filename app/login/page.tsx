import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { login } from "./actions";

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    message?: string;
    redirectTo?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message } = await searchParams;

  const errorMessages: Record<string, string> = {
    'invalid-credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'verification-failed': '이메일 인증에 실패했습니다. 다시 시도해주세요.',
  };

  const successMessages: Record<string, string> = {
    'check-email': '이메일을 확인하여 계정을 인증해주세요.',
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">로그인</CardTitle>
          <CardDescription>
            계정에 로그인하여 ART-XHIBIT의 모든 기능을 이용하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg text-sm">
              {errorMessages[error] || '로그인 중 오류가 발생했습니다.'}
            </div>
          )}
          {message && (
            <div className="bg-primary/15 text-primary px-4 py-3 rounded-lg text-sm">
              {successMessages[message] || message}
            </div>
          )}
          <form action={login} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded border-gray-300"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  로그인 상태 유지
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                비밀번호 찾기
              </Link>
            </div>
            <Button type="submit" className="w-full" size="lg">
              로그인
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">계정이 없으신가요? </span>
            <Link href="/register" className="text-primary hover:underline">
              회원가입
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
