import { useFormContext } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios'; // Импортируем axios напрямую

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  currency: string;
  commission: string;
}

export const PaymentMethod = () => {
  const { register, setValue } = useFormContext();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const { toast } = useToast();

  const currentDateTime = "2025-01-19 11:46:55";
  const currentUser = "lilnurik";

  // Fetch available payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await axios.get('https://regback.turin.uz/api/payments/methods');
        const methods = response.data.methods.filter((method: PaymentMethod) => method.name.toLowerCase() === 'click');
        setPaymentMethods(methods);
        if (methods.length > 0) {
          setSelectedMethod(methods[0].id);
          setValue('paymentMethod', methods[0].id);
        }
        console.log(`Payment methods fetched by ${currentUser} at ${currentDateTime}`);
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        toast({
          title: "Error",
          description: "Could not load payment methods. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchPaymentMethods();
  }, [setValue, toast]);

  const handleMethodChange = (value: string) => {
    setSelectedMethod(value);
    setValue('paymentMethod', value);
    console.log(`Payment method selected: ${value} by ${currentUser} at ${currentDateTime}`);
  };

  return (
    <div className="space-y-6">
      <RadioGroup
        value={selectedMethod}
        onValueChange={handleMethodChange}
        className="space-y-4"
      >
        {paymentMethods.map((method) => (
          <div key={method.id} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value={method.id} id={method.id} />
            <Label htmlFor={method.id} className="flex items-center flex-1 cursor-pointer">
              <div className="flex flex-col">
                <span className="font-medium">{method.name}</span>
                <span className="text-sm text-gray-500">{method.description}</span>
                <span className="text-xs text-gray-400">
                  Commission: 1%
                </span>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>

      {/* Скрытое поле для формы */}
      <input
        type="hidden"
        {...register('paymentMethod', { required: true })}
        value={selectedMethod}
      />

      <div className="text-sm text-gray-500 mt-4">
        Selected payment method will be processed after form submission
      </div>
    </div>
  );
};

export default PaymentMethod;