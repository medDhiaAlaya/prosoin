
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Calendar, TrendingUp, ShoppingCart, Package, DollarSign, BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";

const ReportsSection = () => {
  const [selectedReport, setSelectedReport] = useState("sales");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { t } = useTranslation();

  // Mock data for different reports
  const salesReportData = [
    { date: "2024-12-01", invoices: 25, total: 5420.50 },
    { date: "2024-12-02", invoices: 18, total: 3280.75 },
    { date: "2024-12-03", invoices: 32, total: 7150.25 },
    { date: "2024-12-04", invoices: 28, total: 6340.80 },
    { date: "2024-12-05", invoices: 35, total: 8920.40 }
  ];

  const purchaseReportData = [
    { date: "2024-12-01", invoices: 5, total: 2150.00, items: 45 },
    { date: "2024-12-02", invoices: 3, total: 1820.50, items: 32 },
    { date: "2024-12-03", invoices: 7, total: 3240.75, items: 58 },
    { date: "2024-12-04", invoices: 4, total: 1950.25, items: 38 },
    { date: "2024-12-05", invoices: 6, total: 2780.90, items: 52 }
  ];

  const profitReportData = [
    { date: "2024-12-01", sales: 5420.50, purchases: 2150.00, profit: 3270.50 },
    { date: "2024-12-02", sales: 3280.75, purchases: 1820.50, profit: 1460.25 },
    { date: "2024-12-03", sales: 7150.25, purchases: 3240.75, profit: 3909.50 },
    { date: "2024-12-04", sales: 6340.80, purchases: 1950.25, profit: 4390.55 },
    { date: "2024-12-05", sales: 8920.40, purchases: 2780.90, profit: 6139.50 }
  ];

  const topSellingProducts = [
    { name: "كوكا كولا", quantity: 125, revenue: 312.50 },
    { name: "شيبس", quantity: 98, revenue: 147.00 },
    { name: "شوكولاتة", quantity: 87, revenue: 261.00 },
    { name: "عصير برتقال", quantity: 76, revenue: 304.00 },
    { name: "قهوة", quantity: 65, revenue: 325.00 }
  ];

  const purchasedItems = [
    { name: "كوكا كولا", quantity: 200, cost: 400.00 },
    { name: "شيبس", quantity: 150, cost: 225.00 },
    { name: "شوكولاتة", quantity: 120, cost: 240.00 },
    { name: "عصير برتقال", quantity: 100, cost: 300.00 },
    { name: "قهوة", quantity: 80, cost: 240.00 }
  ];

  const soldItems = [
    { name: "كوكا كولا", quantity: 125, remaining: 75 },
    { name: "شيبس", quantity: 98, remaining: 52 },
    { name: "شوكولاتة", quantity: 87, remaining: 33 },
    { name: "عصير برتقال", quantity: 76, remaining: 24 },
    { name: "قهوة", quantity: 65, remaining: 15 }
  ];

  const generateReport = () => {
    console.log(`Generating ${selectedReport} report from ${dateFrom} to ${dateTo}`);
  };

  const renderReportContent = () => {
    switch (selectedReport) {
      case "sales":
        return (
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <TrendingUp className="w-5 h-5" />
                  {t('reports.salesReport')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">{t('invoices.date')}</TableHead>
                          <TableHead className="text-right">{t('invoices.title')}</TableHead>
                          <TableHead className="text-right">{t('reports.totalSales')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salesReportData.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.date}</TableCell>
                            <TableCell>{item.invoices}</TableCell>
                            <TableCell className="font-semibold text-blue-600">
                              {item.total.toFixed(2)} {t('common.currency')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={salesReportData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} ${t('common.currency')}`, t('reports.sales')]} />
                        <Bar dataKey="total" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "purchases":
        return (
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <ShoppingCart className="w-5 h-5" />
                {t('reports.inventoryReport')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">{t('invoices.date')}</TableHead>
                    <TableHead className="text-right">{t('invoices.title')}</TableHead>
                    <TableHead className="text-right">{t('invoices.items')}</TableHead>
                    <TableHead className="text-right">{t('reports.totalCost')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseReportData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.invoices}</TableCell>
                      <TableCell>{item.items}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {item.total.toFixed(2)} {t('common.currency')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "profits":
        return (
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <DollarSign className="w-5 h-5" />
                {t('reports.profitReport')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">{t('invoices.date')}</TableHead>
                    <TableHead className="text-right">{t('reports.sales')}</TableHead>
                    <TableHead className="text-right">{t('reports.purchases')}</TableHead>
                    <TableHead className="text-right">{t('reports.profit')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profitReportData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.date}</TableCell>
                      <TableCell className="text-blue-600">{item.sales.toFixed(2)} {t('common.currency')}</TableCell>
                      <TableCell className="text-red-600">{item.purchases.toFixed(2)} {t('common.currency')}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {item.profit.toFixed(2)} {t('common.currency')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "top-selling":
        return (
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <TrendingUp className="w-5 h-5" />
                {t('reports.topProducts')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">{t('products.productName')}</TableHead>
                    <TableHead className="text-right">{t('sales.quantity')}</TableHead>
                    <TableHead className="text-right">{t('reports.revenue')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSellingProducts.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="font-semibold text-blue-600">
                        {item.revenue.toFixed(2)} {t('common.currency')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "purchased-items":
        return (
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Package className="w-5 h-5" />
                {t('reports.lowStock')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">{t('products.productName')}</TableHead>
                    <TableHead className="text-right">{t('sales.quantity')}</TableHead>
                    <TableHead className="text-right">{t('reports.cost')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchasedItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {item.cost.toFixed(2)} {t('common.currency')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <BarChart3 className="w-6 h-6" />
            {t('reports.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="reportType">{t('reports.title')}</Label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder={t('reports.title')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">{t('reports.salesReport')}</SelectItem>
                  <SelectItem value="purchases">{t('reports.inventoryReport')}</SelectItem>
                  <SelectItem value="profits">{t('reports.profitReport')}</SelectItem>
                  <SelectItem value="top-selling">{t('reports.topProducts')}</SelectItem>
                  <SelectItem value="purchased-items">{t('reports.lowStock')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateFrom">{t('reports.period')} من</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">{t('reports.period')} إلى</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={generateReport} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                {t('common.generate')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {renderReportContent()}
    </div>
  );
};

export default ReportsSection;
