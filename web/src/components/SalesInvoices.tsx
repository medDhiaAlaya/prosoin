import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Receipt,
  FileText,
  Calendar,
  User,
  Printer,
  Search,
  Trash2,
} from "lucide-react";
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
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Calculate totals with TVA and discount
  const calculateTotalsWithDiscount = (invoice: ISale) => {
    // Since price includes TVA, we need to calculate backwards
    let totalTTC = 0;
    let totalHT = 0;
    let totalTax = 0;

    // Calculate for each item since they might have different TVA rates
    for (const item of invoice.items) {
      const quantity = item.quantity || 0;
      const priceTTC = item.price || 0; // This is the price including TVA
      const tvaRate = Number(item.tva ?? item.product?.tva ?? 0);
      
      // Calculate HT price: HT = TTC / (1 + TVA%)
      const priceHT = priceTTC / (1 + tvaRate / 100);
      const lineTTC = priceTTC * quantity;
      const lineHT = priceHT * quantity;
      const lineTax = lineTTC - lineHT;

      totalTTC += lineTTC;
      totalHT += lineHT;
      totalTax += lineTax;
    }

    // Apply discount if any
    const discountPercent = Number(invoice.discount || 0);
    const discountAmount = (totalHT * discountPercent) / 100;
    const htAfterDiscount = totalHT - discountAmount;
    
    // Recalculate TVA after discount
    let newTotalTax = 0;
    for (const item of invoice.items) {
      const quantity = item.quantity || 0;
      const priceTTC = item.price || 0;
      const tvaRate = Number(item.tva ?? item.product?.tva ?? 0);
      const priceHT = priceTTC / (1 + tvaRate / 100);
      const lineHT = priceHT * quantity;
      const share = totalHT > 0 ? lineHT / totalHT : 0; // Share of this line in total HT
      const lineHTAfterDiscount = htAfterDiscount * share;
      newTotalTax += lineHTAfterDiscount * (tvaRate / 100);
    }

    // Final TTC is HT after discount plus new TVA amount
    const finalTTC = htAfterDiscount + newTotalTax;
    
    return { 
      totalHT, 
      discountAmount, 
      totalTax: newTotalTax,
      totalTTC: finalTTC,
      htAfterDiscount
    };
  };

  // Print receipt function - same as SalesInterface
  const printReceipt = async (invoice: ISale) => {
    const receiptWindow = window.open("", "_blank");
    const now = new Date(invoice.createdAt || new Date());
    
    // Get the current origin to create absolute URLs for the logo
    const origin = window.location.origin;
    const logoUrl = `${origin}/logo.jpeg`;
    
    // Use the actual logo file from public directory
    const finalLogoUrl = logoUrl;

    // Calculate totals
    const { totalHT, discountAmount, totalTax, totalTTC, htAfterDiscount } = calculateTotalsWithDiscount(invoice);
    
    // Prepare per-line computed values for printing
    const printLines = invoice.items.map((item) => {
      const qty = item.quantity || 0;
      const priceTTC = item.price || 0; // Price includes TVA
      const tvaRate = Number(item.product?.tva || 0);
      
      // Calculate HT prices
      const priceHT = priceTTC / (1 + tvaRate / 100);
      const lineHT = priceHT * qty;
      const lineTTC = priceTTC * qty;
      
      // Calculate this line's share of the discount
      const share = totalHT > 0 ? lineHT / totalHT : 0;
      const lineHTAfterDiscount = (totalHT - discountAmount) * share;
      const lineTax = lineHTAfterDiscount * (tvaRate / 100);
      const lineTTCAfterDiscount = lineHTAfterDiscount + lineTax;
      
      return {
        ref: item.product?.ref || "-",
        name: item.product?.name || "Unknown Product",
        quantity: qty,
        unitPrice: priceTTC,
        lineHT: lineHTAfterDiscount,
        tvaRate,
        lineTTC: lineTTCAfterDiscount,
      };
    });

    const receiptHTML = `
    <html>
    <head>
      <title>Facture ProSoin - ${invoice.invoiceNumber}</title>
     <style>
      /* Optimized for A4 paper format (210mm x 297mm) */
      @page {
        size: A4;
      }

      body {
        font-family: 'Arial', sans-serif;
        background: #f0f2f5;
        padding: 0;
        margin: 0;
        width: 330mm;
        min-height: 297mm;
        position: relative;
        font-size: 14px; /* Reduced base font size for better A4 fit */
      }

      /* Adjusted watermark for A4 dimensions */
      body::before {
        content: "";
        position: fixed;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: url('${finalLogoUrl}') no-repeat center center;
        background-size: 200px; /* Smaller watermark for A4 */
        opacity: 0.03;
        width: 400px;
        height: 400px;
        z-index: 0;
      }

      /* Optimized container for A4 with proper spacing */
      .invoice-container {
        background: white;
        padding: 15mm 20mm;
        margin: 0;
        border-radius: 0;
        box-shadow: none;
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        min-height: 267mm; /* A4 height minus margins */
        width: 200mm; /* A4 width minus margins */
      }

      /* Compact header for A4 */
      .header {
        display: flex;
        align-items: left;
        justify-content: center;
        flex-direction: column;
        border-bottom: 2px solid #0d6efd;
        padding-bottom: 8mm;
        margin-bottom: 8mm;
        position: relative;
      }
      .header img.header-logo {
        position: absolute;
        top: 0;
        right: 0;
        height: 90px; /* Smaller logo for A4 */
        width: 90px;
        border: 1px solid #ddd;
      }
      .store-info {
        text-align: left;
      }
      .store-info h2 {
        color: #0d6efd;
        margin: 2px 0;
        font-size: 18px; /* Smaller title for A4 */
      }
      .store-info p {
        margin: 1px 0;
        font-size: 11px;
        color: #555;
      }

      /* Compact info section for A4 */
      .info-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8mm;
        margin-bottom: 6mm;
        font-size: 12px;
        background: #f8f9fa;
        padding: 8px 12px;
        border-radius: 4px;
      }
      .info-col-title {
        margin: 0 0 4px 0;
        color: #0d6efd;
        font-weight: 600;
      }

      /* Table optimized for A4 with proper page breaks */
      .invoice-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        margin: 5mm 0;
        font-size: 11px; /* Smaller font for better fit */
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        page-break-inside: auto;
      }
      .invoice-table thead {
        display: table-header-group;
      }
      .invoice-table tfoot {
        display: table-footer-group;
      }
      .invoice-table thead th {
        background-color: #0d6efd;
        color: white;
        padding: 8px 6px; /* Reduced padding for A4 */
        text-align: center;
        font-weight: 600;
        border: none;
        font-size: 11px;
      }
      .invoice-table tbody td {
        padding: 6px 4px; /* Reduced padding for A4 */
        border-bottom: 1px solid #e0e0e0;
        text-align: center;
        vertical-align: middle;
        page-break-inside: avoid;
      }
      .invoice-table tbody tr:last-child td {
        border-bottom: none;
      }
      .invoice-table tbody tr:hover {
        background-color: #f8f9fa;
      }
      .invoice-table tfoot td {
        padding: 8px 6px;
        font-weight: bold;
        background: #f8f9fa;
        border-top: 2px solid #0d6efd;
        border-bottom: none;
        font-size: 12px;
      }
      .invoice-table .subtotal-spacer td {
        padding: 8mm 0 2mm 0; /* space between body and footer */
        border: none;
        background: transparent;
      }
      .invoice-table .total-label {
        text-align: right;
        padding-right: 10px;
      }
      .invoice-table .total-value {
        font-size: 13px;
        color: #0d6efd;
      }
      .price-cell {
        font-family: 'Courier New', monospace;
        font-weight: 500;
      }
      .invoice-table tbody tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      /* Spacer row style to create space between body and tfoot */
      .spacer-row td {
        padding: 6mm 0 !important;
        border: none !important;
        background: transparent !important;
      }

      /* Signatures optimized for A4 bottom */
      .signature-container {
        margin-top: 10mm;
        display: flex;
        justify-content: space-between;
        page-break-inside: avoid;
      }
      .signature-box {
        width: 70mm; /* A4-appropriate width */
        height: 20mm;
        border: 1px dashed #ccc;
        border-radius: 3px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: #666;
        background: #f8f9fa;
      }

      /* Footer positioned for A4 bottom */
      .footer {
        margin-top: auto;
        border-top: 2px solid #0d6efd;
        padding-top: 8px;
        display: flex;
        justify-content: space-around;
        font-size: 10px;
        color: #555;
        background: #f8f9fa;
        padding: 8px;
        border-radius: 4px;
        page-break-inside: avoid;
      }

      /* Enhanced print styles for A4 */
      @media print {
        body {
          background: none !important;
          padding: 0 !important;
          margin: 0 !important;
          width: 210mm !important;
          font-size: 11px !important;
        }
        
        .invoice-container {
          background: white !important;
          padding: 15mm 20mm !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          position: relative !important;
          z-index: 1 !important;
          display: flex !important;
          flex-direction: column !important;
          min-height: 267mm !important;
          width: 170mm !important;
          margin: 0 !important;
        }
        
        body::before {
          display: none !important;
        }
        
        .signature-container, .footer {
          page-break-inside: avoid !important;
        }
        
        .invoice-table {
          page-break-inside: auto !important;
        }
        
        .invoice-table thead {
          display: table-header-group !important;
        }
        
        .invoice-table tfoot {
          display: table-footer-group !important;
        }
        
        /* Ensure proper page breaks for long tables */
        .invoice-table tbody tr {
          page-break-inside: avoid !important;
        }
      }
    </style>
    </head>
    <body>
      <div class="invoice-container">

        <!-- Header -->
      <div class="header">
        <img src="${finalLogoUrl}" alt="ProSoin Logo" class="header-logo" />
        <div class="store-info">
          <h2>ProSoin - Matériel Médical & Paramédical</h2>
          <p>Vente et location d'équipements médicaux et paramédicaux essentiels.</p>
          <p><strong>Tél:</strong> +216 57 183 366 / +216 57 183 367</p>
          <p><strong>Adresse :</strong> Avenue Habib Bourguiba Ghannouch Gabès, Tunisia</p>
          <p><strong>Site web :</strong> www.prosoin.com</p>
        </div>
      </div>

        <!-- Info Section -->
        <div class="info-section">
          <div>
            <p><strong>Client :</strong> ${invoice.customer?.name || "____________________"}</p>
            <p><strong>MF :</strong> ____________________</p>
            <p><strong>Téléphone :</strong> ${invoice.customer?.phone || "____________________"}</p>
          </div>
          <div style="text-align:right;">
            <p><strong>Date :</strong> ${now.toLocaleString()}</p>
            <p><strong>N° Facture :</strong> ${invoice.invoiceNumber}</p>
          </div>
        </div>

        <!-- Product Table -->
        <table class="invoice-table">
          <thead>
            <tr>
              <th>Réf</th>
              <th>Article</th>
              <th>Prix U. TTC</th>
              <th>Qté</th>
              <th>TVA %</th>
              <th>Total HT</th>
              <th>Total TTC</th>
            </tr>
          </thead>
          <tbody>
            ${printLines.map(line => `
              <tr>
                <td>${line.ref}</td>
                <td style="text-align: left;">${line.name}</td>
                <td class="price-cell">${line.unitPrice.toFixed(2)}</td>
                <td>${line.quantity}</td>
                <td>${line.tvaRate.toFixed(2)}</td>
                <td class="price-cell">${line.lineHT.toFixed(2)}</td>
                <td class="price-cell">${line.lineTTC.toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5" class="total-label">Total HT</td>
              <td colspan="2" class="total-value price-cell">${totalHT.toFixed(2)} DT</td>
            </tr>
            ${invoice.discount && invoice.discount !== 0 ? `
            <tr>
              <td colspan="5" class="total-label">Remise (${invoice.discount}%)</td>
              <td colspan="2" class="total-value price-cell">-${discountAmount.toFixed(2)} DT</td>
            </tr>
            <tr>
              <td colspan="5" class="total-label">Total HT après remise</td>
              <td colspan="2" class="total-value price-cell">${htAfterDiscount.toFixed(2)} DT</td>
            </tr>
            ` : ''}
            <tr>
              <td colspan="5" class="total-label">TVA</td>
              <td colspan="2" class="total-value price-cell">${totalTax.toFixed(2)} DT</td>
            </tr>
            <tr>
              <td colspan="5" class="total-label">Total TTC</td>
              <td colspan="2" class="total-value price-cell">${totalTTC.toFixed(2)} DT</td>
            </tr>
          </tfoot>
        </table>

     

        <!-- Footer -->
        <div class="footer">
          <div> 🌐 www.prosoin.com</div>
          <div>📞 +216 57 183 366</div>
          <div>📍 Avenue Habib Bourguiba Ghannouch Gabès, Tunisia</div>
        </div>

      </div>

      <script>
        // Ensure logo loads before printing
        const logoImg = document.querySelector('.header img');
        if (logoImg) {
          logoImg.onload = function() {
            console.log('Logo loaded successfully');
            // Print after logo is loaded
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 1000);
            }, 100);
          };
          
          logoImg.onerror = function() {
            console.log('Logo failed to load, printing anyway');
            // Print even if logo fails to load
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 1000);
            }, 100);
          };
        } else {
          // Fallback if logo element not found
          setTimeout(() => {
            window.print();
            setTimeout(() => window.close(), 1000);
          }, 500);
        }
      </script>
    </body>
    </html>
    `;

    receiptWindow?.document.write(receiptHTML);
    receiptWindow?.document.close();
  };

  // Function to cancel/delete an invoice
  const cancelInvoice = async (id: string) => {
    try {
      await saleService.cancel(id);
      toast({
        title: t("invoices.cancelSuccess"),
        description: t("invoices.cancelSuccessDesc"),
      });
      loadInvoices();
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("invoices.cancelError"),
      });
    }
  };

  // Function to refresh the invoices list
  const refreshInvoices = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await saleService.getSalesByUser();
      setInvoices(Array.isArray(data.sales) ? data.sales : []);
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
  }, [t, toast]);

  useEffect(() => {
    loadInvoices();
  }, [t, toast, loadInvoices]);

  const filteredInvoices = useCallback(() => {
    return invoices.filter(
      (invoice) =>
        // First filter out cancelled invoices
        invoice.status !== "cancelled" &&
        // Then apply search filter
        ((invoice.invoiceNumber?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        ) ||
        (invoice.customer?.email?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        ) ||
        (invoice.customer?.name?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        ))
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
            {t("invoices.title")}
          </CardTitle>
          <p className="text-sm text-gray-600">
            {t("invoices.total")}: {invoiceCount} {t("invoices.title")}
          </p>
        </CardHeader>
      </Card>

      {/* Sales Invoices List */}
      <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Receipt className="w-5 h-5" />
              {t("invoices.title")} ({invoiceCount})
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("common.search")}
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
              <p>{t("common.loading")}</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{t("invoices.noInvoices")}</p>
              <p className="text-sm mt-2"></p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <Card
                  key={invoice._id}
                  className="border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    setSelectedInvoice(invoice);
                    setIsInvoiceDialogOpen(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-blue-600 border-blue-300"
                          >
                            {invoice.invoiceNumber}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {invoice.items.length} {t("invoices.items")}
                          </span>
                          <Badge
                            variant={
                              invoice.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {t(`invoices.statuses.${invoice.status}`)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {invoice.createdAt
                              ? format(new Date(invoice.createdAt), "PPP", {
                                  locale: fr,
                                })
                              : t("common.unknown")}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {invoice.customer?.name ||
                              t("sales.walkInCustomer")}
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="flex flex-col">
                          <div className="text-lg font-bold text-blue-600">
                            {(() => {
                              const totals = calculateTotalsWithDiscount(invoice);
                              return totals.totalTTC.toFixed(2);
                            })()} {t("common.currency")}
                          </div>
                          <div className="text-sm text-gray-500">
                            TVA: {(() => {
                              const totals = calculateTotalsWithDiscount(invoice);
                              return totals.totalTax.toFixed(2);
                            })()} {t("common.currency")}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="mt-1">
                            {t("invoices.viewDetails")}
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="mt-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent onClick={(e) => e.stopPropagation()}>
                              <DialogHeader>
                                <DialogTitle>{t("invoices.cancelTitle")}</DialogTitle>
                                <DialogDescription>
                                  {t("invoices.cancelConfirm")}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <label className="text-sm text-gray-600 mb-2 block">
                                  {t("common.enterPassword")}
                                </label>
                                <Input
                                  type="password"
                                  value={deletePassword}
                                  onChange={(e) => {
                                    setDeletePassword(e.target.value);
                                    setDeleteError(false);
                                  }}
                                  className={deleteError ? "border-red-500" : ""}
                                />
                                {deleteError && (
                                  <p className="text-sm text-red-500 mt-1">
                                    {t("common.incorrectPassword")}
                                  </p>
                                )}
                              </div>
                              <DialogFooter>
                                <Button 
                                  variant="outline" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletePassword("");
                                    setDeleteError(false);
                                  }}>
                                  {t("common.cancel")}
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (deletePassword === "4321") {
                                      cancelInvoice(invoice._id);
                                      setDeletePassword("");
                                      setDeleteError(false);
                                    } else {
                                      setDeleteError(true);
                                    }
                                  }}>
                                  {t("common.confirm")}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
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
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              {t("invoices.invoiceDetails")} {selectedInvoice?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">
                    {t("invoices.invoiceNumber")}
                  </span>
                  <p className="font-semibold">
                    {selectedInvoice.invoiceNumber}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">
                    {t("invoices.date")}
                  </span>
                  <p className="font-semibold">
                    {selectedInvoice.createdAt &&
                    isValid(new Date(selectedInvoice.createdAt))
                      ? format(new Date(selectedInvoice.createdAt), "PPP", {
                          locale: fr,
                        })
                      : t("common.unknown")}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">
                    {t("invoices.time")}
                  </span>
                  <p className="font-semibold">
                    {selectedInvoice.createdAt &&
                    isValid(new Date(selectedInvoice.createdAt))
                      ? format(new Date(selectedInvoice.createdAt), "HH:mm", {
                          locale: fr,
                        })
                      : t("common.unknown")}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">
                    {t("invoices.customer")}
                  </span>
                  <p className="font-semibold">
                    {selectedInvoice.customer?.name ||
                      t("sales.walkInCustomer")}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <Badge
                variant={
                  selectedInvoice.status === "completed"
                    ? "default"
                    : "secondary"
                }
                className="w-fit"
              >
                {t(`invoices.statuses.${selectedInvoice.status}`)}
              </Badge>

              {/* Invoice Items */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {t("invoices.items")}
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">
                        {t("products.productName")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("products.price")} TTC
                      </TableHead>
                      <TableHead className="text-right">
                        {t("sales.quantity")}
                      </TableHead>
                      <TableHead className="text-right">TVA (%)</TableHead>
                      <TableHead className="text-right">
                        Total HT
                      </TableHead>
                      <TableHead className="text-right">Total TTC</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedInvoice.items || []).map((item) => {
                      const qty = item.quantity || 0;
                      const unit = item.price || 0;
                      const lineHT = unit * qty;
                      const tvaRate = (item.tva ?? item.product?.tva ?? 0) as number;
                      const sumHT =
                        (selectedInvoice.totalHT ?? selectedInvoice.total ??
                          (selectedInvoice.items || []).reduce(
                            (s, it) => s + (it.price || 0) * (it.quantity || 0),
                            0
                          )) || 0;
                      const discountAmount =
                        selectedInvoice.discountAmount ?? (() => {
                          const percent = selectedInvoice.discount || 0;
                          const htBase = (selectedInvoice.totalHT ?? selectedInvoice.total) || 0;
                          return (htBase * percent) / 100;
                        })();
                      const share = sumHT > 0 ? lineHT / sumHT : 0;
                      const lineDiscount = discountAmount * share;
                      const baseAfterDiscount = lineHT - lineDiscount;
                      const lineTax = (baseAfterDiscount * (Number(tvaRate) || 0)) / 100;
                      const lineTTC = baseAfterDiscount + lineTax;
                      return (
                        <TableRow key={item.product?._id || "unknown"}>
                          <TableCell className="font-medium">
                            {item.product?.name || t("common.unknown")}
                          </TableCell>
                          <TableCell>
                            {unit.toFixed(2)} {t("common.currency")}
                          </TableCell>
                          <TableCell>{qty}</TableCell>
                          <TableCell className="text-right">{Number(tvaRate).toFixed(2)}</TableCell>
                          <TableCell className="font-semibold">
                            {lineHT.toFixed(2)} {t("common.currency")}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {lineTTC.toFixed(2)} {t("common.currency")}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Invoice Totals (HT, Remise, Taxes, TTC) */}
              <div className="border-t pt-4 space-y-2">
                {(() => {
                  const totals = calculateTotalsWithDiscount(selectedInvoice);
                  return (
                    <>
                      <div className="flex justify-between items-center text-l font-semibold">
                        <span>Total HT:</span>
                        <span>
                          {totals.totalHT.toFixed(2)} {t("common.currency")}
                        </span>
                      </div>
                      {selectedInvoice.discount && selectedInvoice.discount > 0 && (
                        <>
                          <div className="flex justify-between items-center text-l font-semibold">
                            <span>Remise ({Number(selectedInvoice.discount).toFixed(2)}%):</span>
                            <span className="text-red-600">
                              -{totals.discountAmount.toFixed(2)} {t("common.currency")}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-l font-semibold">
                            <span>Total HT après remise:</span>
                            <span>
                              {totals.htAfterDiscount.toFixed(2)} {t("common.currency")}
                            </span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between items-center text-l font-semibold">
                        <span>Taxes (TVA):</span>
                        <span className="text-amber-600">
                          {totals.totalTax.toFixed(2)} {t("common.currency")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span>Total TTC:</span>
                        <span className="text-blue-600">
                          {totals.totalTTC.toFixed(2)} {t("common.currency")}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsInvoiceDialogOpen(false)}
                  className="flex-1"
                >
                  {t("common.close")}
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    printReceipt(selectedInvoice);
                  }}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  {t("invoices.printInvoice")}
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
