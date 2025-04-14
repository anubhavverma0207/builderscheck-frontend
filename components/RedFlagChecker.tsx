"use client";

import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RedFlagChecker() {
  const [name, setName] = useState("");

  const handleCheck = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/run-redflag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          openai_key: "",      // optionally add keys here
          serpapi_key: "",
        }),
      });

      const data = await response.json();
      console.log("✅ Backend Response:", data);
      alert("Check complete! See console for result.");
    } catch (error) {
      console.error("❌ Error calling backend:", error);
      alert("Something went wrong. Check console.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <p className="text-base text-muted-foreground mb-4">
        <span role="img" aria-label="Search">🔍</span> Trusted background checks for Kiwi homeowners
      </p>

      <CardContent className="w-full max-w-md shadow-xl p-6 flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-center flex items-center justify-center gap-2">
          <span role="img" aria-label="Search">🔍</span> BuildersCheck
        </h1>

        <p className="text-sm text-center text-gray-500">
          Enter builder or company name to check for risk flags
        </p>

        <Input
          type="text"
          placeholder="e.g. Wade Eatts or Oceane Holdings Limited"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Button
          onClick={handleCheck}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Run Background Check
        </Button>
      </CardContent>
    </div>
  );
}
