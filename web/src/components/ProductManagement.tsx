
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Search, Edit, Trash2, Barcode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import CategoryManagement from "./CategoryManagement";
import { productService, categoryService, IProduct, ICategory } from "@/services";

interface FormData {
  name: string;
  price: string;
  stock: string;
  barcode: string;
  category: string;
}

const ProductManagement = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    price: "",
    stock: "",
    barcode: "",
    category: ""
  });
  
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [categoriesResponse, productsResponse] = await Promise.all([
        categoryService.getAll(),
        productService.getAll()
      ]);
      setCategories(categoriesResponse.categories);
      setProducts(productsResponse.products);
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

  const generateBarcode = () => {
    const barcode = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    setFormData({ ...formData, barcode });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast({
        title: t('errors.validationError'),
        description: t('products.fillAllFields'),
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        barcode: formData.barcode || "",
        category: formData.category || ""
      };

      if (editingProduct) {
        await productService.update(editingProduct._id, productData);
        toast({
          title: t('products.productUpdated'),
          description: `${productData.name} ${t('messages.operationSuccessful')}`,
        });
      } else {
        await productService.create(productData);
        toast({
          title: t('products.productAdded'),
          description: `${productData.name} ${t('messages.operationSuccessful')}`,
        });
      }

      await loadData(); // Refresh the list
      setIsDialogOpen(false);
      setEditingProduct(null);
      setFormData({ name: "", price: "", stock: "", barcode: "", category: "" });
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

  const handleEdit = (product: IProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      barcode: product.barcode || "",
      category: product.category || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      await productService.delete(id);
      await loadData(); // Refresh the list
      toast({
        title: t('products.productDeleted'),
        description: t('messages.operationSuccessful'),
      });
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

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      product.name.toLowerCase().includes(searchLower) ||
      product.barcode?.toLowerCase().includes(searchLower) ||
      getCategory(product.category)?.name.toLowerCase().includes(searchLower);
    
    if (selectedCategory) {
      return matchesSearch && product.category === selectedCategory;
    }
    
    return matchesSearch;
  });

  const getCategory = (categoryId: string) => {
    return categories.find(c => c._id === categoryId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-blue-800">{t('products.title')}</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              onClick={() => {
                setEditingProduct(null);
                setFormData({ name: "", price: "", stock: "", barcode: "", category: "" });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('products.addProduct')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? t('products.editProduct') : t('products.addProduct')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-right">{t('products.productName')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('products.productNamePlaceholder')}
                  required
                />
              </div>
              <div>
                <Label htmlFor="price" className="text-right">{t('products.price')} *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder={t('products.pricePlaceholder')}
                  required
                />
              </div>
              <div>
                <Label htmlFor="stock" className="text-right">{t('products.stock')}</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder={t('products.stockPlaceholder')}
                />
              </div>
              <div>
                <Label htmlFor="barcode" className="text-right">{t('products.barcode')}</Label>
                <div className="flex gap-2">
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder={t('products.barcodePlaceholder')}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={generateBarcode}>
                    <Barcode className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="category" className="text-right mb-2 block">{t('products.category')}</Label>
                <Select 
                  value={formData.category || "none"} 
                  onValueChange={(value) => setFormData({ ...formData, category: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('products.categoryPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t('products.noCategory')}
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500">
                  {editingProduct ? t('common.edit') : t('common.add')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Management */}
      <CategoryManagement 
        onCategoriesUpdate={setCategories}
      />

      {/* Search */}
      <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('common.search')}
              className="pr-10"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <Label className="text-sm text-gray-500">{t('products.filterByCategory')}:</Label>
            <Select 
              value={selectedCategory || "all"} 
              onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('products.allCategories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('products.allCategories')}
                </SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedCategory && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedCategory("")}
                className="text-gray-500 hover:text-gray-700"
              >
                {t('common.clear')}
              </Button>
            )}
          </div>

          {/* Search results count */}
          <div className="text-sm text-gray-500">
            {filteredProducts.length} {t('products.itemsFound')}
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : filteredProducts.map((product) => (
          <Card key={product._id} className="bg-white/80 backdrop-blur-sm border-blue-100 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-gray-800">{product.name}</CardTitle>
                {product.category && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs text-white border-0"
                    style={{ backgroundColor: getCategory(product.category)?.color || "#6B7280" }}
                  >
                    {getCategory(product.category)?.name || ""}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t('products.price')}:</span>
                <span className="font-bold text-blue-600">{product.price} {t('common.currency')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t('products.stock')}:</span>
                <Badge variant={product.stock > 10 ? "default" : "destructive"}>
                  {product.stock}
                </Badge>
              </div>
              {product.barcode && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('products.barcode')}:</span>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    {product.barcode}
                  </span>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(product)}
                  className="flex-1"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  {t('common.edit')}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(product._id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('products.noProducts')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductManagement;
