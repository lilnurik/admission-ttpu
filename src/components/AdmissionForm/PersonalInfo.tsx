import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';
import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';
import {API_BASE_URL} from "@/lib/api-client.ts";

const api_base_url = API_BASE_URL;

export const PersonalInfo = () => {
  const { register, formState: { errors }, setValue, watch } = useFormContext();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const registeredBefore = watch("registeredBefore");
  const [phoneNumber, setPhoneNumber] = useState("");

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = parsePhoneNumberFromString(value);
    return phoneNumber ? phoneNumber.formatInternational() : value;
  };

  const validatePhoneNumber = (value: string) => {
    return isValidPhoneNumber(value) || "Please enter a valid phone number";
  };

  const handlePhoneLookup = async () => {
    if (!phoneNumber) return;

    setIsLoading(true);
    try {
      console.log("Looking up data for phone:", phoneNumber);

      const response = await axios.get(`${api_base_url}/api/applications`, {
        params: { page: 1, limit: 10 }
      });
      const applications = response.data.items;

      const application = applications.find(app => app.phone === phoneNumber);

      if (application) {
        const data = {
          firstName: application.first_name,
          surname: application.last_name,
          middleName: application.middle_name,
          gender: application.gender,
          phone: application.phone,
          school: application.school,
          faculty_id: application.faculty_id,
          exam_date_id: application.exam_date_id,
          hasEnglishCert: application.has_english_cert ? 'yes' : 'no',
          englishCertType: application.english_cert_type,
          certScore: application.cert_score,
          programDegree: application.program_degree,
          paymentMethod: application.payment_status,
        };

        // Set form values with retrieved data
        Object.entries(data).forEach(([key, value]) => {
          setValue(key, value);
        });

        toast({
          title: "Data Retrieved",
          description: "Your information has been loaded successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Could not find your information. Please fill in the form manually.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error during phone lookup:', error);
      toast({
        title: "Error",
        description: "Could not find your information. Please fill in the form manually.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/*<div className="space-y-4">*/}
      {/*  <Label>Have you registered before?</Label>*/}
      {/*  <RadioGroup*/}
      {/*    defaultValue="no"*/}
      {/*    className="flex space-x-4"*/}
      {/*    {...register("registeredBefore")}*/}
      {/*  >*/}
      {/*    <div className="flex items-center space-x-2">*/}
      {/*      <RadioGroupItem value="yes" id="yes" />*/}
      {/*      <Label htmlFor="yes">Yes</Label>*/}
      {/*    </div>*/}
      {/*    <div className="flex items-center space-x-2">*/}
      {/*      <RadioGroupItem value="no" id="no" />*/}
      {/*      <Label htmlFor="no">No</Label>*/}
      {/*    </div>*/}
      {/*  </RadioGroup>*/}
      {/*</div>*/}

      {/*{registeredBefore === "yes" && (*/}
      {/*  <div className="space-y-4">*/}
      {/*    <Label htmlFor="lookupPhone">Enter your registered phone number</Label>*/}
      {/*    <div className="flex space-x-2">*/}
      {/*      <Input*/}
      {/*        id="lookupPhone"*/}
      {/*        type="tel"*/}
      {/*        value={phoneNumber}*/}
      {/*        onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}*/}
      {/*        placeholder="+1234567890"*/}
      {/*      />*/}
      {/*      <button*/}
      {/*        onClick={handlePhoneLookup}*/}
      {/*        disabled={isLoading}*/}
      {/*        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"*/}
      {/*      >*/}
      {/*        {isLoading ? "Loading..." : "Look up"}*/}
      {/*      </button>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*)}*/}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            {...register("firstName", { required: "First name is required" })}
            className={errors.firstName ? "border-red-500" : ""}
            disabled={registeredBefore === "yes"}
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm">{errors.firstName.message as string}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="surname">Surname</Label>
          <Input
            id="surname"
            {...register("surname", { required: "Surname is required" })}
            className={errors.surname ? "border-red-500" : ""}
            disabled={registeredBefore === "yes"}
          />
          {errors.surname && (
            <p className="text-red-500 text-sm">{errors.surname.message as string}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <Select
          disabled={registeredBefore === "yes"}
          onValueChange={(value) => setValue("gender", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Mobile Phone</Label>
        <Input
          id="phone"
          type="tel"
          {...register("phone", {
            required: "Phone number is required",
            validate: validatePhoneNumber
          })}
          onChange={(e) => setValue("phone", formatPhoneNumber(e.target.value))}
          className={errors.phone ? "border-red-500" : ""}
          disabled={registeredBefore === "yes"}
        />
        {errors.phone && (
          <p className="text-red-500 text-sm">{errors.phone.message as string}</p>
        )}
      </div>
    </div>
  );
};