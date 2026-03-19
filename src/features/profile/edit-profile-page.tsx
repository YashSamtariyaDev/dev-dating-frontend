'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useProfile, useUpdateProfile, useUploadPhoto } from '@/hooks/use-api';
import { MobileShell } from '@/components/layout/MobileShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ChevronLeft,
    Camera,
    Briefcase,
    MapPin,
    User,
    Github,
    Linkedin,
    Globe,
    Check,
    Cake,
    Heart
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';

export function EditProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { data: profile, isLoading: profileLoading } = useProfile();
    const updateProfile = useUpdateProfile();
    const uploadPhoto = useUploadPhoto();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        bio: '',
        gender: '',
        techStack: [] as string[],
        experienceLevel: '',
        location: '',
        githubUsername: '',
        linkedinUrl: '',
        portfolioUrl: '',
        age: 18,
        lookingFor: '',
        isAvailable: false,
    });


    useEffect(() => {
        if (profile) {
            setFormData({
                bio: profile.bio || '',
                gender: profile.gender || '',
                techStack: profile.techStack || [],
                experienceLevel: profile.experienceLevel || '',
                location: profile.location || '',
                githubUsername: profile.githubUsername || '',
                linkedinUrl: profile.linkedinUrl || '',
                portfolioUrl: profile.portfolioUrl || '',
                age: profile.age || 18,
                lookingFor: profile.lookingFor || '',
                isAvailable: profile.isAvailable || false,
            });

        }
    }, [profile]);

    const handleSave = async () => {
        try {
            // Clean empty strings for optional URL fields
            const submissionData = { ...formData };
            if (!submissionData.githubUsername) delete (submissionData as any).githubUsername;
            if (!submissionData.linkedinUrl) delete (submissionData as any).linkedinUrl;
            if (!submissionData.portfolioUrl) delete (submissionData as any).portfolioUrl;
            if (!submissionData.location) delete (submissionData as any).location;

            await updateProfile.mutateAsync(submissionData as any);
            await queryClient.invalidateQueries({ queryKey: ['profile'] });
            toast({
                title: "Profile Updated",
                description: "Your profile details have been saved successfully.",
            });
            router.push('/profile');
        } catch (error: any) {
            console.error('❌ Update failed:', error.response?.data);
            const errorMessage = error.response?.data?.message;
            const displayError = Array.isArray(errorMessage) 
                ? errorMessage.join(', ') 
                : errorMessage || "Failed to update profile. Please try again.";

            toast({
                title: "Error",
                description: displayError,
                variant: "destructive",
            });
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await uploadPhoto.mutateAsync(file);
            await queryClient.invalidateQueries({ queryKey: ['profile'] });
            toast({
                title: "Photo Uploaded",
                description: "Your profile photo has been updated.",
            });
            // Profile data will be refetched by query client
        } catch (error) {
            toast({
                title: "Upload Failed",
                description: "Failed to upload photo. Please ensure it's an image file.",
                variant: "destructive",
            });
        }
    };

    if (profileLoading) {
        return (
            <MobileShell title="Edit Profile">
                <div className="flex h-[60vh] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            </MobileShell>
        );
    }

    const experienceOptions = [
        { value: 'junior', label: 'Junior' },
        { value: 'mid', label: 'Mid-Level' },
        { value: 'senior', label: 'Senior' }
    ];

    const genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' }
    ];

    const lookingForOptions = [
        { value: 'male', label: 'Men' },
        { value: 'female', label: 'Women' },
        { value: 'both', label: 'Both' }
    ];


    return (
        <MobileShell
            title="Edit Profile"
            rightSlot={
                <Button
                    variant="ghost"
                    className="text-brand font-bold"
                    onClick={handleSave}
                    disabled={updateProfile.isPending}
                >
                    {updateProfile.isPending ? '...' : 'Done'}
                </Button>
            }
        >
            <div className="pb-10 space-y-8">
                {/* Photo Section */}
                <div className="flex flex-col items-center py-4">
                    <div className="relative h-32 w-32">
                        <div className="h-full w-full overflow-hidden rounded-2xl border-2 border-muted bg-muted shadow-sm">
                            {profile?.photoUrl ? (
                                <Image
                                    src={profile.photoUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || ''}${profile.photoUrl}` : profile.photoUrl}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-3xl">👤</div>
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-lg ring-4 ring-background transition-transform active:scale-90"
                        >
                            <Camera className="size-5" />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                        />
                    </div>
                    <p className="mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Change Profile Photo</p>
                </div>

                {/* Basics Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-1">About Me</h3>
                    <Card className="border-none bg-card/50 shadow-sm overflow-hidden">
                        <CardContent className="p-0">
                            <div className="p-4 border-b">
                                <Label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Bio</Label>
                                <Textarea
                                    placeholder="Tell potential matches about yourself, your projects, or your favorite stack..."
                                    className="border-none bg-transparent p-0 focus-visible:ring-0 min-h-[100px] text-sm resize-none"
                                    value={formData.bio}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Details Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-1">Details</h3>
                    <Card className="border-none bg-card/50 shadow-sm overflow-hidden">
                        <CardContent className="p-0 divide-y">
                            {/* Gender */}
                            <div className="p-4 flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <User className="size-5 text-muted-foreground" />
                                    <span className="text-sm font-semibold">Gender</span>
                                </div>
                                <select
                                    className="bg-transparent text-sm font-medium text-brand outline-none text-right appearance-none"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="">Select</option>
                                    {genderOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Location */}
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <MapPin className="size-5 text-muted-foreground" />
                                    <span className="text-sm font-semibold">Location</span>
                                </div>
                                <input
                                    type="text"
                                    className="bg-transparent text-sm font-medium text-brand outline-none text-right placeholder:text-muted-foreground/50"
                                    placeholder="City, Country"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>

                            {/* Experience */}
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Briefcase className="size-5 text-muted-foreground" />
                                    <span className="text-sm font-semibold">Experience</span>
                                </div>
                                <select
                                    className="bg-transparent text-sm font-medium text-brand outline-none text-right appearance-none"
                                    value={formData.experienceLevel}
                                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                                >
                                    <option value="">Select</option>
                                    {experienceOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Age */}
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Cake className="size-5 text-muted-foreground" />
                                    <span className="text-sm font-semibold">Age</span>
                                </div>
                                <input
                                    type="number"
                                    min="18"
                                    max="100"
                                    className="bg-transparent text-sm font-medium text-brand outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-20"
                                    placeholder="18+"
                                    value={formData.age === 0 ? '' : formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            {/* Looking For */}
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Heart className="size-5 text-muted-foreground" />
                                    <span className="text-sm font-semibold">Looking For</span>
                                </div>
                                <select
                                    className="bg-transparent text-sm font-medium text-brand outline-none text-right appearance-none"
                                    value={formData.lookingFor}
                                    onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
                                >
                                    <option value="">Select</option>
                                    {lookingForOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </CardContent>
                    </Card>
                </div>


                {/* Tech Stack */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-1">Core Stack</h3>
                    <Card className="border-none bg-card/50 shadow-sm">
                        <CardContent className="p-4">
                            <Label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Skills (Comma separated)</Label>
                            <Input
                                placeholder="React, Node.js, TypeScript..."
                                className="border-none bg-transparent p-0 focus-visible:ring-0 text-sm h-auto"
                                value={formData.techStack.join(', ')}
                                onChange={(e) => setFormData({ ...formData, techStack: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-1">Connect</h3>
                    <Card className="border-none bg-card/50 shadow-sm overflow-hidden text-sm">
                        <CardContent className="p-0 divide-y">
                            <div className="p-4 flex items-center gap-3">
                                <Github className="size-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    className="bg-transparent flex-1 outline-none placeholder:text-muted-foreground/50"
                                    placeholder="GitHub Username"
                                    value={formData.githubUsername}
                                    onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
                                />
                            </div>
                            <div className="p-4 flex items-center gap-3">
                                <Linkedin className="size-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    className="bg-transparent flex-1 outline-none placeholder:text-muted-foreground/50"
                                    placeholder="LinkedIn Profile URL"
                                    value={formData.linkedinUrl}
                                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                />
                            </div>
                            <div className="p-4 flex items-center gap-3">
                                <Globe className="size-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    className="bg-transparent flex-1 outline-none placeholder:text-muted-foreground/50"
                                    placeholder="Portfolio Website"
                                    value={formData.portfolioUrl}
                                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-card/50 shadow-sm">
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">Available for Projects</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Open for collaborations</span>
                    </div>
                    <button
                        onClick={() => setFormData({ ...formData, isAvailable: !formData.isAvailable })}
                        className={`w-12 h-6 rounded-full transition-colors relative outline-none flex items-center ${formData.isAvailable ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                        <div className={`absolute w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm ${formData.isAvailable ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                </div>

                <Button
                    variant="brand"
                    className="w-full h-14 rounded-2xl text-base font-bold shadow-lg"
                    onClick={handleSave}
                    disabled={updateProfile.isPending}
                >
                    {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </MobileShell>
    );
}
