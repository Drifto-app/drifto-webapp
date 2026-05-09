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
import Link from "next/link";

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
      router.replace(next ?? "/");
    }
  }, [isAuthenticated, next, router]);

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
      <div className="grid min-h-svh bg-background text-foreground lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)]">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-11 w-11">
                <Image
                  src={logo}
                  alt="Drifto logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-lg font-black tracking-tight">Drifto</span>
            </Link>

            <Button asChild variant="outline" className="hidden rounded-full md:flex">
              <Link href="/">Continue as guest</Link>
            </Button>
          </div>

          <div className="flex flex-1 items-center justify-center py-8 lg:min-h-0">
            <div className="flex w-full max-w-md flex-col rounded-[2rem] border border-border bg-card p-6 shadow-sm md:p-8 lg:max-h-[calc(100svh-11rem)] lg:min-h-0">
              <div className="mb-8 min-h-10 flex-shrink-0">
                {view !== "login" &&
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                      setView("login");
                    }}
                  >
                    <FaArrowLeftLong />
                    Go back
                  </Button>
                }
              </div>
              <div className="min-h-0 lg:overflow-y-auto lg:pr-2">
                {renderForm()}
              </div>
            </div>
          </div>
        </div>

        <div className="relative hidden overflow-hidden border-l border-border bg-muted lg:block">
          <Image
            src={loginSidePic}
            alt="People at a Drifto experience"
            className="absolute inset-0 h-full w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/55 to-blue-950/75" />
          <div className="absolute inset-x-10 bottom-10 rounded-[2rem] border border-white/15 bg-background/80 p-8 text-foreground shadow-2xl backdrop-blur">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue-700 dark:text-blue-300">
              Discover, host, connect
            </p>
            <h2 className="mt-4 max-w-xl text-4xl font-black leading-tight tracking-tight">
              Sign in to manage plans, create experiences, and stay connected.
            </h2>
            {/*<p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">*/}
            {/*  Desktop auth now supports the same account flow as mobile while keeping Drifto&apos;s existing theme and navigation direction.*/}
            {/*</p>*/}
          </div>
        </div>
      </div>
    </ScreenProvider>
  );
}
