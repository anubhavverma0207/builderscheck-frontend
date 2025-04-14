"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function RedFlagChecker() {
  const [name, setName] = useState("")

  const handleCheck = () => {
    alert(`Running background check for "${name}"...`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <p className="text-base text-muted-foreground mb-4">
        🔍 Trusted builder background checks for Kiwi homeowners
      </p>

      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-6 flex flex-col gap-4">
          <h1 className="text-xl font-semibold text-center flex items-center justify-center gap-2">
            <span role="img" aria-label="Search">🔍</span> BuildersCheck
          </h1>

          <p className="text-sm text-center text-gray-500">
            Enter builder or company name to check for risk flags
          </p>

          <Input
            type="text"
            placeholder="e.g. Wade Eatts or Oceane Holdings"
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
      </Card>
    </div>
  )
}
