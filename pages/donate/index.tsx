import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Heart, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import Layout from "../../components/Layout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { CardNumberInput, CardExpiryInput, CardCVCInput } from "../../components/ui/card-input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";

// Define the form validation schema with Zod
const formSchema = z.object({
  donationAmount: z.string().min(1, "Please select or enter a donation amount"),
  customAmount: z.string().optional(),
  cardName: z.string().min(2, "Please enter the cardholder name"),
  cardNumber: z
    .string()
    .min(16, "Card number must be at least 16 digits")
    .max(16, "Card number must be at most 16 digits")
    .regex(/^\d+$/, "Card number must contain only digits"),
  cardExpiry: z
    .string()
    .min(4, "Expiry date must be 4 digits (MMYY)")
    .max(4, "Expiry date must be 4 digits (MMYY)")
    .regex(/^\d+$/, "Expiry date must contain only digits")
    .refine((value) => {
      // Extract month and year
      const month = parseInt(value.substring(0, 2), 10);
      const year = parseInt(value.substring(2, 4), 10);

      // Check if month is valid (1-12)
      if (month < 1 || month > 12) {
        return false;
      }

      // Get current date
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits of year
      const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11

      // Check if the expiry date is in the past
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return false;
      }

      return true;
    }, "Card has expired or date is invalid"),
  cardCVC: z
    .string()
    .min(3, "CVC must be at least 3 digits")
    .max(4, "CVC must be at most 4 digits")
    .regex(/^\d+$/, "CVC must contain only digits"),
  billingAddress: z.string().min(5, "Please enter a valid address"),
  billingCity: z.string().min(2, "Please enter a city"),
  billingCountry: z.string().min(2, "Please select a country"),
  billingZip: z.string().min(3, "Please enter a valid postal/zip code"),
});

type FormValues = z.infer<typeof formSchema>;

// Predefined donation amounts
const donationAmounts = ["10", "25", "50", "100", "250", "custom"];

export default function DonatePage() {
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      donationAmount: "25", // Default to $25
      customAmount: "",
      cardName: "",
      cardNumber: "",
      cardExpiry: "",
      cardCVC: "",
      billingAddress: "",
      billingCity: "",
      billingCountry: "",
      billingZip: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setPaymentStatus("processing");
    setPaymentError(null);
    
    try {
      // Simulate API call with a delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Simulate validation errors for demonstration
      if (data.cardNumber === "4111111111111111") {
        setPaymentStatus("success");
      } else {
        // Random error messages for demo purposes
        const errors = [
          "Card was declined. Please try a different payment method.",
          "Invalid card number. Please check and try again.",
          "Card has expired. Please use a different card.",
          "Payment gateway is temporarily unavailable. Please try again later.",
        ];
        const randomError = errors[Math.floor(Math.random() * errors.length)];
        throw new Error(randomError);
      }
    } catch (error) {
      setPaymentStatus("error");
      setPaymentError(error instanceof Error ? error.message : "An unknown error occurred");
    }
  };

  const watchDonationAmount = form.watch("donationAmount");
  const isCustomAmount = watchDonationAmount === "custom";

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Support Our Mission</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your donation helps us combat deepfakes and AI-generated misinformation by funding our research and keeping our tools free and accessible.
          </p>
        </motion.div>

        {paymentStatus === "success" ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold">Thank You for Your Donation!</h2>
                <p className="text-muted-foreground">
                  Your contribution is making a difference in the fight against misinformation. 
                  A receipt has been sent to your email address.
                </p>
                <Button onClick={() => setPaymentStatus("idle")} className="mt-4">
                  Make Another Donation
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Credit Card Donation</span>
                </CardTitle>
                <CardDescription>
                  Your donation is secure and encrypted. We never store your full card details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      {/* Donation Amount Section */}
                      <div>
                        <h3 className="text-lg font-medium mb-3">Donation Amount</h3>
                        <FormField
                          control={form.control}
                          name="donationAmount"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="grid grid-cols-3 gap-3"
                                >
                                  {donationAmounts.map((amount) => (
                                    <FormItem key={amount}>
                                      <FormControl>
                                        <RadioGroupItem
                                          value={amount}
                                          id={`amount-${amount}`}
                                          className="peer sr-only"
                                        />
                                      </FormControl>
                                      <Label
                                        htmlFor={`amount-${amount}`}
                                        className="flex items-center justify-center h-12 rounded-md border-2 border-muted bg-transparent p-2 text-center font-medium peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer"
                                      >
                                        {amount === "custom" ? (
                                          "Custom"
                                        ) : (
                                          `$${amount}`
                                        )}
                                      </Label>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {isCustomAmount && (
                          <FormField
                            control={form.control}
                            name="customAmount"
                            render={({ field }) => (
                              <FormItem className="mt-3">
                                <FormLabel>Custom Amount</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                                    <Input 
                                      placeholder="Enter amount" 
                                      className="pl-8" 
                                      type="number"
                                      min="1"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      {/* Card Details Section */}
                      <div>
                        <h3 className="text-lg font-medium mb-3">Card Details</h3>
                        <div className="grid gap-4">
                          <FormField
                            control={form.control}
                            name="cardName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cardholder Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Full Name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="cardNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Card Number</FormLabel>
                                <FormControl>
                                  <CardNumberInput
                                    onValueChange={field.onChange}
                                    aria-invalid={!!form.formState.errors.cardNumber}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Use 4111 1111 1111 1111 for a successful test payment
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="cardExpiry"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Expiry Date</FormLabel>
                                  <FormControl>
                                    <CardExpiryInput
                                      onValueChange={field.onChange}
                                      aria-invalid={!!form.formState.errors.cardExpiry}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="cardCVC"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CVC</FormLabel>
                                  <FormControl>
                                    <CardCVCInput
                                      onValueChange={field.onChange}
                                      aria-invalid={!!form.formState.errors.cardCVC}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Billing Information Section */}
                      <div>
                        <h3 className="text-lg font-medium mb-3">Billing Information</h3>
                        <div className="grid gap-4">
                          <FormField
                            control={form.control}
                            name="billingAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Billing Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="123 Main St, Apt 4B" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="billingCity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input placeholder="New York" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="billingZip"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Postal/Zip Code</FormLabel>
                                  <FormControl>
                                    <Input placeholder="10001" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="billingCountry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input placeholder="United States" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {paymentStatus === "error" && paymentError && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Payment Error</AlertTitle>
                        <AlertDescription>{paymentError}</AlertDescription>
                      </Alert>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={paymentStatus === "processing"}
                    >
                      {paymentStatus === "processing" ? "Processing..." : "Donate Now"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-4">
                <p className="text-xs text-muted-foreground text-center">
                  Your payment is secure and encrypted. We never store your complete credit card information.
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {/* Donation Impact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <h2 className="text-2xl font-bold mb-6">Your Donation Powers Our Mission</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-primary/10 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h16a2 2 0 0 1 1.2.4"></path><path d="M2 10h20"></path><path d="M7 15h.01"></path><path d="M11 15h2"></path><path d="M16 15h.01"></path><path d="M7 18h.01"></path><path d="M11 18h2"></path><path d="M16 18h.01"></path><path d="M10 2v4"></path><path d="M14 2v4"></path><path d="M7 6h10"></path></svg>
                  </div>
                  <h3 className="font-medium mb-2">Research</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Fund cutting-edge research into deepfake detection and AI content analysis.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-primary/10 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
                  </div>
                  <h3 className="font-medium mb-2">Awareness</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Help us educate the public about the dangers of deepfakes and digital misinformation.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-primary/10 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"></circle><line x1="2" x2="22" y1="12" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  </div>
                  <h3 className="font-medium mb-2">Accessibility</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Keep our detection tools free and accessible to journalists, researchers, and the public.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
} 