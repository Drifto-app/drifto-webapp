"use client";

import { LoginForm } from "@/components/auth/login-form";
import { useAuthStore } from "@/store/auth-store";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";
import Image from "next/image";
import { ForgotPassword } from "@/components/auth/forgot-password";
import { SignUpForm } from "@/components/auth/sign-up";
import { ScreenProvider } from "@/components/screen/screen-provider";
import { Button } from '@/components/ui/button';
import { FaArrowLeftLong } from 'react-icons/fa6';
import * as React from 'react';
import loginSidePic from "@/assests/login-side-pic.jpeg"
import logo from "@/assests/logo.png"

type View = "login" | "signup" | "forgot";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") ?? null

  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [loginPrincipal, setLoginPrincipal] = useState<string>("");
  const [view, setView] = useState<View>("login");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  const renderForm = () => {
    switch (view) {
      case "forgot":
        return (
          <ForgotPassword
            loginPrincipal={loginPrincipal}
            setForgotPassword={(val) => setView(val ? "login" : "forgot")}
          />
        );
      case "signup":
        return (
          <SignUpForm setIsSignUp={(val) => setView(val ? "signup" : "login")} nextUrl={next} />
        );
      case "login":
      default:
        return (
          <LoginForm
            setLoginPrincipal={setLoginPrincipal}
            setForgotPassword={(val) => setView(val ? "forgot" : "login")}
            setIsSignUp={(val) => setView(val ? "signup" : "login")}
            nextUrl={next}
          />
        );
    }
  };

  return (
    <ScreenProvider>
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-sm flex flex-col gap-12">
              <div className="">
                {view !== "login" &&
                  <Button
                    variant={'outline'}
                    onClick={() => {
                      setView("login");
                    }}
                  >
                    <FaArrowLeftLong />
                    Go back
                  </Button>
                }
              </div>
              <div className="relative w-12 h-12">
                <Image
                  src={logo}
                  alt="Logo"
                  fill
                  className="object-contain"
                />
              </div>
              {renderForm()}
            </div>
          </div>
        </div>
        <div className="bg-muted relative hidden lg:block">
          <Image
            src={loginSidePic}
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>
    </ScreenProvider>
  );
}
