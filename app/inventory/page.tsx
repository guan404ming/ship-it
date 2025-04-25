"use client"

import * as React from "react"
import { BoxIcon, FileDown, FileUp, PackageIcon, Search } from "lucide-react"
import { useRouter } from "next/navigation"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// 定義庫存項目的類型
type InventoryItem = {
  id: string;
  vendorCode: string;
  productCategory: string;
  productName: string;
  spec: string;
  quantity: number;
  price: number;
  status: "充足" | "警告" | "預貨中";
  deliveryStatus?: "進貨中" | undefined;
};

// 模擬的庫存數據
const inventoryData: InventoryItem[] = [
  { id: "1", vendorCode: "fju3299", productCategory: "兒童玩具", productName: "拼圖", spec: "長頸鹿款", quantity: 5, price: 200, status: "警告", deliveryStatus: "進貨中" },
  { id: "2", vendorCode: "fju3299", productCategory: "兒童玩具", productName: "拼圖", spec: "海豚款", quantity: 4, price: 200, status: "警告", deliveryStatus: "進貨中" },
  { id: "3", vendorCode: "fju3299", productCategory: "兒童玩具", productName: "拼圖", spec: "海豚款", quantity: 100, price: 200, status: "充足" },
  { id: "4", vendorCode: "jde2088", productCategory: "服飾", productName: "兒童外套", spec: "黑色", quantity: 20, price: 600, status: "警告", deliveryStatus: "進貨中" },
  { id: "5", vendorCode: "jde2088", productCategory: "服飾", productName: "兒童外套", spec: "粉色", quantity: 150, price: 600, status: "充足" },
  { id: "6", vendorCode: "kk7655", productCategory: "裝飾品", productName: "聖誕裝飾", spec: "星星", quantity: 10, price: 50, status: "警告", deliveryStatus: "進貨中" },
  { id: "7", vendorCode: "kk7655", productCategory: "裝飾品", productName: "聖誕裝飾", spec: "麋鹿", quantity: 60, price: 80, status: "充足" },
  { id: "8", vendorCode: "abc123", productCategory: "電子產品", productName: "藍牙音箱", spec: "迷你款", quantity: 15, price: 1200, status: "警告" },
  { id: "9", vendorCode: "abc123", productCategory: "電子產品", productName: "藍牙音箱", spec: "標準款", quantity: 45, price: 1800, status: "充足" },
  { id: "10", vendorCode: "def456", productCategory: "家居", productName: "抱枕", spec: "方形", quantity: 8, price: 350, status: "警告", deliveryStatus: "進貨中" },
  { id: "11", vendorCode: "def456", productCategory: "家居", productName: "抱枕", spec: "圓形", quantity: 30, price: 380, status: "充足" },
  { id: "12", vendorCode: "ghi789", productCategory: "文具", productName: "筆記本", spec: "A5", quantity: 12, price: 120, status: "警告", deliveryStatus: "進貨中" },
  { id: "13", vendorCode: "ghi789", productCategory: "文具", productName: "筆記本", spec: "A4", quantity: 120, price: 150, status: "充足" },
  { id: "14", vendorCode: "jkl012", productCategory: "運動用品", productName: "瑜伽墊", spec: "標準厚度", quantity: 3, price: 800, status: "警告", deliveryStatus: "進貨中" },
  { id: "15", vendorCode: "jkl012", productCategory: "運動用品", productName: "瑜伽墊", spec: "加厚款", quantity: 25, price: 1000, status: "充足" },
];

export default function InventoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [categoryFilter, setCategoryFilter] = React.useState<string>("所有類別")
  const [statusFilter, setStatusFilter] = React.useState<string>("所有狀態")
  const [isFilterActive, setIsFilterActive] = React.useState<boolean>(false)
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof InventoryItem | null,
    direction: 'ascending' | 'descending' | null
  }>({
    key: null,
    direction: null,
  })
  
  // 處理庫存匯入按鈕點擊
  const handleInventoryImport = () => {
    router.push('/upload?type=inventory');
  };
  
  // 計算總庫存項目和低庫存項目數量
  const totalItems = inventoryData.length;
  const lowStockItems = inventoryData.filter(item => item.status === "警告").length;
  
  // 篩選狀态處理
  const handleStatusFilter = (status: string) => {
    if (statusFilter === status) {
      // 如果點擊的是當前已篩選的狀態，則清除篩選
      setStatusFilter("所有狀態");
      setIsFilterActive(false);
    } else {
      // 否則應用新的篩選
      setStatusFilter(status);
      setIsFilterActive(true);
    }
  };
  
  // 清除所有篩選
  const clearAllFilters = () => {
    setSearchQuery("");
    setCategoryFilter("所有類別");
    setStatusFilter("所有狀態");
    setIsFilterActive(false);
  };
  
  // 排序功能
  const requestSort = (key: keyof InventoryItem) => {
    // 只有「庫存量」欄位可以排序
    if (key !== 'quantity') {
      return;
    }
    
    let direction: 'ascending' | 'descending' | null = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = null;
    }
    
    setSortConfig({ key, direction });
  };
  
  // 應用排序和篩選
  const filteredAndSortedData = React.useMemo(() => {
    let filteredData = [...inventoryData];
    
    // 應用搜索篩選
    if (searchQuery) {
      filteredData = filteredData.filter(item =>
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vendorCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.spec.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // 應用類別篩選
    if (categoryFilter !== "所有類別") {
      filteredData = filteredData.filter(item => item.productCategory === categoryFilter);
    }
    
    // 應用狀態篩選
    if (statusFilter !== "所有狀態") {
      filteredData = filteredData.filter(item => item.status === statusFilter);
    }
    
    // 應用排序
    if (sortConfig.key && sortConfig.direction) {
      filteredData.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredData;
  }, [inventoryData, searchQuery, categoryFilter, statusFilter, sortConfig]);
  
  // 獲取所有產品類別（去重）
  const productCategories = React.useMemo(() => {
    const categories = new Set(inventoryData.map(item => item.productCategory));
    return ["所有類別", ...Array.from(categories)];
  }, [inventoryData]);
  
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* 頁面標題和操作按鈕 */}
              <div className="flex items-center justify-between px-4 lg:px-6">
                <h1 className="text-3xl font-semibold">我的庫存</h1>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleInventoryImport} 
                    variant="default"
                    size="sm"
                    className="h-10 px-4"
                  >
                    <FileUp className="mr-2 h-4 w-4" />
                    庫存匯入
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="h-10 px-4"
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    資料匯出
                  </Button>
                </div>
              </div>
              
              {/* 庫存指標卡 */}
              <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:px-6">
                {/* 總庫存項目卡片 */}
                <Card className="border shadow-sm">
                  <CardContent className="flex items-center p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#08678C]/10">
                      <BoxIcon className="h-6 w-6 text-[#08678C]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-muted-foreground">總庫存項目</p>
                      <h2 className="text-3xl font-bold text-[#08678C]">
                        {totalItems}
                      </h2>
                    </div>
                  </CardContent>
                </Card>
                
                {/* 低庫存項目卡片 */}
                <Card className="border shadow-sm">
                  <CardContent className="flex items-center p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F27F3D]/10">
                      <PackageIcon className="h-6 w-6 text-[#F27F3D]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-muted-foreground">低庫存項目</p>
                      <h2 className="text-3xl font-bold text-[#F27F3D]">
                        {lowStockItems}
                      </h2>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* 搜索和篩選區域 */}
              <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center lg:px-6">
                <div className="flex items-center flex-1">
                  <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜尋項目..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-sm h-10"
                  />
                </div>
                <div className="flex gap-3 items-center">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px] h-10">
                      <SelectValue placeholder="選擇類別" />
                    </SelectTrigger>
                    <SelectContent>
                      {productCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] h-10">
                      <SelectValue placeholder="選擇狀態" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="所有狀態">所有狀態</SelectItem>
                      <SelectItem value="充足">充足</SelectItem>
                      <SelectItem value="警告">警告</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* 顯示活躍篩選指示器和清除按鈕，只有在真正有篩選條件時才顯示 */}
                  {((statusFilter !== "所有狀態" || categoryFilter !== "所有類別" || searchQuery.trim() !== "")) && (
                    <Button 
                      variant="outline" 
                      onClick={clearAllFilters} 
                      size="sm"
                      className="h-10 px-4 flex items-center"
                    >
                      <span className="mr-1">清除篩選</span>
                      <span className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground">
                        {(statusFilter !== "所有狀態" ? 1 : 0) + 
                         (categoryFilter !== "所有類別" ? 1 : 0) + 
                         (searchQuery.trim() !== "" ? 1 : 0)}
                      </span>
                    </Button>
                  )}
                </div>
              </div>
              
              {/* 庫存數據表格 */}
              <div className="px-4 lg:px-6">
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox />
                        </TableHead>
                        <TableHead>
                          廠商名稱
                        </TableHead>
                        <TableHead>
                          產品分類
                        </TableHead>
                        <TableHead>
                          產品名稱
                        </TableHead>
                        <TableHead>
                          規格
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer text-right"
                          onClick={() => requestSort('quantity')}
                        >
                          庫存量
                          {sortConfig.key === 'quantity' ? (
                            sortConfig.direction === 'ascending' ? (
                              <span className="ml-1">↑</span>
                            ) : sortConfig.direction === 'descending' ? (
                              <span className="ml-1">↓</span>
                            ) : null
                          ) : null}
                        </TableHead>
                        <TableHead>
                          庫存狀態
                        </TableHead>
                        <TableHead>進貨狀態</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Checkbox />
                          </TableCell>
                          <TableCell>{item.vendorCode}</TableCell>
                          <TableCell>{item.productCategory}</TableCell>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>{item.spec}</TableCell>
                          <TableCell className={`text-right font-mono  ${item.status === '警告' ? 'text-[#F27F3D] font-bold' : ''}`}>{item.quantity}</TableCell>
                          <TableCell>
                            <span 
                              className={`px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-all hover:shadow-sm ${
                                item.status === '充足' 
                                  ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                                  : item.status === '警告'
                                  ? 'bg-[#F27F3D]/10 text-[#F27F3D] hover:bg-[#F27F3D]/20'
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                              } ${statusFilter === item.status ? 'ring-2 ring-offset-1' : ''}`}
                              onClick={() => handleStatusFilter(item.status)}
                            >
                              {item.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {item.deliveryStatus && (
                              <span className="px-2 py-1 rounded-md text-xs font-medium bg-[#08678C]/10 text-[#08678C]">
                                {item.deliveryStatus}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}