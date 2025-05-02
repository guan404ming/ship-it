"use client";

import * as React from "react";
import { NumberInput } from "@/components/ui/number-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NumberInputExamplesPage() {
  const [basicValue, setBasicValue] = React.useState<number>(0);
  const [formattedValue, setFormattedValue] = React.useState<number>(1000);
  const [limitedValue, setLimitedValue] = React.useState<number>(50);
  const [stepValue, setStepValue] = React.useState<number>(25);
  const [rightControlsValue, setRightControlsValue] = React.useState<number>(5);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">數字輸入元件示例</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>基本數字輸入</CardTitle>
            <CardDescription>
              帶有增減按鈕的基本數字輸入，支援鍵盤上下鍵控制。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>目前值: {basicValue}</p>
              <NumberInput 
                value={basicValue} 
                onChange={setBasicValue} 
                className="max-w-[180px]"
                placeholder="輸入數字"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>格式化數字</CardTitle>
            <CardDescription>
              數字以千位分隔符格式化顯示
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>目前值: {formattedValue}</p>
              <NumberInput 
                value={formattedValue} 
                onChange={setFormattedValue}
                formatOptions={{ style: 'decimal', useGrouping: true }}
                className="max-w-[180px]"
                placeholder="輸入數字"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>範圍限制</CardTitle>
            <CardDescription>
              限制數字在 0-100 之間
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>目前值: {limitedValue} (範圍: 0-100)</p>
              <NumberInput 
                value={limitedValue} 
                onChange={setLimitedValue}
                min={0}
                max={100}
                className="max-w-[180px]"
                placeholder="輸入數字"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>自訂步進值</CardTitle>
            <CardDescription>
              每次增減變化為 5 單位
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>目前值: {stepValue} (步進: 5)</p>
              <NumberInput 
                value={stepValue} 
                onChange={setStepValue}
                step={5}
                className="max-w-[180px]"
                placeholder="輸入數字"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>右側控制按鈕</CardTitle>
            <CardDescription>
              控制按鈕位於右側的數字輸入
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>目前值: {rightControlsValue}</p>
              <NumberInput 
                value={rightControlsValue} 
                onChange={setRightControlsValue}
                controlsPosition="right"
                className="max-w-[180px]"
                placeholder="輸入數字"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>禁用狀態</CardTitle>
            <CardDescription>
              無法操作的數字輸入控制項
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <NumberInput 
                value={0} 
                disabled
                className="max-w-[180px]"
                placeholder="輸入數字"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}