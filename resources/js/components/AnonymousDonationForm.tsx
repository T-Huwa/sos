import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const AnonymousDonationForm: React.FC = () => {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    if (!amount) {
      toast.error("Please enter a donation amount.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/anonymous-donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, message }),
      });


      toast.success("Thank you for your anonymous donation!");

      setAmount("");
      setMessage("");
    } catch (error) {
      toast.error("Donation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-10 shadow-2xl rounded-2xl">
      <CardContent className="p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center">Anonymous Donation</h2>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (MWK)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Optional Message</Label>
          <Textarea
            id="message"
            placeholder="Leave a kind note or intention (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          />
        </div>

        <Button
          className="w-full"
          onClick={handleDonate}
          disabled={loading || !amount}
        >
          {loading ? "Processing..." : "Donate Anonymously"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AnonymousDonationForm;
