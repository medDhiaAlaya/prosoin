
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Barcode, Plus, Minus, Trash2, Printer, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

import { productService, saleService, IProduct } from "@/services";

interface CartItem extends IProduct {
  quantity: number;
}

const SalesInterface = () => {
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
        title: t('errors.loadError'),
        description: t('errors.general'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product: IProduct) => {
    // Check if we have enough stock
    const existingItem = cart.find(item => item._id === product._id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    
    if (currentQuantity + 1 > product.stock) {
      toast({
        title: t('errors.stockError'),
        description: t('errors.insufficientStock'),
        variant: "destructive"
      });
      return;
    }

    if (existingItem) {
      setCart(cart.map(item => 
        item._id === product._id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    toast({
      title: t('sales.productAdded'),
      description: `${product.name} ${t('sales.addToCart')}`,
    });
  };

  const updateQuantity = async (id: string, newQuantity: number) => {
    const item = cart.find(item => item._id === id);
    if (!item) return;

    if (newQuantity <= 0) {
      setCart(cart.filter(item => item._id !== id));
    } else {
      // Check if we have enough stock
      if (newQuantity > item.stock) {
        toast({
          title: t('errors.stockError'),
          description: t('errors.insufficientStock'),
          variant: "destructive"
        });
        return;
      }

      setCart(cart.map(item => 
        item._id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item._id !== id));
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
          title: t('errors.general'),
          description: t('products.noProducts'),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: t('errors.general'),
        description: t('errors.tryAgain'),
        variant: "destructive"
      });
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  type PaymentMethod = "cash" | "card";

const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: t('sales.noProducts'),
        description: t('sales.cart'),
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Prepare sale data
      const saleData: { items: { product: string; quantity: number; price: number; }[]; paymentMethod: PaymentMethod } = {
        items: cart.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        paymentMethod: "cash"
      };

      // Create sale
      const response = await saleService.create(saleData);
      
      toast({
        title: t('sales.saleCompleted'),
        description: `${t('sales.invoiceNumber')}: ${response.sale.invoiceNumber} - ${t('sales.amount')}: ${calculateTotal().toFixed(2)} ${t('common.currency')}`,
      });
      
      // Clear cart and refresh products
      setCart([]);
      await loadProducts();
    } catch (error) {
      toast({
        title: t('errors.general'),
        description: t('errors.tryAgain'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Main Sales Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Barcode Scanner */}
          <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Barcode className="w-5 h-5" />
                {t('sales.searchProducts')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                <Input
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder={t('sales.searchProducts')}
                  className="flex-1 text-center font-mono text-lg"
                  autoFocus
                />
                <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  {t('common.add')}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Search className="w-5 h-5" />
                {t('sales.searchProducts')}
              </CardTitle>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('sales.searchProducts')}
                className="mt-2"
              />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredProducts.map((product) => (
                    <Card 
                      key={product._id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-blue-100 hover:border-blue-300"
                      onClick={() => addToCart(product)}
                    >
                      <CardContent className="p-4 text-center">
                        <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
                        <p className="text-lg font-bold text-blue-600 mb-2">{product.price} {t('common.currency')}</p>
                        <Badge variant="secondary" className="text-xs">
                          {t('products.stock')}: {product.stock}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
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
                {t('sales.cart')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-8">{t('sales.noProducts')}</p>
              ) : (
                <>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{item.name}</h4>
                          <p className="text-sm text-blue-600">{item.price} {t('common.currency')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            disabled={isLoading}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
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
                      <span>{t('sales.total')}:</span>
                      <span className="text-blue-600">{calculateTotal().toFixed(2)} {t('common.currency')}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        className="border-blue-200 hover:bg-blue-50"
                        disabled={isLoading || cart.length === 0}
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        {t('sales.printReceipt')}
                      </Button>
                      <Button 
                        onClick={handleCheckout}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        disabled={isLoading || cart.length === 0}
                      >
                        {t('sales.checkout')}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalesInterface;
