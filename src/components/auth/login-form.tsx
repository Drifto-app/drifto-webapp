"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { LoaderSmall } from "@/components/ui/loader";
import { toast } from "react-toastify";
import * as React from "react";
import { emailRegex } from "@/lib/utils";

import GoogleButton from "@/components/ui/google-button";
import AppleButton from "@/components/ui/apple-button";
import { showTopToast } from "@/components/toast/toast-util";

interface LoginFormProps extends React.ComponentProps<"form"> {
  setLoginPrincipal: (value: string) => void;
  setForgotPassword: (val: boolean) => void;
  setIsSignUp: (val: boolean) => void;
  nextUrl: string | null;
}

export function LoginForm({
  className,
  setLoginPrincipal,
  setForgotPassword,
  setIsSignUp,
  nextUrl,
  ...props
}: LoginFormProps) {
  const { login, googleLogin, appleLogin, isLoading } = useAuthStore();
  const router = useRouter();

  const [isPasswordShow, setIsPasswordShow] = useState<boolean>(false)
  const [principal, setPrincipal] = useState<string>("");
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleShowPassword = () => {
    setIsPasswordShow(!isPasswordShow)
  }

  const handlePrincipalChange = (data: string) => {
    setPrincipal(data);
    setLoginPrincipal(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (emailRegex.test(principal)) {
        await login({ email: principal, password });
      } else {
        await login({ username: principal, password });
      }

      router.push(nextUrl ?? '/');
    } catch (err: any) {
      setError(err.response?.data?.description || 'Login failed');
      showTopToast("error", err.response?.data?.description || 'Login failed')
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold">Login</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email & password below to login
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email or Username</Label>
          <Input
            id="email"
            type="text"
            placeholder="Email or Username"
            value={principal}
            onChange={(e) => handlePrincipalChange(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <span
              onClick={() => setForgotPassword(true)}
              className="ml-auto text-sm hover:underline cursor-pointer"
            >
              Forgot your password?
            </span>
          </div>
          <div className="flex flex-row justify-start items-center border rounded-md focus-within:border-blue-600">
            <Input
              id="password"
              type={isPasswordShow ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border-none shadow-none" />
            <div className="px-2 cursor-pointer" onClick={handleShowPassword}>
              {isPasswordShow
                ? <FaEyeSlash />
                : <FaEye />}
            </div>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {!isLoading ? "Login" : <LoaderSmall className="" />}
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or
          </span>
        </div>
        <div className="w-full flex justify-center items-center flex-col gap-3">
          <GoogleButton onSuccess={async (credentialResponse) => {
            try {
              const idToken = credentialResponse.credential;
              await googleLogin(idToken!);
              router.push(nextUrl ?? '/');
            } catch (err: any) {
              setError(err.response?.data?.description || 'Google Auth failed');
              showTopToast("error", err.response?.data?.description || 'Google Auth failed')
            }
          }} />
          <AppleButton onSuccess={async (response) => {
            try {
              await appleLogin(response);
              router.push(nextUrl ?? '/');
            } catch (err: any) {
              setError(err.response?.data?.description || 'Apple Auth failed');
              showTopToast("error", err.response?.data?.description || 'Apple Auth failed')
            }
          }} />
        </div>
      </div>
      <div className="text-center text-sm flex flex-row justify-center gap-2">
        Don&apos;t have an account?{" "}
        <p onClick={() => setIsSignUp(true)} className="hover:underline cursor-pointer text-blue-800">
          Sign up
        </p>
      </div>
    </form>
  )
}
