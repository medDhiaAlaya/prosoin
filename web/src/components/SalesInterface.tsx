import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  Printer,
  Receipt,
  List,
  Grid,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useCallback } from "react";


import { productService, saleService, IProduct } from "@/services";
import SalesCheckout from "./SalesCheckout";

interface CartItem extends IProduct {
  quantity: number;
}

const SalesInterface = ({ setActiveTab }) => {
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCardView, setIsCardView] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const { toast } = useToast();
  const { t } = useTranslation();

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await productService.getAll();
      setProducts(response.products);
    } catch (error) {
      toast({
        title: t("errors.loadError"),
        description: t("errors.general"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, t]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleCheckoutOpen = () => {
    if (cart.length === 0) {
      toast({
        title: t("sales.noProducts"),
        description: t("sales.cart"),
        variant: "destructive",
      });
      return;
    }
    setCheckoutOpen(true);
  };

  const addToCart = (product: IProduct) => {
    const existingItem = cart.find((item) => item._id === product._id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;

    if (currentQuantity + 1 > product.stock) {
      toast({
        title: t("errors.stockError"),
        description: t("errors.insufficientStock"),
        variant: "destructive",
      });
      return;
    }

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    toast({
      title: t("sales.productAdded"),
      description: `${product.name} ${t("sales.addToCart")}`,
    });
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    const item = cart.find((item) => item._id === id);
    if (!item) return;

    if (newQuantity <= 0) {
      setCart(cart.filter((item) => item._id !== id));
    } else {
      if (newQuantity > item.stock) {
        toast({
          title: t("errors.stockError"),
          description: t("errors.insufficientStock"),
          variant: "destructive",
        });
        return;
      }

      setCart(
        cart.map((item) =>
          item._id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await productService.getByBarcode(barcode);
      if (response.product) {
        addToCart(response.product);
        setBarcode("");
      } else {
        toast({
          title: t("errors.general"),
          description: t("products.noProducts"),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t("errors.general"),
        description: t("errors.tryAgain"),
        variant: "destructive",
      });
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = async (data, printInvoice = false) => {
    try {
      setIsLoading(true);
      const saleData = {
        items: cart.map((item) => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        ...data,
      };
      const response = await saleService.create(saleData);
      toast({
        title: t("sales.saleCompleted"),
        description: `${t("sales.invoiceNumber")}: ${
          response.sale.invoiceNumber
        } - ${t("sales.amount")}: ${calculateTotal().toFixed(2)} ${t(
          "common.currency"
        )}`,
      });
      setCheckoutOpen(false);
      await loadProducts();
      setCart([]);
      if (printInvoice) {
        await printReceipt(data?.customer);
      }
    } catch (error) {
      toast({
        title: t("errors.general"),
        description: t("errors.tryAgain"),
        variant: "destructive",
      });
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const printReceipt = async (customer) => {
    const receiptWindow = window.open("", "_blank");
    const now = new Date();
    const total = calculateTotal();
    
    // Get the current origin to create absolute URLs for the logo
    const origin = window.location.origin;
    const logoUrl = `${origin}/logo.jpeg`;
    
    // Use the actual logo file from public directory
    const finalLogoUrl = logoUrl;

  const receiptHTML = `
  <html>
  <head>
    <title>Facture ProSoin</title>
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
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid #0d6efd;
        padding-bottom: 10mm;
        margin-bottom: 8mm;
      }
      .header img {
        height: 100px; /* Smaller logo for A4 */
        width: 100px;
        border: 1px solid #ddd;
      }
      .store-info {
        text-align: right;
      }
      .store-info h2 {
        color: #0d6efd;
        margin: 0;
        font-size: 20px; /* Smaller title for A4 */
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
          <p><strong>Client :</strong> ${customer?.name || "____________________"}</p>
          <p><strong>Téléphone :</strong> ${customer?.phone || "____________________"}</p>
        </div>
        <div style="text-align:right;">
          <p><strong>Date :</strong> ${now.toLocaleString()}</p>
          <p><strong>N° Facture :</strong></p>
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
          ${cart
            .map(
              (item) => `
            <tr>
              <td>${item.ref || "-"}</td>
              <td style="text-align: left;">${item.name}</td>
              <td>${item.quantity}</td>
              <td class="price-cell">${item.price.toFixed(2)}</td>
              <td class="price-cell">${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" class="total-label">Total TTC</td>
            <td class="total-value price-cell">${total.toFixed(2)} DT</td>
          </tr>
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

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* sales history */}
      <div className="lg:col-span-1 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-blue-800">
            {t("sales.history")}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("sales-invoices")}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Receipt className="w-4 h-4 mr-1" />
            {t("navigation.salesInvoices")}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Barcode Scanner */}
          {/* <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Barcode className="w-5 h-5" />
                {t("sales.searchProducts")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                <Input
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder={t("sales.searchProducts")}
                  className="flex-1 text-center font-mono text-lg"
                  autoFocus
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {t("common.add")}
                </Button>
              </form>
            </CardContent>
          </Card> */}

          {/* Products Grid/List */}
          <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Search className="w-5 h-5" />
                  {t("sales.searchProducts")}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCardView(!isCardView)}
                >
                  {isCardView ? (
                    <List className="w-4 h-4 mr-1" />
                  ) : (
                    <Grid className="w-4 h-4 mr-1" />
                  )}
                  {isCardView ? "List" : "Cards"}
                </Button>
              </div>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("sales.searchProducts")}
                className="mt-2"
              />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div
                    className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full"
                    role="status"
                  >
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              ) : isCardView ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product._id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-blue-100 hover:border-blue-300"
                      onClick={() => addToCart(product)}
                    >
                      <CardContent className="p-4 text-center">
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-1">
                          Ref: {product.ref || product._id}
                        </p>
                        <p className="text-lg font-bold text-blue-600 mb-2">
                          {product.price} {t("common.currency")}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {t("products.stock")}: {product.stock}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-4 py-2 text-left">
                          {t("products.reference")}
                        </th>
                        <th className="px-4 py-2 text-left">
                          {t("products.productName")}
                        </th>
                        <th className="px-4 py-2 text-left">
                          {t("products.price")}
                        </th>
                        <th className="px-4 py-2 text-left">
                          {t("products.stock")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr
                          key={product._id}
                          className="border-t hover:bg-gray-50 cursor-pointer"
                          onClick={() => addToCart(product)}
                        >
                          <td className="px-4 py-2">
                            {product.ref || product._id}
                          </td>
                          <td className="px-4 py-2">{product.name}</td>
                          <td className="px-4 py-2 text-blue-600 font-bold">
                            {product.price} {t("common.currency")}
                          </td>
                          <td className="px-4 py-2">{product.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100 sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Receipt className="w-5 h-5" />
                {t("sales.cart")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  {t("sales.noProducts")}
                </p>
              ) : (
                <>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">
                            {item.name}
                          </h4>
                          <p className="text-sm text-blue-600">
                            {item.price} {t("common.currency")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateQuantity(item._id, item.quantity - 1)
                            }
                            disabled={isLoading}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateQuantity(item._id, item.quantity + 1)
                            }
                            disabled={isLoading}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromCart(item._id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>{t("sales.total")}:</span>
                      <span className="text-blue-600">
                        {calculateTotal().toFixed(2)} {t("common.currency")}
                      </span>
                    </div>

                    <div className="w-full">
                      <Button
                        onClick={handleCheckoutOpen}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 w-full"
                        disabled={isLoading || cart.length === 0}
                      >
                        {t("common.confirm")}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <SalesCheckout
        open={checkoutOpen}
        onConfirm={handleCheckout}
        onClose={() => setCheckoutOpen(false)}
        isLoading={isLoading}
      />
    </div>
  );
};

export default SalesInterface;
