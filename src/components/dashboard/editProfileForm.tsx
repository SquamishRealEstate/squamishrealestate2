import { useState } from "react";
import { supabase } from "@/config/supabaseClient";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  EyeOff,
  Key,
  Phone,
  X,
  Check,
  ArrowRight,
  Eye,
  User,
} from "lucide-react";

interface EditProfileFormProps {
  user: any;
}

interface FormData {
  fullName: string;
  phone: string;
  newPassword: string;
  propertyTypes: string[]; // Define as array of strings
  neighbourhoods: string[]; // Define as array of strings
}

export default function EditProfileForm({ user }: EditProfileFormProps) {
  const [triedToSubmit, setTriedToSubmit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const PROPERTY_TYPES = [
    "Detached",
    "Townhouse",
    "Condo",
    "Duplex",
    "Land",
    "Multi-Family",
  ];
  const NEIGHBOURHOODS = [
    "Brackendale",
    "Brennan Center",
    "Business Park",
    "Dentville",
    "Downtown Squamish",
    "Garibaldi Estates",
    "Garibaldi Highlands",
    "Hospital Hill",
    "Northyards",
    "Paradise Valley",
    "Plateau",
    "Tantalus",
    "University Highlands",
    "Valleycliffe",
  ];

  const [formData, setFormData] = useState<FormData>({
    fullName: user?.user_metadata?.full_name || "",
    phone: user?.user_metadata?.phone || "",
    newPassword: "",
    propertyTypes: user?.user_metadata?.property_types || [],
    neighbourhoods: user?.user_metadata?.neighbourhoods || [],
  });

  const toggleSelection = (
    category: "propertyTypes" | "neighbourhoods",
    item: string,
  ) => {
    setFormData((prev) => {
      const list = prev[category];
      const newList = list.includes(item)
        ? list.filter((i) => i !== item) // TypeScript now knows 'i' is a string!
        : [...list, item];
      return { ...prev, [category]: newList };
    });
  };

  const validations = {
    // Assuming name is required based on your UI
    name: formData.fullName.trim().length >= 2,

    // Allow empty, but if provided, must match regex
    phone:
      formData.phone.trim() === "" ||
      /^\+?[0-9\s\-()]{7,}$/.test(formData.phone),

    // Password is only validated if it's NOT empty
    newPassword: {
      length: formData.newPassword.length >= 8,
      upper: /[A-Z]/.test(formData.newPassword),
      lower: /[a-z]/.test(formData.newPassword),
      number: /[0-9]/.test(formData.newPassword),
      special: /[!@#$%^&*]/.test(formData.newPassword),
    },
  };
  const passwordRequirements = [
    { label: "8 characters minimum", met: validations.newPassword.length },
    { label: "One uppercase character", met: validations.newPassword.upper },
    { label: "One lowercase character", met: validations.newPassword.lower },
    { label: "One number", met: validations.newPassword.number },
    { label: "One special character", met: validations.newPassword.special },
  ];

  const allPasswordMet =
    formData.newPassword.length === 0 ||
    Object.values(validations.newPassword).every((req) => req === true);

  const isFormValid = validations.name && validations.phone && allPasswordMet;

  // const handleGetLocation = async () => {
  //   if (!navigator.geolocation) return;

  //   navigator.geolocation.getCurrentPosition(async (position) => {
  //     const { latitude, longitude } = position.coords;

  //     try {
  //       const response = await fetch(
  //         `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${longitude}&latitude=${latitude}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`,
  //       );

  //       const data = await response.json();

  //       const fullAddress =
  //         data.features?.[0]?.properties?.full_address || "Address not found";

  //       setFormData((prev) => ({
  //         ...prev,
  //         address: fullAddress,
  //       }));
  //     } catch (error) {
  //       console.error("Geocoding error:", error);
  //     }
  //   });
  // };

  const getFieldStatus = (isValid: boolean, value: string) => {
    const hasInteracted = value.length > 0 || triedToSubmit;
    return {
      showError: hasInteracted && !isValid,
      className: `pl-10 h-10  ${
        hasInteracted && !isValid
          ? "border-destructive ring-destructive/20 animate-shake"
          : "border-border focus:ring-ring/30 focus:border-primary"
      }`,
    };
  };

  const handleUpdate = async () => {
    console.log("Form Data:", formData);
    setTriedToSubmit(true);
    if (!isFormValid) {
      console.log(validations);
      console.log("Invalid form data");
      setTriedToSubmit(false);
      return;
    }
    console.log(formData);

    try {
      const updateData: any = {
        full_name: formData.fullName,
        property_types: formData.propertyTypes,
        neighbourhoods: formData.neighbourhoods,
      };

      // Only add if changed or provided
      if (formData.phone) updateData.phone = formData.phone;
      // if (formData.address) updateData.address = formData.address;
      const { error: metaError } = await supabase.auth.updateUser({
        data: updateData,
      });
      if (metaError) throw metaError;

      // 3. Update password only if provided
      if (formData.newPassword.trim()) {
        console.log("Updating password");
        const { error: passError } = await supabase.auth.updateUser({
          password: formData.newPassword,
        });
        if (passError) {
          if (
            passError.message
              .toLowerCase()
              .includes(
                "new password should be different from the old password",
              )
          ) {
            setErrorMessage(
              "New password must be different from your old password.",
            );
          } else {
            setErrorMessage("Failed to update password. Please try again.");
          }
          throw passError;
        }
      }

      setMessage("Profile updated successfully!");
      setTriedToSubmit(false);

      //   await supabase.auth.updateUser({
      //     data: {
      //       full_name: formData.fullName,
      //       address: formData.address,
      //       phone: formData.phone,
      //     },
      //   });

      //   if (formData.newPassword.trim()) {
      //     await supabase.auth.updateUser({
      //       password: formData.newPassword,
      //     });
      //   }

      //   setMessage("Profile updated successfully!");
      //   setTriedToSubmit(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setTriedToSubmit(false);
      return;
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Header */}
      <div className="border-b px-8 py-6">
        <h2 className="text-lg font-bold tracking-tight">Profile Settings</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage your personal information and account security.
        </p>
      </div>

      <div className="p-8 space-y-10">
        {/* Personal Information */}
        <section className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Personal Information</h3>

            <p className="text-sm text-muted-foreground">
              Update your profile details and contact information.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={formData.fullName}
                  placeholder="Your Name"
                  className={
                    getFieldStatus(validations.name, formData.fullName)
                      .className
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fullName: e.target.value,
                    })
                  }
                />
              </div>

              {(formData.fullName.length > 0 || triedToSubmit) &&
                !validations.name && (
                  <p className="flex items-center gap-1.5 text-[11px] text-destructive px-1">
                    <X size={12} />
                    <span>At least 2 characters</span>
                  </p>
                )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={formData.phone}
                  placeholder="+1 (555) 123-4567"
                  className={
                    getFieldStatus(validations.phone, formData.phone).className
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>

              {(formData.phone.length > 0 || triedToSubmit) &&
                !validations.phone && (
                  <p className="flex items-center gap-1.5 text-[11px] text-destructive px-1">
                    <X size={12} />
                    <span>Please enter a valid phone number</span>
                  </p>
                )}
            </div>
          </div>

          {/* Address */}
          {/* <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>

            <div className="flex gap-3">
              <AddressAutocomplete
                value={formData.address} // Pass this so it can clear on reset
                onSelect={(data: any) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: data.address,
                  }))
                }
              />

              <Button
                variant="outline"
                onClick={handleGetLocation}
                className="h-10 w-10 p-0"
              >
                <LocateFixed className="h-5 w-5" />
              </Button>
            </div>
          </div> */}
        </section>

        {/* Preferences Section */}
        <section className="space-y-6 border-t pt-8">
          <div>
            <h3 className="text-lg font-semibold">Preferences</h3>
            <p className="text-sm text-muted-foreground">
              Select property types and areas you&apos;re interested in.
            </p>
          </div>

          <div className="space-y-6">
            {/* Property Types */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Interested Property Types
              </label>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPES.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={
                      formData.propertyTypes.includes(type)
                        ? "default"
                        : "outline"
                    }
                    className="rounded-full h-8 px-4 text-xs"
                    onClick={() => toggleSelection("propertyTypes", type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Neighbourhoods */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Neighbourhoods</label>
              <div className="flex flex-wrap gap-2">
                {NEIGHBOURHOODS.map((area) => (
                  <Button
                    key={area}
                    type="button"
                    variant={
                      formData.neighbourhoods.includes(area)
                        ? "default"
                        : "outline"
                    }
                    className="rounded-full h-8 px-4 text-xs"
                    onClick={() => toggleSelection("neighbourhoods", area)}
                  >
                    {area}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="space-y-6 border-t pt-8">
          <div>
            <h3 className="text-lg font-semibold">Security</h3>

            <p className="text-sm text-muted-foreground">
              Update your password to keep your account secure.
            </p>
          </div>

          <div className="max-w-xl space-y-2">
            <label className="text-sm font-medium">New Password</label>

            <div className="relative">
              <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className={
                  getFieldStatus(allPasswordMet, formData.newPassword).className
                }
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    newPassword: e.target.value,
                  })
                }
              />

              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {(formData.newPassword.length > 0 ||
              (formData.newPassword.length !== 0 && triedToSubmit)) && (
              <div
                className={`mt-3 grid grid-cols-1 gap-1.5 p-3 rounded-xl border ${!allPasswordMet ? "" : "bg-slate-50/50 border-border"}`}
              >
                {passwordRequirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    {req.met ? (
                      <Check size={12} className="text-emerald-600" />
                    ) : (
                      <X
                        size={12}
                        className={
                          !allPasswordMet
                            ? "text-destructive"
                            : "text-slate-400"
                        }
                      />
                    )}
                    <span
                      className={
                        req.met
                          ? "text-emerald-700 font-medium"
                          : !allPasswordMet
                            ? "text-destructive"
                            : "text-slate-500"
                      }
                    >
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-[44px]">
            {errorMessage && (
              <div className="p-4 rounded-xl bg-destructive/5 text-destructive text-sm font-medium border border-destructive/20 animate-in fade-in zoom-in-95">
                <span>{errorMessage}</span>
              </div>
            )}
            {message && (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100 animate-in fade-in zoom-in-95">
                <span>{message}</span>
              </div>
            )}
          </div>

          <Button
            size="lg"
            onClick={handleUpdate}
            disabled={triedToSubmit}
            className="min-w-[180px]"
          >
            {!triedToSubmit && <ArrowRight className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
