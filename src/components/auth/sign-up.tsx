import * as React from "react";
import { cn, passwordRegex, usernameRegex } from '@/lib/utils';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoaderSmall } from "@/components/ui/loader";
import { toast } from "react-toastify";
import { api } from "@/lib/axios";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Calendar28 } from "@/components/ui/date-input";
import { Autocomplete, useLoadScript } from "@react-google-maps/api";
import GoogleButton from "@/components/ui/google-button";
import AppleButton from "@/components/ui/apple-button";
import { showTopToast } from "@/components/toast/toast-util";
import { FaArrowLeftLong } from 'react-icons/fa6';

interface SignUpFormProps extends React.ComponentProps<"form"> {
    setIsSignUp: (value: boolean) => void;
    nextUrl: string | null;
}

export const SignUpForm = ({
    setIsSignUp,
    nextUrl,
    className,
    ...props
}: SignUpFormProps) => {
    const { googleLogin, appleLogin, setUser, setTokens } = useAuthStore();
    const router = useRouter();

    const [isLoading, setLoading] = React.useState<boolean>(false);
    const [emailOtp, setEmailOtp] = React.useState<boolean>(false);
    const [isRegister, setIsRegister] = React.useState<boolean>(false);
    const [otpValue, setOtpValue] = React.useState<string>("");
    const [isResendVisible, setIsResendVisible] = useState(false);
    const [isPasswordShow, setIsPasswordShow] = useState<boolean>(false)
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [isCheckingUsername, setCheckingUsername] = useState(false);
    const [isUsernameValid, setUsernameValid] = useState<boolean | null>(null);
    const [usernameError, setUsernameError] = useState<string>("");

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        libraries: ["places"],
        language: "en-US",
        region: "ng",
        // optional: you can set region: 'ng' or language: 'en'
    });

    const [email, setEmail] = React.useState<string>("");
    const [username, setUsername] = React.useState<string>("");
    const [firstName, setFirstName] = React.useState<string>("");
    const [lastName, setLastName] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");
    const [dob, setDob] = React.useState<Date>(new Date(Date.now()));
    const [city, setCity] = React.useState<string>("");
    const [isAgreed, setIsAgreed] = React.useState<boolean>(false);
    const [profilePic, setProfilePic] = useState<File | null>(null);

    const delay: number = 30000

    const usernameDebounce = useRef<NodeJS.Timeout | null>(null);

    const isPasswordValid = password != null && password != "" && passwordRegex.test(password);
    const showPasswordRequirementsMessage = password && !isPasswordValid;

    useEffect(() => {
        if (!emailOtp || isResendVisible) return;

        const timer = setTimeout(() => {
            setIsResendVisible(true);
        }, delay);
        return () => clearTimeout(timer);

    }, [emailOtp, isResendVisible, delay]);

    useEffect(() => {
        if (!emailOtp) return;

        setIsResendVisible(false)

        if (otpValue.length === 6) {
            submitOtp();
        }
    }, [otpValue, emailOtp]);

    useEffect(() => {
        setUsernameValid(null);
        setUsernameError("");
        if (usernameDebounce.current) clearTimeout(usernameDebounce.current);

        // only check once they’ve typed at least 3 chars
        if (username.trim().length < 3) {
            setUsernameError("Username must be at least 3 characters");
            return;
        }

        if (!usernameRegex.test(username)) {
            setUsernameError("Username can only contain letters, numbers, and underscores.");
            return;
        }

        usernameDebounce.current = setTimeout(async () => {
            try {
                setCheckingUsername(true);
                const { data } = await api.get(
                    `/auth/username/${username}/validate`,
                );
                setCheckingUsername(false);

                if (!data.data) {
                    setUsernameValid(true);
                } else {
                    setUsernameValid(false);
                    setUsernameError("Username is not available");
                }
            } catch (err: any) {
                setCheckingUsername(false);
                setUsernameValid(false);
                setUsernameError("Unable to validate username");
            }
        }, 500);

        return () => {
            if (usernameDebounce.current) clearTimeout(usernameDebounce.current);
        };
    }, [username]);

    if (loadError) {
        return <p>Failed to load maps script</p>;
    }
    if (!isLoaded) {
        return <LoaderSmall className="absolute right-2 top-2" />
    }

    const autocompleteOptions = {
        types: ['(cities)'],
        componentRestrictions: {
            country: 'ng'
        },
        // strictBounds: false,
    };


    const onPlaceChanged = () => {
        if (!autocomplete) return;
        const place = autocomplete.getPlace();
        const cityComponent = place.address_components?.find(c =>
            c.types.includes("locality")
        ) || place.address_components?.find(c =>
            c.types.includes("administrative_area_level_1")
        );
        setCity(cityComponent?.long_name || place.formatted_address || "");
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setIsResendVisible(false);

        try {
            const response = await api.post("/auth/register/email", {
                email,
            })

            setLoading(false);
        } catch (err: any) {
            setLoading(false);
            showTopToast("error", err.response?.data?.description || 'Email Request Failed');
        }
    }

    const handleShowPassword = () => {
        setIsPasswordShow(!isPasswordShow)
    }

    const handleEmailRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post("/auth/register/email", {
                email,
            })

            setLoading(false);
            setEmailOtp(true);
        } catch (err: any) {
            setLoading(false);
            showTopToast("error", err.response?.data?.description || 'Email Request Failed');
        }
    }

    const submitOtp = async () => {
        setLoading(true);

        try {
            const response = await api.post("/auth/verify/email", {
                email, token: otpValue,
            })

            setLoading(false);
            setEmailOtp(false);
            setOtpValue("");
            setIsRegister(true)
        } catch (err: any) {
            setLoading(false);
            showTopToast("error", err.response?.data?.description || 'Email Request Failed');
            setOtpValue("");
        }
    }

    const handleOtpVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitOtp();
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfilePic(e.target.files?.[0] || null);
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isPasswordValid) {
            showTopToast("error", 'Password does not meet requirements');
            return;
        }

        if (!isUsernameValid) {
            showTopToast("error", usernameError || "Please fix your username first");
            return;
        }

        if (!usernameRegex.test(username)) {
            showTopToast("error", "Username can only contain letters, numbers, and underscores.");
            return;
        }


        if (!firstName || !lastName || !password || !username || !dob || !city || !isAgreed) {
            showTopToast("error", "Complete all filed")
            return;
        }

        setLoading(true);

        const requestBody = {
            email, firstName, lastName, dob, password, username, city, agreed: isAgreed
        }

        const formData = new FormData();
        formData.append(
            'userData',
            new Blob([JSON.stringify(requestBody)], { type: 'application/json' })
        );

        if (profilePic) {
            formData.append('profileImage', profilePic, profilePic.name);
        }


        try {
            const { data } = await api.post('/auth/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setLoading(false);
            showTopToast("success", "Sign up successful");
            setIsSignUp(false)

            setTokens(
                data.data.accessToken,
                data.data.refreshToken,
            )

            setUser(data.data.user)

            router.push(nextUrl ?? "/")
        } catch (err: any) {
            setLoading(false);
            showTopToast("error", err.response?.data?.description || 'Email Request Failed');
            setOtpValue("");
        }
    }

    if (emailOtp) {
        return (
            <form className={cn("flex flex-col gap-6", className)} onSubmit={handleOtpVerify} {...props}>
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-extrabold">Create Account</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Enter your OTP to continue
                    </p>
                </div>
                <div className="grid gap-4 justify-center">
                    <InputOTP
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        value={otpValue}
                        onChange={(value) => setOtpValue(value)}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} className="otp-slot" />
                        </InputOTPGroup>
                        <InputOTPGroup>
                            <InputOTPSlot index={1} className="otp-slot" />
                        </InputOTPGroup>
                        <InputOTPGroup>
                            <InputOTPSlot index={2} className="otp-slot" />
                        </InputOTPGroup>
                        <InputOTPGroup>
                            <InputOTPSlot index={3} className="otp-slot" />
                        </InputOTPGroup>
                        <InputOTPGroup>
                            <InputOTPSlot index={4} className="otp-slot" />
                        </InputOTPGroup>
                        <InputOTPGroup>
                            <InputOTPSlot index={5} className="otp-slot" />
                        </InputOTPGroup>
                    </InputOTP>
                    <div className="text-center text-sm">
                        Enter your one-time password.
                    </div>
                </div>
                <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                >
                    {!isLoading ? "Submit" : <LoaderSmall className="" />}
                </Button>
                <div className="flex flex-row gap-2 justify-center text-sm">
                    <p className="text-neutral-500">OTP not received?</p>
                    {
                        isResendVisible
                            ? <div className="hover:underline cursor-pointer" onClick={handleResendOtp}>Resend</div>
                            : <div className="text-neutral-400">Resend</div>
                    }
                </div>
            </form>
        )
    }

    if (isRegister) {
        return (
            <form className={cn("flex flex-col gap-6", className)} onSubmit={handleRegisterSubmit} {...props}>
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-extrabold">Create Account</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Create an account with your info.
                    </p>
                </div>
                <div className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="principal">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder={email}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="fname">First Name</Label>
                        <Input
                            id="fname"
                            type="text"
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="lnane">Last Name</Label>
                        <Input
                            id="lnane"
                            type="text"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <div className="relative flex flex-row gap-2">
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                                className={cn(
                                    "w-full pr-10",
                                    isUsernameValid === false && "border-red-500",
                                    isUsernameValid === true && "border-green-500"
                                )}
                            />
                            {isCheckingUsername && (
                                <LoaderSmall className="absolute right-2 top-2" />
                            )}
                        </div>
                        {usernameError && (
                            <p className="text-sm text-red-600">{usernameError}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="flex flex-row justify-start items-center border rounded-md">
                            <Input
                                id="password"
                                type={isPasswordShow ? 'text' : 'password'}
                                value={password}
                                placeholder="Password"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full border-none shadow-none" />
                            <div className="px-2 cursor-pointer" onClick={handleShowPassword}>
                                {isPasswordShow
                                    ? <FaEyeSlash />
                                    : <FaEye />}
                            </div>
                        </div>
                        {showPasswordRequirementsMessage && (
                            <p className="text-red-600 text-sm">
                                Password must be at least 8 characters long and include uppercase, lowercase, number, and special character
                            </p>
                        )}
                    </div>
                    <Calendar28 date={dob} setDate={setDob} required={true} label="Date of Birth" />
                    <div className="grid gap-2">
                        <Label htmlFor="city">City</Label>
                        <Autocomplete
                            onLoad={inst => setAutocomplete(inst)}
                            onPlaceChanged={onPlaceChanged}
                            options={autocompleteOptions}
                        >
                            <Input
                                id="city"
                                type="text"
                                placeholder="Start typing your city"
                                value={city}
                                onChange={e => setCity(e.target.value)}
                                required
                                className="w-full"
                            />
                        </Autocomplete>
                    </div>
                    <div className="w-full flex flex-row items-center gap-2">
                        <input
                            id="isAgreed"
                            type="checkbox"
                            checked={isAgreed}
                            onChange={(e) => setIsAgreed(e.target.checked)}
                            required
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="isAgreed" className="text-sm">
                            Agree to{' '}
                            <a href="#" className="text-blue-600 hover:underline">
                                terms and conditions
                            </a>
                        </label>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="profilepic">Profile Picture</Label>
                        <Input
                            id="profilePic"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={isLoading || !isAgreed}
                    >
                        {!isLoading ? "Submit" : <LoaderSmall className="" />}
                    </Button>
                </div>
                <div className="text-center text-sm flex flex-row justify-center gap-2">
                    Already have an account?{" "}
                    <p onClick={() => setIsSignUp(false)} className="hover:underline cursor-pointer">
                        Login
                    </p>
                </div>
            </form>
        )
    }

    return (
        <form className={cn("flex flex-col gap-6", className)} onSubmit={handleEmailRegister} {...props}>
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-extrabold">Create Account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Enter your email for verification
                </p>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading}
            >
                {!isLoading ? "Submit" : <LoaderSmall className="" />}
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

                        router.push("/");
                    } catch (err: any) {
                        showTopToast("error", err.response?.data?.description || 'Google Auth failed');
                    }
                }} />
                <AppleButton onSuccess={async (response) => {
                    try {
                        await appleLogin(response);
                        router.push("/");
                    } catch (err: any) {
                        showTopToast("error", err.response?.data?.description || 'Apple Auth failed');
                    }
                }} />
            </div>
        </form>
    )
}