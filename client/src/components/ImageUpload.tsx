import { useState, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onImagesChange: (imageUrls: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
  className?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  url?: string;
  error?: string;
}

export default function ImageUpload({
  onImagesChange,
  maxImages = 5,
  maxSizeMB = 10,
  className,
}: ImageUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await apiRequest("POST", "/api/upload", formData);
      return response.json();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'File must be an image';
    }
    
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    
    return null;
  };

  const uploadFile = async (file: File, index: number) => {
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadingFiles(prev => 
          prev.map((item, i) => 
            i === index && item.progress < 90 
              ? { ...item, progress: item.progress + 10 }
              : item
          )
        );
      }, 200);

      const result = await uploadMutation.mutateAsync(file);
      
      clearInterval(progressInterval);
      
      // Complete the progress
      setUploadingFiles(prev => 
        prev.map((item, i) => 
          i === index 
            ? { ...item, progress: 100, url: result.url }
            : item
        )
      );

      // Add to uploaded images after a short delay
      setTimeout(() => {
        setUploadedImages(prev => {
          const newImages = [...prev, result.url];
          onImagesChange(newImages);
          return newImages;
        });

        // Remove from uploading files
        setUploadingFiles(prev => prev.filter((_, i) => i !== index));
      }, 500);

    } catch (error) {
      setUploadingFiles(prev => 
        prev.map((item, i) => 
          i === index 
            ? { ...item, error: 'Upload failed' }
            : item
        )
      );
    }
  };

  const handleFiles = useCallback((files: FileList) => {
    const fileArray = Array.from(files);
    const totalImages = uploadedImages.length + uploadingFiles.length + fileArray.length;
    
    if (totalImages > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${maxImages} images.`,
        variant: "destructive",
      });
      return;
    }

    const validFiles: File[] = [];
    
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "Invalid file",
          description: `${file.name}: ${error}`,
          variant: "destructive",
        });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Add files to uploading state
    const newUploadingFiles = validFiles.map(file => ({
      file,
      progress: 0,
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Start uploading each file
    validFiles.forEach((file, index) => {
      uploadFile(file, uploadingFiles.length + index);
    });
  }, [uploadedImages.length, uploadingFiles.length, maxImages, maxSizeMB]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeImage = (index: number) => {
    setUploadedImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      onImagesChange(newImages);
      return newImages;
    });
  };

  const removeUploadingFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const canUploadMore = uploadedImages.length + uploadingFiles.length < maxImages;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {canUploadMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-blue-50"
              : "border-gray-300 hover:border-primary hover:bg-gray-50"
          )}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            Drag and drop your photos here, or{" "}
            <span className="text-primary font-semibold">click to browse</span>
          </p>
          <p className="text-sm text-gray-500">
            Maximum {maxImages} photos, {maxSizeMB}MB each
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Uploading...</h4>
          {uploadingFiles.map((item, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <ImageIcon className="w-8 h-8 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.file.name}</p>
                {item.error ? (
                  <div className="flex items-center space-x-1 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">{item.error}</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Progress value={item.progress} className="h-2" />
                    <p className="text-xs text-gray-500">{item.progress}%</p>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeUploadingFile(index)}
                className="text-gray-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Summary */}
      <div className="text-xs text-gray-500">
        {uploadedImages.length} of {maxImages} images uploaded
      </div>
    </div>
  );
}
