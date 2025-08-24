import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Print receipt function - same as SalesInterface
  const printReceipt = async (invoice: ISale) => {
    const receiptWindow = window.open("", "_blank");
    const now = new Date(invoice.createdAt || new Date());
    
    // Get the current origin to create absolute URLs for the logo
    const origin = window.location.origin;
    const logoUrl = `${origin}/logo.jpeg`;
    
    // Use the actual logo file from public directory
    const finalLogoUrl = logoUrl;

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
          font-size: 14px;
        }

        /* Adjusted watermark for A4 dimensions */
        body::before {
          content: "";
          position: fixed;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: url('${finalLogoUrl}') no-repeat center center;
          background-size: 200px;
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
          min-height: 267mm;
          width: 200mm;
        }

        /* Compact header for A4 */
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #0d6efd;
          padding-bottom: 10mm;
          margin-bottom: 8mm;
        }
        .header img {
          height: 100px;
          width: 100px;
          border: 1px solid #ddd;
        }
        .store-info {
          text-align: right;
        }
        .store-info h2 {
          color: #0d6efd;
          margin: 0;
          font-size: 20px;
        }
        .store-info p {
          margin: 1px 0;
          font-size: 11px;
          color: #555;
        }

        /* Compact info section for A4 */
        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6mm;
          font-size: 12px;
          background: #f8f9fa;
          padding: 8px 12px;
          border-radius: 4px;
        }
        .info-section div {
          width: 48%;
        }

        /* Table optimized for A4 with proper page breaks */
        .invoice-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin: 5mm 0;
          font-size: 11px;
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
          padding: 8px 6px;
          text-align: center;
          font-weight: 600;
          border: none;
          font-size: 11px;
        }
        .invoice-table tbody td {
          padding: 6px 4px;
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

        /* Signatures optimized for A4 bottom */
        .signature-container {
          margin-top: 10mm;
          display: flex;
          justify-content: space-between;
          page-break-inside: avoid;
        }
        .signature-box {
          width: 70mm;
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
          <img src="${finalLogoUrl}" alt="ProSoin Logo" />
          <div class="store-info">
            <h2>ProSoin</h2>
            <p>Santé et Bien-être</p>
            <p>Gabès, Tunisie</p>
          </div>
        </div>

        <!-- Info Section -->
        <div class="info-section">
          <div>
            <p><strong>Client :</strong> ${invoice.customer?.name || "____________________"}</p>
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
              <th>Qté</th>
              <th>Prix (DT)</th>
              <th>Total (DT)</th>
            </tr>
          </thead>
          <tbody>
            ${(invoice.items || [])
              .map(
                (item) => `
              <tr>
                <td>${item.product?.ref || "-"}</td>
                <td style="text-align: left;">${item.product?.name || "Unknown Product"}</td>
                <td>${item.quantity || 0}</td>
                <td class="price-cell">${(item.price || 0).toFixed(2)}</td>
                <td class="price-cell">${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" class="total-label">Total TTC</td>
              <td class="total-value price-cell">${invoice.total.toFixed(2)} DT</td>
            </tr>
            ${invoice.discount && invoice.discount !== 0 ? `
            <tr>
              <td colspan="4" class="total-label">Remise (${invoice.discount}%)</td>
              <td class="total-value price-cell">-${(invoice.total * (invoice.discount / 100)).toFixed(2)} DT</td>
            </tr>
            <tr>
              <td colspan="4" class="total-label">Total après remise</td>
              <td class="total-value price-cell">${(invoice.total * (1 - invoice.discount / 100)).toFixed(2)} DT</td>
            </tr>
            ` : ''}
          </tfoot>
        </table>

        <!-- Signatures -->
        <div class="signature-container">
          <div class="signature-box">Signature Vendeur</div>
          <div class="signature-box">Signature Client</div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div>📧 contact@prosoin.com</div>
          <div>📞 +216 00 000 000</div>
          <div>📍 Gabès, Tunisie</div>
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

  // Function to refresh the invoices list
  const refreshInvoices = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const loadInvoices = async () => {
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
  };

  useEffect(() => {
    loadInvoices();
  }, [t, toast]);

  const filteredInvoices = useCallback(() => {
    return invoices.filter(
      (invoice) =>
        (invoice.invoiceNumber?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        ) ||
        (invoice.customer?.email?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        ) ||
        (invoice.customer?.name?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        )
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
                        <div className="text-lg font-bold text-blue-600">
                          {invoice.total.toFixed(2)} {t("common.currency")}
                        </div>
                        <Button variant="ghost" size="sm" className="mt-1">
                          {t("invoices.viewDetails")}
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
                        {t("products.price")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("sales.quantity")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("invoices.totalPrice")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedInvoice.items || []).map((item) => (
                      <TableRow key={item.product?._id || "unknown"}>
                        <TableCell className="font-medium">
                          {item.product?.name || t("common.unknown")}
                        </TableCell>
                        <TableCell>
                          {(item.price || 0).toFixed(2)} {t("common.currency")}
                        </TableCell>
                        <TableCell>{item.quantity || 0}</TableCell>
                        <TableCell className="font-semibold">
                          {((item.price || 0) * (item.quantity || 0)).toFixed(
                            2
                          )}{" "}
                          {t("common.currency")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Invoice Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-l font-bold">
                  <span>{t("sales.total")}:</span>
                  <span className="text-blue-600">
                    {selectedInvoice.total.toFixed(2)} {t("common.currency")}
                  </span>
                </div>
                {selectedInvoice.discount && selectedInvoice.discount !== 0 ? (
                  <div className="flex justify-between items-center text-l font-bold">
                    <span>{t("sales.discount")}:</span>
                    <span className="text-red-600">
                      {selectedInvoice.discount.toFixed(2)} %
                    </span>
                  </div>
                ) : null}
                {selectedInvoice.discount && selectedInvoice.discount !== 0 ? (
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>{t("sales.totalAfterDiscount")}:</span>
                    <span className="text-green-600">
                      {(
                        selectedInvoice.total *
                        (1 - selectedInvoice.discount / 100)
                      ).toFixed(2)}{" "}
                      {t("common.currency")}
                    </span>
                  </div>
                ) : null}
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
