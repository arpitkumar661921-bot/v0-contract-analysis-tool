import { ContractUploader } from "@/components/dashboard/contract-uploader"

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Upload Contract</h1>
        <p className="text-muted-foreground">Upload your contract for AI-powered analysis</p>
      </div>
      <ContractUploader />
    </div>
  )
}
