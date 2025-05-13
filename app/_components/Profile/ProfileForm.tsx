"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  createProfile,
  updateProfile,
  getProfile,
} from "@/_services/profile.service";
import {
  NaijaRailsProfile,
  NaijaRailsProfileUpdate,
} from "@/types/naija-rails.types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProfileFormData = Omit<
  NaijaRailsProfile,
  "userId" | "_id" | "naijaRailsId" | "createdAt" | "updatedAt"
>;

export default function ProfileForm() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    defaultNationality: "",
    preferredBerth: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await getProfile(session.user.id);
        if (response.success && response.data) {
          const { _id, userId, createdAt, updatedAt, ...profileData } =
            response.data;
          setProfileId(_id);
          setFormData(profileData);
        }
      } catch (error) {
        toast.error("Failed to fetch profile");
      }
    };

    fetchProfile();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const profileData = {
        ...formData,
        userId: session.user.id,
      };

      const response = profileId
        ? await updateProfile(profileData)
        : await createProfile(profileData);

      if (response.success) {
        toast.success(
          profileId
            ? "Profile updated successfully"
            : "Profile created successfully"
        );
        if (!profileId && response.data?._id) {
          setProfileId(response.data._id);
        }
      } else {
        toast.error(response.error || "Failed to save profile");
      }
    } catch (error) {
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="defaultNationality">Nationality</Label>
        <Input
          id="defaultNationality"
          name="defaultNationality"
          value={formData.defaultNationality}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredBerth">Preferred Berth</Label>
        <Select
          value={formData.preferredBerth}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, preferredBerth: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select berth" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upper">Upper</SelectItem>
            <SelectItem value="lower">Lower</SelectItem>
            <SelectItem value="middle">Middle</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading}>
        {loading
          ? "Saving..."
          : profileId
          ? "Update Profile"
          : "Create Profile"}
      </Button>
    </form>
  );
}
