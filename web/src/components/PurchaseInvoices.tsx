import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Calendar, Package, Receipt, Trash2, Eye, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { purchaseService } from "@/services";
import type { IPurchase, ICreatePurchase } from "@/services/purchase-service";
import { productService } from "@/services";
import type { IProduct } from "@/services/product-service";

interface NewInvoiceForm {
  invoiceNumber: string;
  supplier: string;
  items: Array<{
    product: string;
    quantity: number;
    purchasePrice: number;
    salePrice: number;
  }>;
}

const PurchaseInvoices = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // States
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<IPurchase[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<IPurchase | null>(null);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [filterStatus, setFilterStatus] = useState<IPurchase['status'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [newInvoice, setNewInvoice] = useState<NewInvoiceForm>({
    invoiceNumber: '',
    supplier: '',
    items: []
  });

  // API calls and data loading
  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await purchaseService.getAll();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (error) {
      setInvoices([]);
      toast({
        title: t('errors.loadingFailed'),
        description: t('errors.tryAgain'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      setProducts([]);
      toast({
        title: t('errors.loadingFailed'),
        description: t('errors.tryAgain'),
        variant: 'destructive',
      });
    }
  };

  const handleAddInvoice = async () => {
    try {
      if (newInvoice.items.length === 0) {
        toast({
          title: t('errors.validation'),
          description: t('purchase.addAtLeastOneItem'),
          variant: 'destructive',
        });
        return;
      }

      setLoading(true);
      await purchaseService.create({
        invoiceNumber: newInvoice.invoiceNumber,
        supplier: newInvoice.supplier,
        items: newInvoice.items
      });
      
      toast({
        title: t('purchase.invoiceCreated'),
        description: t('purchase.invoiceCreatedDescription'),
      });
      
      setShowNewInvoice(false);
      setNewInvoice({ invoiceNumber: '', supplier: '', items: [] });
      await loadInvoices();
    } catch (error) {
      toast({
        title: t('errors.creationFailed'),
        description: t('errors.tryAgain'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    try {
      setLoading(true);
      await purchaseService.delete(id);
      toast({
        title: t('purchase.invoiceDeleted'),
        description: t('purchase.invoiceDeletedDescription'),
      });
      await loadInvoices();
    } catch (error) {
      toast({
        title: t('errors.deletionFailed'),
        description: t('errors.tryAgain'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    loadInvoices();
    loadProducts();
  }, []);

  // Filtered invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{t('purchase.title')}</h2>
          <p className="text-sm text-gray-500">{t('purchase.subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Select value={filterStatus} onValueChange={(value: IPurchase['status']) => setFilterStatus(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('common.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">{t('status.completed')}</SelectItem>
                <SelectItem value="pending">{t('status.pending')}</SelectItem>
                <SelectItem value="cancelled">{t('status.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={showNewInvoice} onOpenChange={setShowNewInvoice}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t('purchase.new')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('purchase.new')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleAddInvoice(); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">{t('purchase.invoiceNumber')}</Label>
                    <Input
                      id="invoiceNumber"
                      value={newInvoice.invoiceNumber}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">{t('purchase.supplier')}</Label>
                    <Input
                      id="supplier"
                      value={newInvoice.supplier}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, supplier: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('purchase.items')}</Label>
                  {newInvoice.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-5 gap-2 items-end">
                      <Select 
                        value={item.product} 
                        onValueChange={(value) => {
                          const items = [...newInvoice.items];
                          items[index] = { ...items[index], product: value };
                          setNewInvoice(prev => ({ ...prev, items }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('purchase.selectProduct')} />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product._id} value={product._id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder={t('purchase.quantity')}
                        value={item.quantity}
                        onChange={(e) => {
                          const items = [...newInvoice.items];
                          items[index] = { ...items[index], quantity: Number(e.target.value) };
                          setNewInvoice(prev => ({ ...prev, items }));
                        }}
                        min="1"
                        required
                      />
                      <Input
                        type="number"
                        placeholder={t('purchase.purchasePrice')}
                        value={item.purchasePrice}
                        onChange={(e) => {
                          const items = [...newInvoice.items];
                          items[index] = { ...items[index], purchasePrice: Number(e.target.value) };
                          setNewInvoice(prev => ({ ...prev, items }));
                        }}
                        min="0"
                        step="0.01"
                        required
                      />
                      <Input
                        type="number"
                        placeholder={t('purchase.salePrice')}
                        value={item.salePrice}
                        onChange={(e) => {
                          const items = [...newInvoice.items];
                          items[index] = { ...items[index], salePrice: Number(e.target.value) };
                          setNewInvoice(prev => ({ ...prev, items }));
                        }}
                        min="0"
                        step="0.01"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          const items = [...newInvoice.items];
                          items.splice(index, 1);
                          setNewInvoice(prev => ({ ...prev, items }));
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => setNewInvoice(prev => ({
                      ...prev,
                      items: [...prev.items, { product: '', quantity: 0, purchasePrice: 0, salePrice: 0 }]
                    }))}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('purchase.addItem')}
                  </Button>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={loading || newInvoice.items.length === 0}>
                    {loading ? t('common.saving') : t('common.save')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('purchase.invoiceNumber')}</TableHead>
              <TableHead>{t('purchase.supplier')}</TableHead>
              <TableHead>{t('purchase.date')}</TableHead>
              <TableHead>{t('purchase.itemCount')}</TableHead>
              <TableHead>{t('purchase.total')}</TableHead>
              <TableHead>{t('purchase.status')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            )}
            {!loading && filteredInvoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {t('purchase.noInvoices')}
                </TableCell>
              </TableRow>
            )}
            {!loading && filteredInvoices.map((invoice) => (
              <TableRow key={invoice._id}>
                <TableCell>{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.supplier}</TableCell>
                <TableCell>{format(new Date(invoice.createdAt), 'Pp', { locale: fr })}</TableCell>
                <TableCell>{invoice.items.length}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(invoice.total)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={invoice.status === 'completed' ? 'default' : 
                            invoice.status === 'pending' ? 'secondary' : 'destructive'}
                  >
                    {t(`status.${invoice.status}`)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedInvoice(invoice)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteInvoice(invoice._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Invoice Details Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('purchase.details')}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">{t('purchase.invoiceNumber')}</Label>
                  <p className="font-medium">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">{t('purchase.supplier')}</Label>
                  <p className="font-medium">{selectedInvoice.supplier}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">{t('purchase.date')}</Label>
                  <p className="font-medium">
                    {format(new Date(selectedInvoice.createdAt), 'Pp', { locale: fr })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">{t('purchase.status')}</Label>
                  <Badge
                    variant={selectedInvoice.status === 'completed' ? 'default' : 
                            selectedInvoice.status === 'pending' ? 'secondary' : 'destructive'}
                  >
                    {t(`status.${selectedInvoice.status}`)}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">{t('purchase.items')}</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('purchase.product')}</TableHead>
                      <TableHead>{t('purchase.quantity')}</TableHead>
                      <TableHead>{t('purchase.purchasePrice')}</TableHead>
                      <TableHead>{t('purchase.salePrice')}</TableHead>
                      <TableHead>{t('purchase.subtotal')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                          }).format(item.purchasePrice)}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                          }).format(item.salePrice)}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                          }).format(item.purchasePrice * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">
                        {t('purchase.total')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        }).format(selectedInvoice.total)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseInvoices;
