import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PersonalInfo } from './PersonalInfo';
import { EducationInfo } from './EducationInfo';
import { DocumentUpload } from './DocumentUpload';
import { PaymentMethod } from './PaymentMethod';
import { FacultyInfo } from './FacultyInfo';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';
import {API_BASE_URL} from "@/lib/api-client.ts";

const api_base_url = API_BASE_URL; ;

interface FormData {
  firstName: string;
  surname: string;
  middleName?: string;
  gender: string;
  phone: string;
  school: string;
  faculty_id: number;
  exam_date_id: number;
  hasEnglishCert: 'yes' | 'no';
  programDegree: string;
  englishCertType?: string;
  certScore?: string;
  englishCert?: FileList;
  passport?: FileList;
  photo?: FileList;
  paymentMethod: 'click' | 'payme';
  terms_accepted: boolean;
}

export const AdmissionForm = () => {
  const methods = useForm<FormData>();
  const [showAgreement, setShowAgreement] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Current timestamp and user info
  const currentDateTime = "2025-01-21 13:22:56";
  const currentUser = "lilnurik";

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      console.log(`Form submission started by ${currentUser} at ${currentDateTime}`);

      // Validate English certificate data
      if (data.hasEnglishCert === 'yes') {
        if (!['IELTS', 'TOEFL', 'CAMBRIDGE'].includes(data.englishCertType)) {
          toast({
            title: "Validation Error",
            description: "Please select a valid English certificate type",
            variant: "destructive",
          });
          return;
        }

        if (!data.certScore) {
          toast({
            title: "Validation Error",
            description: "Please enter your certificate score",
            variant: "destructive",
          });
          return;
        }
      }

      const formData = new FormData();
      formData.append('first_name', data.firstName);
      formData.append('last_name', data.surname);
      formData.append('middle_name', data.middleName || '');
      formData.append('gender', data.gender);
      formData.append('phone', data.phone);
      formData.append('school', data.school);
      formData.append('faculty_id', String(data.faculty_id));
      formData.append('exam_date_id', String(data.exam_date_id));
      formData.append('has_english_cert', data.hasEnglishCert === 'yes' ? 'true' : 'false');
      formData.append('program_degree', data.programDegree.toLowerCase());
      formData.append('terms_accepted', 'true');
      formData.append('payment_method', data.paymentMethod);

      if (data.hasEnglishCert === 'yes') {
        formData.append('english_cert_type', data.englishCertType.toUpperCase());
        formData.append('cert_score', data.certScore || '');
        if (data.englishCert?.[0]) {
          formData.append('english_cert', data.englishCert[0]);
        }
      }

      if (data.passport?.[0]) {
        formData.append('passport', data.passport[0]);
      }
      if (data.photo?.[0]) {
        formData.append('photo', data.photo[0]);
      }

      console.log(`Submitting application by ${currentUser} at ${currentDateTime}`);
      const applicationResponse = await axios.post(
        `${api_base_url}/api/applications`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      if (applicationResponse.data.id) {
        const paymentData = {
          application_id: applicationResponse.data.id,
          payment_type: data.paymentMethod,
          amount: 100000,
          return_url: `${window.location.origin}/payment/callback`
        };

        console.log(`Initializing payment for application ${applicationResponse.data.id}`);
        const paymentResponse = await axios.post(
          `${api_base_url}/api/payments/initialize`,
          paymentData
        );

        if (paymentResponse.data.payment_url) {
          console.log(`Redirecting to payment: ${paymentResponse.data.payment_url}`);
          window.location.href = paymentResponse.data.payment_url;
        }
      }

    } catch (error: any) {
      console.error('Form submission error:', error);
      const errorMessage = error.response?.data?.detail ||
                          error.response?.data?.msg ||
                          'An error occurred while submitting your application';

      toast({
        title: "Error",
        description: typeof errorMessage === 'string' ? errorMessage : 'Validation error occurred',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="max-w-3xl mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold text-primary mb-8 text-center">University Admission Form</h1>

        <div className="space-y-8">
          <section className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
            <PersonalInfo />
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-6">Faculty Selection</h2>
            <FacultyInfo />
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-6">Education Information</h2>
            <EducationInfo />
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-6">Document Upload</h2>
            <DocumentUpload />
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
            <PaymentMethod />
          </section>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="agreement"
            {...methods.register('terms_accepted', {
              required: "You must accept the terms and conditions"
            })}
          />
          <div className="space-x-1">
            <Label htmlFor="agreement">I agree to the</Label>
            <button
              type="button"
              onClick={() => setShowAgreement(true)}
              className="text-primary hover:underline"
            >
              data processing agreement
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[150px]"
          >
            {isSubmitting ? 'Processing...' : 'Submit Application'}
          </Button>
        </div>

        <Dialog open={showAgreement} onOpenChange={setShowAgreement}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Data Processing Agreement</DialogTitle>
            </DialogHeader>
            <div className="prose prose-sm max-h-[60vh] overflow-y-auto">
              <h3>1. Introduction</h3>
              <p>This Data Processing Agreement ("Agreement") sets forth the terms and conditions on which we process your personal data...</p>
              <h3>2. Data Collection</h3>
              <p>We collect and process the following types of personal data:</p>
              <ul>
                <li>Personal identification information (name, surname, gender)</li>
                <li>Contact information (phone number, email address)</li>
                <li>Educational information (previous education, certificates)</li>
                <li>Documents (passport copy, photos, certificates)</li>
              </ul>
              <h3>3. Purpose of Processing</h3>
              <p>Your personal data is processed for the following purposes:</p>
              <ul>
                <li>Processing your university admission application</li>
                <li>Communicating the status of your application</li>
                <li>Verifying educational documents</li>
                <li>Administrative purposes related to university admission</li>
              </ul>
            </div>
          </DialogContent>
        </Dialog>
      </form>
    </FormProvider>
  );
};

export default AdmissionForm;