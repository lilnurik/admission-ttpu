import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";

export const DocumentUpload = () => {
  const { register, formState: { errors }, watch, setValue } = useFormContext();
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});

  // Наблюдаем за изменениями файлов
  const passportFile = watch("passport");
  const photoFile = watch("photo");

  useEffect(() => {
    if (passportFile && passportFile[0]) {
      const file = passportFile[0];
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviews(prev => ({ ...prev, passport: url }));
      } else {
        setPreviews(prev => ({ ...prev, passport: 'pdf' }));
      }
    } else {
      setPreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews.passport;
        return newPreviews;
      });
    }
  }, [passportFile]);

  useEffect(() => {
    if (photoFile && photoFile[0]) {
      const file = photoFile[0];
      const url = URL.createObjectURL(file);
      setPreviews(prev => ({ ...prev, photo: url }));
    } else {
      setPreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews.photo;
        return newPreviews;
      });
    }
  }, [photoFile]);

  // Функция для обработки загрузки файла
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = event.target.files?.[0];
    if (file) {
      // Если это изображение, создаем URL для предпросмотра
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviews(prev => ({ ...prev, [fieldName]: url }));
      } else {
        // Для PDF просто отмечаем, что файл загружен
        setPreviews(prev => ({ ...prev, [fieldName]: 'pdf' }));
      }
    } else {
      // Если файл удален, удаляем предпросмотр
      setPreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[fieldName];
        return newPreviews;
      });
    }
  };

  // Функция для удаления файла
  const handleRemoveFile = (fieldName: string) => {
    setValue(fieldName, null, { shouldValidate: true }); // Сброс значения в react-hook-form
    setPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[fieldName];
      return newPreviews;
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Passport</Label>
        <div className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center 
          ${previews.passport ? 'border-primary' : ''}`}>
          {!previews.passport ? (
            <>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                id="passport"
                {...register("passport", {
                  required: "Passport is required",
                  onChange: (e) => handleFileChange(e, 'passport')
                })}
              />
              <Label
                htmlFor="passport"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-12 w-12 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">
                  Click to upload passport (PDF/JPG/PNG, max 5MB)
                </span>
              </Label>
            </>
          ) : (
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute -top-2 -right-2 rounded-full p-1"
                onClick={() => handleRemoveFile('passport')}
              >
                <X className="h-4 w-4" />
              </Button>
              {previews.passport === 'pdf' ? (
                <div className="flex flex-col items-center">
                  <FileText className="h-12 w-12 text-primary" />
                  <span className="mt-2 text-sm text-primary">PDF Document Uploaded</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <img
                    src={previews.passport}
                    alt="Passport preview"
                    className="max-h-32 object-contain rounded"
                  />
                  <span className="mt-2 text-sm text-primary">Image Uploaded</span>
                </div>
              )}
            </div>
          )}
        </div>
        {errors.passport && (
          <p className="text-red-500 text-sm">{errors.passport.message as string}</p>
        )}
      </div>

      <div className="space-y-4">
        <Label>Applicant's Photo</Label>
        <div className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center
          ${previews.photo ? 'border-primary' : ''}`}>
          {!previews.photo ? (
            <>
              <Input
                type="file"
                accept=".jpg,.jpeg,.png"
                className="hidden"
                id="photo"
                {...register("photo", {
                  required: "Photo is required",
                  onChange: (e) => handleFileChange(e, 'photo')
                })}
              />
              <Label
                htmlFor="photo"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-12 w-12 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">
                  Click to upload photo (JPG/PNG, max 5MB)
                </span>
              </Label>
            </>
          ) : (
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute -top-2 -right-2 rounded-full p-1"
                onClick={() => handleRemoveFile('photo')}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="flex flex-col items-center">
                <img
                  src={previews.photo}
                  alt="Photo preview"
                  className="max-h-32 object-contain rounded"
                />
                <span className="mt-2 text-sm text-primary">Photo Uploaded</span>
              </div>
            </div>
          )}
        </div>
        {errors.photo && (
          <p className="text-red-500 text-sm">{errors.photo.message as string}</p>
        )}
      </div>
    </div>
  );
};