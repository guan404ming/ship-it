import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Supplier } from "@/actions/suppliers";
import dayjs from "dayjs";

interface PurchaseHeaderProps {
  suppliers: Supplier[];
  supplierId: number | null;
  onSupplierChange: (value: string) => void;
  orderDate: string;
  onOrderDateChange: (value: string) => void;
  expectedDeliveryDays: number;
  onDeliveryDaysChange: (value: number) => void;
  expectedDeliveryDate: string;
}

export const PurchaseHeader = ({
  suppliers,
  supplierId,
  onSupplierChange,
  orderDate,
  onOrderDateChange,
  expectedDeliveryDays,
  onDeliveryDaysChange,
  expectedDeliveryDate,
}: PurchaseHeaderProps) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-3 my-6">
    <div>
      <label className="text-sm font-medium mb-2 block">廠商名稱</label>
      <Select
        value={supplierId?.toString() ?? ""}
        onValueChange={onSupplierChange}
        required
        defaultValue={supplierId?.toString() ?? ""}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="請選擇廠商" />
        </SelectTrigger>
        <SelectContent>
          {suppliers.map((s) => (
            <SelectItem key={s.supplier_id} value={s.supplier_id.toString()}>
              {s.supplier_name || `廠商 ${s.supplier_id}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div>
      <label className="text-sm font-medium mb-2 block">叫貨日期</label>
      <Input
        type="date"
        value={orderDate}
        onChange={(e) => onOrderDateChange(e.target.value)}
      />
    </div>
    <div>
      <label className="text-sm font-medium mb-2 block">預計到貨天數</label>
      <div className="flex items-center gap-2">
        <Input
          value={expectedDeliveryDays}
          onChange={(e) => onDeliveryDaysChange(Number(e.target.value))}
          className="w-24"
        />
        <span className="text-sm text-muted-foreground">
          天後 ({dayjs(expectedDeliveryDate).format("YYYY-MM-DD")})
        </span>
      </div>
    </div>
  </div>
);
