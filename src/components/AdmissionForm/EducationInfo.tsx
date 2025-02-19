import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, X, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const currentDateTime = "2025-01-21 13:02:01";
const currentUser = "lilnurik";

const englishCertificateTypes = [
  { value: 'IELTS', label: 'IELTS' },
  { value: 'TOEFL', label: 'TOEFL' },
  { value: 'CAMBRIDGE', label: 'CAMBRIDGE' }
] as const;

export const EducationInfo = () => {
  const { register, formState: { errors }, watch, setValue } = useFormContext();
  const hasEnglishCert = watch("hasEnglishCert");
  const [selectedCertType, setSelectedCertType] = useState<string>("");
  const [certFilePreview, setCertFilePreview] = useState<string | null>(null);

  useEffect(() => {
    const certFile = watch("englishCert");
    if (certFile && certFile[0]) {
      const file = certFile[0];
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setCertFilePreview(url);
      } else if (file.type === 'application/pdf') {
        setCertFilePreview('pdf');
      }
    } else {
      setCertFilePreview(null);
    }
  }, [watch("englishCert")]);

  const handleCertTypeChange = (value: string) => {
    setSelectedCertType(value);
    setValue("englishCertType", value);
    console.log(`Certificate type selected: ${value} by ${currentUser} at ${currentDateTime}`);
  };

  const handleProgramDegreeChange = (value: string) => {
    setValue("programDegree", value);
    console.log(`Program degree selected: ${value} by ${currentUser} at ${currentDateTime}`);
  };

  const handleEnglishCertChange = (value: 'yes' | 'no') => {
    setValue("hasEnglishCert", value);
    if (value === 'no') {
      setValue("englishCertType", '');
      setValue("certScore", '');
      setValue("englishCert", null);
      setSelectedCertType("");
      setCertFilePreview(null);
    }
    console.log(`English certificate option changed: ${value} by ${currentUser} at ${currentDateTime}`);
  };

  const handleCertFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setCertFilePreview(url);
      } else if (file.type === 'application/pdf') {
        setCertFilePreview('pdf');
      }
      register("englishCert").onChange(event);
      console.log(`Certificate file selected by ${currentUser} at ${currentDateTime}`);
    }
  };

  const handleRemoveCertFile = () => {
    setCertFilePreview(null);
    setValue("englishCert", null, { shouldValidate: true }); // Сброс значения в react-hook-form

    // Обновление значения input для удаления файла
    const input = document.getElementById('englishCert') as HTMLInputElement;
    if (input) {
      input.value = '';
      console.log(`Certificate file removed by ${currentUser} at ${currentDateTime}`);
    } else {
      console.log('Input element not found');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="school">School/Lyceum/College</Label>
        <Input
          id="school"
          {...register("school", { required: "School information is required" })}
          className={errors.school ? "border-red-500" : ""}
          placeholder="Enter your school name"
        />
        {errors.school && (
          <p className="text-red-500 text-sm">{errors.school.message as string}</p>
        )}
      </div>

      {/*<div className="space-y-2">*/}
      {/*  <Label htmlFor="programDegree">Program Degree</Label>*/}
      {/*  <Select onValueChange={handleProgramDegreeChange}>*/}
      {/*    <SelectTrigger className="w-full">*/}
      {/*      <SelectValue placeholder="Select program" />*/}
      {/*    </SelectTrigger>*/}
      {/*    <SelectContent>*/}
      {/*      <SelectItem value="bachelor">Bachelor's Degree</SelectItem>*/}
      {/*      <SelectItem value="master">Master's Degree</SelectItem>*/}
      {/*      <SelectItem value="phd">PhD</SelectItem>*/}
      {/*    </SelectContent>*/}
      {/*  </Select>*/}
      {/*</div>*/}

      <div className="space-y-4">
        <Label>Do you have an English Language Certificate?</Label>
        <RadioGroup
          defaultValue="no"
          onValueChange={handleEnglishCertChange}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="certYes" />
            <Label htmlFor="certYes">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="certNo" />
            <Label htmlFor="certNo">No</Label>
          </div>
        </RadioGroup>
      </div>

      {hasEnglishCert === "yes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="englishCertType">English Language Certificate Type</Label>
            <Select
              onValueChange={handleCertTypeChange}
              value={selectedCertType}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select certificate type" />
              </SelectTrigger>
              <SelectContent>
                {englishCertificateTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certScore">English Certificate Score</Label>
            <Input
              id="certScore"
              type="number"
              step="0.5"
              min="0"
              max="9"
              placeholder="Enter your score"
              {...register("certScore", {
                validate: (value) => {
                  if (hasEnglishCert === "yes" && !value) {
                    return "Score is required for English certificate";
                  }
                  return true;
                }
              })}
              className={errors.certScore ? "border-red-500" : ""}
            />
            {errors.certScore && (
              <p className="text-red-500 text-sm">{errors.certScore.message as string}</p>
            )}
          </div>

          <div className="space-y-4 md:col-span-2">
            <Label>Upload English Language Certificate</Label>
            <div className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center
              ${certFilePreview ? 'border-primary' : ''}`}>
              {!certFilePreview ? (
                <>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    id="englishCert"
                    {...register("englishCert", {
                      validate: (value) => {
                        if (hasEnglishCert === "yes" && !value?.[0]) {
                          return "Certificate file is required";
                        }
                        return true;
                      }
                    })}
                    onChange={handleCertFileChange}
                  />
                  <Label
                    htmlFor="englishCert"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">
                      Click to upload certificate (PDF/JPG/PNG, max 5MB)
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
                    onClick={handleRemoveCertFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {certFilePreview === 'pdf' ? (
                    <div className="flex flex-col items-center">
                      <FileText className="h-12 w-12 text-primary" />
                      <span className="mt-2 text-sm text-primary">PDF Certificate Uploaded</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <img
                        src={certFilePreview}
                        alt="Certificate preview"
                        className="max-h-32 object-contain rounded"
                      />
                      <span className="mt-2 text-sm text-primary">Certificate Image Uploaded</span>
                    </div>
                  )}
                </div>
              )}
              {errors.englishCert && (
                <p className="text-red-500 text-sm mt-2">{errors.englishCert.message as string}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="satScore">SAT Score (if available)</Label>
        <Input
          id="satScore"
          type="number"
          min="400"
          max="1600"
          placeholder="Enter your SAT score"
          {...register("satScore")}
        />
      </div>

      <div className="text-sm text-gray-500 mt-4">
        Last updated: {currentDateTime} by {currentUser}
      </div>
    </div>
  );
};

export default EducationInfo;