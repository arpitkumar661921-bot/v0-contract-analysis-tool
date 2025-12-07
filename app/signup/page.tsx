import { SignupForm } from "@/components/auth/signup-form"
import Link from "next/link"
import { FileSearch } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <FileSearch className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">ContractScan</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-2">Start your free trial</h1>
          <p className="text-muted-foreground">No credit card required. Cancel anytime.</p>
        </div>
        <SignupForm />
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
