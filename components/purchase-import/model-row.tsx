import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/number-input";
import { Trash2 } from "lucide-react";
import { ModelRowProps } from "./types";

export const ModelRow = ({
  model,
  onNameChange,
  onQuantityChange,
  onRemove,
}: ModelRowProps) => (
  <div className="grid grid-cols-12 gap-4 p-2 items-center">
    <div className="col-span-6">
      <Input
        placeholder="輸入規格名稱"
        value={model.name}
        onChange={(e) => onNameChange(e.target.value)}
        className="h-10 w-full"
      />
    </div>
    <div className="col-span-4">
      <NumberInput
        value={model.quantity}
        onChange={(value) => onQuantityChange(value)}
        min={1}
        step={1}
        className="w-full"
      />
    </div>
    <div className="col-span-2 text-right">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </div>
);
