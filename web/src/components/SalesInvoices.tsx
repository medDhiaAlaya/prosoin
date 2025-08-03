import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, FileText, Calendar, User, Printer, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { format, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { saleService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import type { ISale } from "@/services/sale-service";

const SalesInvoices = () => {
  const [selectedInvoice, setSelectedInvoice] = useState<ISale | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<ISale[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Function to refresh the invoices list
  const refreshInvoices = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await saleService.getAll();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("sales.loadError"),
      });
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [t, toast]);

  const filteredInvoices = useCallback(() => {
    return invoices.filter(invoice => 
      (invoice.invoiceNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (invoice.customer?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );
  }, [invoices, searchQuery])();

  // Safe access to length with default value
  const invoiceCount = filteredInvoices?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <FileText className="w-6 h-6" />
            {t('invoices.title')}
          </CardTitle>
          <p className="text-sm text-gray-600">
            {t('invoices.total')}: {invoiceCount} {t('invoices.title')}
          </p>
        </CardHeader>
      </Card>

      {/* Sales Invoices List */}
      <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Receipt className="w-5 h-5" />
              {t('invoices.title')} ({invoiceCount})
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('common.search')}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <p>{t('common.loading')}</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{t('invoices.noInvoices')}</p>
              <p className="text-sm mt-2">ستظهر الفواتير هنا بعد إتمام عمليات البيع</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <Card key={invoice._id} className="border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setIsInvoiceDialogOpen(true);
                      }}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-blue-600 border-blue-300">
                            {invoice.invoiceNumber}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {invoice.items.length} {t('invoices.items')}
                          </span>
                          <Badge variant={invoice.status === 'completed' ? 'default' : 'secondary'}>
                            {t(`sales.status.${invoice.status}`)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {invoice.date ? format(new Date(invoice.date), 'PPP', { locale: fr }) : t('common.unknown')}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {invoice.customer?.name || t('sales.walkInCustomer')}
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-lg font-bold text-blue-600">
                          {invoice.total.toFixed(2)} {t('common.currency')}
                        </div>
                        <Button variant="ghost" size="sm" className="mt-1">
                          {t('invoices.viewDetails')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Details Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              {t('invoices.invoiceDetails')} {selectedInvoice?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">{t('invoices.invoiceNumber')}</span>
                  <p className="font-semibold">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">{t('invoices.date')}</span>
                  <p className="font-semibold">
                    {selectedInvoice.date && isValid(new Date(selectedInvoice.date))
                      ? format(new Date(selectedInvoice.date), 'PPP', { locale: fr })
                      : t('common.unknown')}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">{t('invoices.time')}</span>
                  <p className="font-semibold">
                    {selectedInvoice.date && isValid(new Date(selectedInvoice.date))
                      ? format(new Date(selectedInvoice.date), 'HH:mm', { locale: fr })
                      : t('common.unknown')}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">{t('invoices.customer')}</span>
                  <p className="font-semibold">{selectedInvoice.customer?.name || t('sales.walkInCustomer')}</p>
                </div>
              </div>

              {/* Status Badge */}
              <Badge variant={selectedInvoice.status === 'completed' ? 'default' : 'secondary'} className="w-fit">
                {t(`sales.status.${selectedInvoice.status}`)}
              </Badge>

              {/* Invoice Items */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('invoices.items')}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">{t('products.productName')}</TableHead>
                      <TableHead className="text-right">{t('products.price')}</TableHead>
                      <TableHead className="text-right">{t('sales.quantity')}</TableHead>
                      <TableHead className="text-right">{t('invoices.totalPrice')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedInvoice.items || []).map((item) => (
                      <TableRow key={item.product?._id || 'unknown'}>
                        <TableCell className="font-medium">{item.product?.name || t('common.unknown')}</TableCell>
                        <TableCell>{(item.price || 0).toFixed(2)} {t('common.currency')}</TableCell>
                        <TableCell>{item.quantity || 0}</TableCell>
                        <TableCell className="font-semibold">
                          {((item.price || 0) * (item.quantity || 0)).toFixed(2)} {t('common.currency')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Invoice Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>{t('sales.total')}:</span>
                  <span className="text-blue-600">{selectedInvoice.total.toFixed(2)} {t('common.currency')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)} className="flex-1">
                  {t('common.close')}
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.print();
                  }}>
                  <Printer className="w-4 h-4 mr-2" />
                  {t('invoices.printInvoice')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesInvoices;
