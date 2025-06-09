"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Callback() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const code = searchParams.get("code");

        const getToken = async () => {
            if (!code) {
                router.push("/welcome");
                return;
            }

            try {
                const response = await fetch("/api/kingschat/token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ code }),
                });

                const data = await response.json();

                if (data.access_token) {
                    localStorage.setItem("kingschat_token", data.access_token);
                    router.push("/");
                } else {
                    console.error("Token error:", data);
                    router.push("/welcome");
                }
            } catch (err) {
                console.error("API call failed:", err);
                router.push("/welcome");
            }
        };

        getToken();
    }, [searchParams, router]);

    return <p>Logging you in...</p>;
}
