import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Image as ImageIcon, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/inventory/dashboard',
    },
    {
        title: 'Campaigns',
        href: '/inventory/campaigns',
    },
    {
        title: 'Create Campaign',
        href: '/inventory/campaigns/create',
    },
];

interface FormData {
    message: string;
    target_amount: string;
    images: File[];
}

export default function CreateCampaignPage() {
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm<FormData>({
        message: '',
        target_amount: '',
        images: [],
    });

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);

        if (selectedImages.length + files.length > 10) {
            toast.error('You can only upload up to 10 images per campaign');
            return;
        }

        const validFiles = files.filter((file) => {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not a valid image file`);
                return false;
            }
            if (file.size > 2 * 1024 * 1024) {
                // 2MB limit
                toast.error(`${file.name} is too large. Maximum size is 2MB`);
                return false;
            }
            return true;
        });

        const newImages = [...selectedImages, ...validFiles];
        setSelectedImages(newImages);
        setData('images', newImages);

        // Create previews
        const newPreviews = [...imagePreviews];
        validFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                newPreviews.push(e.target?.result as string);
                setImagePreviews([...newPreviews]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        const newImages = selectedImages.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);

        setSelectedImages(newImages);
        setImagePreviews(newPreviews);
        setData('images', newImages);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedImages.length === 0) {
            toast.error('Please select at least one image for the campaign');
            return;
        }

        post('/inventory/campaigns', {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Campaign created successfully!');
            },
            onError: (e) => {
                toast.error('Failed to create campaign. Please try again.');
                console.log(e);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Campaign" />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/inventory/campaigns">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Campaigns
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
                        <p className="text-gray-600">Create a compelling donation campaign with images and message</p>
                    </div>
                </div>

                <div className="max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Campaign Message */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Campaign Message</CardTitle>
                                <CardDescription>Write a compelling message that will inspire people to donate</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Message *</Label>
                                    <Textarea
                                        id="message"
                                        placeholder="Tell your story... What is the campaign about? Why should people donate? How will their contributions make a difference?"
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        rows={6}
                                        className={errors.message ? 'border-red-500' : ''}
                                    />
                                    {errors.message && <p className="text-sm text-red-600">{errors.message}</p>}
                                    <p className="text-sm text-gray-500">{data.message.length} characters (minimum 10 required)</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Target Amount */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Donation Goal</CardTitle>
                                <CardDescription>Set a target amount for your campaign (optional)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="target_amount">Target Amount (MWK)</Label>
                                    <Input
                                        id="target_amount"
                                        type="number"
                                        placeholder="e.g., 100000"
                                        value={data.target_amount}
                                        onChange={(e) => setData('target_amount', e.target.value)}
                                        className={errors.target_amount ? 'border-red-500' : ''}
                                        min="0"
                                        step="100"
                                    />
                                    {errors.target_amount && <p className="text-sm text-red-600">{errors.target_amount}</p>}
                                    <p className="text-sm text-gray-500">
                                        Leave empty for campaigns without a specific goal. When the goal is reached, the campaign will only appear in
                                        staff dashboards.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Image Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Campaign Images</CardTitle>
                                <CardDescription>Upload 1-10 images to make your campaign more engaging (max 2MB each)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Upload Button */}
                                    <div className="flex items-center gap-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={selectedImages.length >= 10}
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            {selectedImages.length === 0 ? 'Select Images' : 'Add More Images'}
                                        </Button>
                                        <span className="text-sm text-gray-500">{selectedImages.length}/10 images selected</span>
                                    </div>

                                    <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />

                                    {errors.images && <p className="text-sm text-red-600">{errors.images}</p>}

                                    {/* Image Previews */}
                                    {imagePreviews.length > 0 && (
                                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="group relative">
                                                    <img src={preview} alt={`Preview ${index + 1}`} className="h-32 w-full rounded-lg object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                    <div className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
                                                        {selectedImages[index]?.name}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {selectedImages.length === 0 && (
                                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-2 text-sm text-gray-600">No images selected yet</p>
                                            <p className="text-xs text-gray-500">Click "Select Images" to add photos to your campaign</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <Button type="submit" disabled={processing || data.message.length < 10 || selectedImages.length === 0} className="flex-1">
                                {processing ? 'Creating Campaign...' : 'Create Campaign'}
                            </Button>
                            <Link href="/inventory/campaigns">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
