import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Heart, CreditCard, CheckCircle, AlertCircle, ArrowLeft, Clock, ChevronRight, ChevronLeft } from "lucide-react";
import Layout from "../../components/Layout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { CardNumberInput, CardExpiryInput, CardCVCInput } from "../../components/ui/card-input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import axios from "axios";
import Cookies from "js-cookie";

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

// Define donation details type
interface DonationDetails {
  id: number;
  amount: string;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  donor_name: string;
  donor_email: string;
  is_anonymous: boolean;
  message: string;
  donor_username: string;
  donation_type: string;
  project_allocation: string;
  is_gift: boolean;
  gift_recipient_name: string | null;
  gift_recipient_email: string | null;
  gift_message: string | null;
  donor_address: string;
  donor_phone: string;
  donor_country: string;
  payment_method_type: string;
  card_number_last4: string;
  card_expiry_month: string;
  card_expiry_year: string;
  card_type: string;
  billing_city: string;
  billing_postal_code: string;
}

// Define donation list type
interface DonationListItem {
  id: number;
  amount: string;
  currency: string;
  status: string;
  created_at: string;
  card_number_last4: string;
  card_type: string;
}

interface DonationListResponse {
  success: boolean;
  count: number;
  data: DonationListItem[];
  page: number;
  page_size: number;
  total_pages: number;
}

export default function DonatePage() {
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [donationDetails, setDonationDetails] = useState<DonationDetails | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  
  // Donation history states
  const [donationHistory, setDonationHistory] = useState<DonationListItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [showHistory, setShowHistory] = useState<boolean>(false);

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

  // Fetch donation history
  const fetchDonationHistory = async (page = 1) => {
    setIsLoadingHistory(true);
    setHistoryError(null);
    
    try {
      // Get the access token from cookies
      let accessToken = Cookies.get("accessToken");
      let response;

      try {
        // Try to make the API request with the current access token
        if (!accessToken) {
          setHistoryError("Please login to view your donation history.");
          return;
        }
        
        // Make API request to get donation history
        response = await axios.get(`http://127.0.0.1:8000/api/donations/?page=${page}&page_size=5`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
          // Access token is expired, refresh the token
          const refreshToken = Cookies.get("refreshToken");

          if (refreshToken) {
            // Get a new access token using the refresh token
            const refreshResponse = await axios.post("http://127.0.0.1:8000/api/auth/refresh_token/", {
              refresh: refreshToken,
            });

            accessToken = refreshResponse.data.access;
            // Store the new access token in cookies
            if (accessToken) {
              Cookies.set("accessToken", accessToken);
            }
            if (!accessToken) {
              setHistoryError("Please login to view your donation history.");
              return;
            }
            
            // Retry the API request with the new access token
            response = await axios.get(`http://127.0.0.1:8000/api/donations/?page=${page}&page_size=5`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });
          } else {
            setHistoryError("Please login to view your donation history.");
            return;
          }
        } else {
          throw error;
        }
      }
      
      const result = response.data as DonationListResponse;
      
      if (result.success) {
        setDonationHistory(result.data);
        setCurrentPage(result.page);
        setTotalPages(result.total_pages);
      } else {
        throw new Error("Failed to fetch donation history");
      }
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : "An error occurred while fetching donation history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Load donation history when component mounts or after a successful donation
  useEffect(() => {
    if (showHistory) {
      fetchDonationHistory(currentPage);
    }
  }, [showHistory, currentPage]);

  // Toggle donation history visibility
  const toggleDonationHistory = () => {
    const newShowHistory = !showHistory;
    setShowHistory(newShowHistory);
    
    // Fetch history if toggling to show and we don't have any yet
    if (newShowHistory && donationHistory.length === 0) {
      fetchDonationHistory(1);
    }
  };

  // Handle page navigation
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Function to verify donation with session ID
  const verifyDonation = async (sessionId: string) => {
    setIsVerifying(true);
    try {
      // Get the access token from cookies
      let accessToken = Cookies.get("accessToken");
      let response;

      try {
        // Try to make the API request with the current access token
        if (!accessToken) {
          setPaymentStatus("error");
          setPaymentError("Please login first to verify your donation.");
          return;
        }
        
        // Make API request to verify donation with token
        response = await axios.get(`http://127.0.0.1:8000/api/donations/verify/${sessionId}/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
          // Access token is expired, refresh the token
          const refreshToken = Cookies.get("refreshToken");

          if (refreshToken) {
            // Get a new access token using the refresh token
            const refreshResponse = await axios.post("http://127.0.0.1:8000/api/auth/refresh_token/", {
              refresh: refreshToken,
            });

            accessToken = refreshResponse.data.access;
            // Store the new access token in cookies
            if (accessToken) {
              Cookies.set("accessToken", accessToken);
            }
            if (!accessToken) {
              setPaymentStatus("error");
              setPaymentError("Please login first to verify your donation.");
              return;
            }
            
            // Retry the API request with the new access token
            response = await axios.get(`http://127.0.0.1:8000/api/donations/verify/${sessionId}/`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });
          } else {
            setPaymentStatus("error");
            setPaymentError("Please login first to verify your donation.");
            return;
          }
        } else {
          throw error;
        }
      }
      
      const result = response.data;
      
      if (result.success && result.verified) {
        setDonationDetails(result.donation);
      } else {
        throw new Error(result.error || "Failed to verify donation");
      }
    } catch (error) {
      setPaymentStatus("error");
      setPaymentError(error instanceof Error ? error.message : "An unknown error occurred while verifying your donation");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setPaymentStatus("processing");
    setPaymentError(null);
    
    try {
      // Determine the final amount (either predefined or custom)
      const amount = data.donationAmount === "custom" && data.customAmount 
        ? parseFloat(data.customAmount) 
        : parseFloat(data.donationAmount);
      
      // Extract month and year from expiry date
      const expiryMonth = data.cardExpiry.substring(0, 2);
      const expiryYear = `20${data.cardExpiry.substring(2, 4)}`;
      
      // Format the request payload according to the API documentation
      const payload = {
        amount: amount,
        currency: "USD",
        donor_name: data.cardName,
        donor_address: data.billingAddress,
        donor_country: data.billingCountry,
        payment_method_type: "credit_card",
        card_number: data.cardNumber,
        card_expiry_month: expiryMonth,
        card_expiry_year: expiryYear,
        card_cvc: data.cardCVC,
        billing_city: data.billingCity,
        billing_postal_code: data.billingZip
      };
      
      // Get the access token from cookies
      let accessToken = Cookies.get("accessToken");
      let response;

      try {
        // Try to make the API request with the current access token
        if (!accessToken) {
          setPaymentStatus("error");
          setPaymentError("Please login first to make a donation.");
          return;
        }
        
        // Make API request to create donation checkout with token
        response = await axios.post("http://127.0.0.1:8000/api/donations/checkout/", payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
          // Access token is expired, refresh the token
          const refreshToken = Cookies.get("refreshToken");

          if (refreshToken) {
            // Get a new access token using the refresh token
            const refreshResponse = await axios.post("http://127.0.0.1:8000/api/auth/refresh_token/", {
              refresh: refreshToken,
            });

            accessToken = refreshResponse.data.access;
            // Store the new access token in cookies
            if (accessToken) {
              Cookies.set("accessToken", accessToken);
            }
            if (!accessToken) {
              setPaymentStatus("error");
              setPaymentError("Please login first to make a donation.");
              return;
            }
            
            // Retry the API request with the new access token
            response = await axios.post("http://127.0.0.1:8000/api/donations/checkout/", payload, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            });
          } else {
            setPaymentStatus("error");
            setPaymentError("Please login first to make a donation.");
            return;
          }
        } else {
          throw error;
        }
      }
      
      const result = response.data;
      
      if (result.success) {
        // Store the session ID
        setSessionId(result.session_id);
        
        // Set payment status to success
        setPaymentStatus("success");
        
        // Verify the donation to get details
        await verifyDonation(result.session_id);
      } else {
        throw new Error(result.message || "Failed to process donation");
      }
    } catch (error) {
      setPaymentStatus("error");
      setPaymentError(error instanceof Error ? error.message : "An unknown error occurred");
    }
  };

  // Reset form to make another donation
  const handleMakeAnotherDonation = () => {
    setPaymentStatus("idle");
    setPaymentError(null);
    setSessionId(null);
    setDonationDetails(null);
    form.reset();
    
    // Refresh donation history if it's visible
    if (showHistory) {
      fetchDonationHistory(1);
    }
  };

  const watchDonationAmount = form.watch("donationAmount");
  const isCustomAmount = watchDonationAmount === "custom";

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Format date string (short version for history table)
  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    }).format(date);
  };

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
          
          {/* Donation History Toggle Button */}
          <Button 
            variant="outline" 
            onClick={toggleDonationHistory} 
            className="mt-4 text-sm"
          >
            <Clock className="mr-2 h-4 w-4" />
            {showHistory ? "Hide Donation History" : "View Donation History"}
          </Button>
        </motion.div>

        {/* Donation History Section */}
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Your Donation History
                </CardTitle>
                <CardDescription>
                  A record of all your contributions to our mission
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingHistory ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : historyError ? (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{historyError}</AlertDescription>
                  </Alert>
                ) : donationHistory.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>You haven't made any donations yet.</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment Method</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {donationHistory.map((donation) => (
                            <TableRow key={donation.id}>
                              <TableCell className="font-medium">
                                {formatShortDate(donation.created_at)}
                              </TableCell>
                              <TableCell>
                                {donation.currency} {donation.amount}
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  donation.status === 'completed' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                    : donation.status === 'pending' 
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                }`}>
                                  {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                                </span>
                              </TableCell>
                              <TableCell>
                                {donation.card_type} •••• {donation.card_number_last4}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {paymentStatus === "success" ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span>Donation Successful</span>
              </CardTitle>
              <CardDescription>
                Thank you for supporting our mission to combat deepfakes and misinformation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isVerifying ? (
                <div className="flex flex-col items-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                  <p className="text-muted-foreground">Verifying your donation...</p>
                </div>
              ) : donationDetails ? (
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <p className="font-medium text-green-800 dark:text-green-500">Payment Completed Successfully</p>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-500">
                      Your donation has been processed and confirmed. Thank you for your generosity!
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Donation Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Donation ID</p>
                        <p className="font-medium">{donationDetails.id}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Date</p>
                        <p className="font-medium">{formatDate(donationDetails.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Amount</p>
                        <p className="font-medium text-lg">{donationDetails.currency} {donationDetails.amount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Status</p>
                        <p className="font-medium capitalize">{donationDetails.status}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Donor Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Name</p>
                        <p className="font-medium">{donationDetails.donor_name}</p>
                      </div>
                      {donationDetails.donor_email && (
                        <div>
                          <p className="text-muted-foreground mb-1">Email</p>
                          <p className="font-medium">{donationDetails.donor_email}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground mb-1">Address</p>
                        <p className="font-medium">{donationDetails.donor_address}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Country</p>
                        <p className="font-medium">{donationDetails.donor_country}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Payment Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Payment Method</p>
                        <p className="font-medium capitalize">{donationDetails.payment_method_type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Card</p>
                        <p className="font-medium">
                          {donationDetails.card_type} •••• {donationDetails.card_number_last4}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Expiry</p>
                        <p className="font-medium">
                          {donationDetails.card_expiry_month}/{donationDetails.card_expiry_year.substring(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Billing City</p>
                        <p className="font-medium">{donationDetails.billing_city}</p>
                      </div>
                    </div>
                  </div>
                  
                  {donationDetails.message && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-lg">Your Message</h3>
                      <p className="text-sm italic bg-muted p-3 rounded-md">{donationDetails.message}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">Unable to retrieve donation details.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={handleMakeAnotherDonation} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Make Another Donation
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="max-w-4xl mx-auto">
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