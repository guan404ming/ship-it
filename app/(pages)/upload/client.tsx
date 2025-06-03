"use client";

import { useState, useEffect, Suspense, ChangeEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent } from "@/components/ui/tabs";

import { FileUploadSection } from "@/components/upload/file-upload-section";
import { ManualInputSection } from "@/components/upload/manual-input-section";
import { ImportGuidelines } from "@/components/upload/import-guidelines";

export default function InventoryClient() {
  const searchParams = useSearchParams();
  const [fileImportType, setFileImportType] = useState<
    "bulk-inventory" | "bulk-order"
  >("bulk-order");
  const [manualImportType, setManualImportType] = useState<
    "inventory" | "order"
  >("order");

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "inventory") {
      setFileImportType("bulk-inventory");
      setManualImportType("inventory");
    }
  }, [searchParams]);

  const handleFileImportTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFileImportType(event.target.value as "bulk-inventory" | "bulk-order");
  };

  const handleManualImportTypeChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setManualImportType(event.target.value as "inventory" | "order");
  };

  return (
    <div className="flex flex-1 flex-col h-full w-full">
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Main Content */}
            <div className="px-4 lg:px-6">
              <h1 className="text-3xl font-semibold mb-4">資料匯入</h1>

              <Tabs defaultValue="import" className="w-full">
                {/* <TabsList className="w-fit mb-4">
                  <TabsTrigger value="import">匯入資料</TabsTrigger>
                  <TabsTrigger value="history">匯入歷史</TabsTrigger>
                </TabsList> */}

                <TabsContent value="import" className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FileUploadSection
                      fileImportType={fileImportType}
                      onFileImportTypeChange={handleFileImportTypeChange}
                    />
                    <ManualInputSection
                      manualImportType={manualImportType}
                      onManualImportTypeChange={handleManualImportTypeChange}
                    />
                  </div>

                  <ImportGuidelines />
                </TabsContent>

                {/* <TabsContent value="history">
                  <ImportHistory importHistory={mockImportHistory} />
                </TabsContent> */}
              </Tabs>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
