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
  const [isCardView, setIsCardView] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
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
  };

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

  const handleCheckout = async (data) => {
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

      await loadProducts();
      setCart([]);
      setCheckoutOpen(false);
    } catch (error) {
      toast({
        title: t("errors.general"),
        description: t("errors.tryAgain"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const printReceipt = (customer) => {
    const receiptWindow = window.open("", "_blank", "width=400,height=600");
    const now = new Date();
    const total = calculateTotal();

    const receiptHTML = `
<html>
<head>
  <title>Facture ProSoin</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background: #f0f2f5;
      padding: 30px;
      max-width: 900px;
      margin: auto;
      position: relative;
    }

    /* Watermark */
    body::before {
      content: "";
      position: fixed;
      top: 30%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: url('${window.location.origin}/logo.jpeg') no-repeat center;
      background-size: 300px;
      opacity: 0.05;
      width: 600px;
      height: 600px;
      z-index: 0;
    }

    .invoice-container {
      background: white;
      padding: 25px 30px;
      border-radius: 8px;
      box-shadow: 0 0 15px rgba(0,0,0,0.1);
      position: relative;
      z-index: 1;
    }

    /* Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3px solid #0d6efd;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header img {
      height: 70px;
    }
    .store-info {
      text-align: right;
    }
    .store-info h2 {
      color: #0d6efd;
      margin: 0;
      font-size: 26px;
    }
    .store-info p {
      margin: 2px 0;
      font-size: 12px;
      color: #555;
    }

    /* Client & Invoice Info */
    .info-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      font-size: 14px;
      background: #f8f9fa;
      padding: 12px 15px;
      border-radius: 6px;
    }
    .info-section div {
      width: 48%;
    }

    /* Enhanced Table Styling */
    .invoice-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 20px 0;
      font-size: 14px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    .invoice-table thead th {
      background-color: #0d6efd;
      color: white;
      padding: 12px 10px;
      text-align: center;
      font-weight: 600;
      border: none;
      position: sticky;
      top: 0;
    }
    
    .invoice-table tbody td {
      padding: 10px;
      border-bottom: 1px solid #e0e0e0;
      text-align: center;
      vertical-align: middle;
    }
    
    .invoice-table tbody tr:last-child td {
      border-bottom: none;
    }
    
    .invoice-table tbody tr:hover {
      background-color: #f8f9fa;
    }
    
    .invoice-table tfoot td {
      padding: 12px 10px;
      font-weight: bold;
      background: #f8f9fa;
      border-top: 2px solid #0d6efd;
      border-bottom: none;
    }
    
    .invoice-table .total-label {
      text-align: right;
      padding-right: 15px;
    }
    
    .invoice-table .total-value {
      font-size: 15px;
      color: #0d6efd;
    }
    
    .price-cell {
      font-family: 'Courier New', monospace;
      font-weight: 500;
    }
    
    .invoice-table tbody tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    /* Signatures */
    .signature-container {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
    }
    .signature-box {
      width: 220px;
      height: 80px;
      border: 1px dashed #ccc;
      border-radius: 4px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #666;
      background: #f8f9fa;
    }

    /* Footer */
    .footer {
      margin-top: 40px;
      border-top: 3px solid #0d6efd;
      padding-top: 15px;
      display: flex;
      justify-content: space-around;
      font-size: 12px;
      color: #555;
      background: #f8f9fa;
      padding: 12px;
      border-radius: 6px;
    }
    .footer div {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    /* Print Specific Styles */
    @media print {
      body {
        background: none;
        padding: 0;
      }
      .invoice-container {
        box-shadow: none;
        border: none;
        padding: 0;
      }
      body::before {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">

    <!-- Header -->
    <div class="header">
      <img src="${window.location.origin}/logo.jpeg" alt="ProSoin Logo"/>
      <div class="store-info">
        <h2>ProSoin</h2>
        <p>Santé et Bien-être</p>
        <p>Gabès, Tunisie</p>
      </div>
    </div>

    <!-- Info Section -->
    <div class="info-section">
      <div>
        <p><strong>Client :</strong> ${
          customer && customer.name
            ? customer.name
            : "____________________"
        }</p>
        <p><strong>Téléphone :</strong> ${
          customer && customer.phone
            ? customer.phone
            : "____________________"
        }</p>
      </div>
      <div style="text-align:right;">
        <p><strong>Date :</strong> ${now.toLocaleString()}</p>
        <p><strong>N° Facture :</strong> ####</p>
      </div>
    </div>

    <!-- Product Table -->
    <table class="invoice-table">
      <thead>
        <tr>
          <th style="border-radius: 4px 0 0 0;">Réf</th>
          <th>Article</th>
          <th>Qté</th>
          <th>Prix (DT)</th>
          <th style="border-radius: 0 4px 0 0;">Total (DT)</th>
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
            <td class="price-cell">${(item.price * item.quantity).toFixed(
              2
            )}</td>
          </tr>
        `
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
    window.print();
    window.close();
  </script>
</body>
</html>
`;

    receiptWindow?.document.write(receiptHTML);
    receiptWindow?.document.close();
  };

  const handlePrint = (customer) => {
    printReceipt(customer);
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
        printReceipt={handlePrint}
      />
    </div>
  );
};

export default SalesInterface;
