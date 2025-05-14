"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUserProfileStore } from "@/store/userProfileStore";

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session } = useSession();
    const { setProfile, profile } = useUserProfileStore();

    useEffect(() => {
        const fetchProfile = async () => {
            if (session?.user && !profile) {
                try {
                    const response = await fetch(`/api/user/profile/${session.user.id}`);
                    if (response.ok) {
                        const data = await response.json();
                        setProfile(data);
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
            }
        };

        fetchProfile();
    }, [session, setProfile, profile]);

    return <>{children}</>;
}
