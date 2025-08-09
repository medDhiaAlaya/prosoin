import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Package, Plus, Search, Edit, Trash2, Barcode, Download, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { productService, IProduct } from "@/services";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

interface FormData {
  name: string;
  price: string;
  stock: string;
  barcode: string;
  ref: string;
}

const ProductManagement = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isCardView, setIsCardView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    price: "",
    stock: "",
    barcode: "",
    ref: "",
  });

  const { toast } = useToast();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [productsResponse] = await Promise.all([productService.getAll()]);
      setProducts(productsResponse.products);
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

  const generateBarcode = () => {
    const barcode = Math.floor(Math.random() * 1000000000)
      .toString()
      .padStart(9, "0");
    setFormData({ ...formData, barcode });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast({
        title: t("errors.validationError"),
        description: t("products.fillAllFields"),
        variant: "destructive",
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
        ref: formData.ref || "",
      };

      if (editingProduct) {
        await productService.update(editingProduct._id, productData);
        toast({
          title: t("products.productUpdated"),
          description: `${productData.name} ${t("messages.operationSuccessful")}`,
        });
      } else {
        await productService.create(productData);
        toast({
          title: t("products.productAdded"),
          description: `${productData.name} ${t("messages.operationSuccessful")}`,
        });
      }

      await loadData();
      setIsDialogOpen(false);
      setEditingProduct(null);
      setFormData({ name: "", price: "", stock: "", barcode: "", ref: "" });
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

  const handleEdit = (product: IProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      barcode: product.barcode || "",
      ref: product.ref || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      await productService.delete(id);
      await loadData();
      toast({
        title: t("products.productDeleted"),
        description: t("messages.operationSuccessful"),
      });
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

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Liste des Produits - ProSoin", 14, 10);

    const tableData = products.map((p) => [
      p.name,
      p.ref || "-",
      p.price.toFixed(2) + " DT",
      p.stock,
      p.barcode || "-",
    ]);

    autoTable(doc, {
      head: [["Nom", "Réf", "Prix (DT)", "Stock", "Code-barres"]],
      body: tableData,
    });

    doc.save("Produits_ProSoin.pdf");
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const importedProducts = results.data as any[];
        for (let p of importedProducts) {
          if (p.name && p.price) {
            await productService.create({
              name: p.name,
              price: parseFloat(p.price),
              stock: parseInt(p.stock || "0"),
              barcode: p.barcode || "",
              ref: p.ref || "",
            });
          }
        }
        toast({
          title: "Import terminé",
          description: `${importedProducts.length} produits ajoutés.`,
        });
        loadData();
      },
    });
  };

  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.barcode?.toLowerCase().includes(searchLower) ||
      product.ref?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-blue-800">{t("products.title")}</h2>

        <div className="flex gap-2">
          {/* Add Product Button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                onClick={() => {
                  setEditingProduct(null);
                  setFormData({ name: "", price: "", stock: "", barcode: "", ref: "" });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("products.addProduct")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? t("products.editProduct") : t("products.addProduct")}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="ref" className="text-right">Ref *</Label>
                  <Input
                    id="ref"
                    value={formData.ref}
                    onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
                    placeholder="Entrer la reférence de produit"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name" className="text-right">
                    {t("products.productName")} *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t("products.productNamePlaceholder")}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price" className="text-right">
                    {t("products.price")} *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder={t("products.pricePlaceholder")}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock" className="text-right">{t("products.stock")}</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder={t("products.stockPlaceholder")}
                  />
                </div>
                <div>
                  <Label htmlFor="barcode" className="text-right">{t("products.barcode")}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="barcode"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      placeholder={t("products.barcodePlaceholder")}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={generateBarcode}>
                      <Barcode className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500">
                    {editingProduct ? t("common.edit") : t("common.add")}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {t("common.cancel")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Export / Import Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" /> Export / Import
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <CSVLink
                  filename="Produits_ProSoin.csv"
                  data={products.map((p) => ({
                    name: p.name,
                    ref: p.ref,
                    price: p.price,
                    stock: p.stock,
                    barcode: p.barcode,
                  }))}
                  className="flex items-center gap-2 w-full"
                >
                  <FileText className="w-4 h-4" /> Export CSV
                </CSVLink>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportPDF} className="flex items-center gap-2">
                <FileText className="w-4 h-4" /> Export PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> Import CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hidden File Input for Import */}
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImportCSV}
          />
        </div>
      </div>

      {/* Search & Toggle */}
      <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("common.search")}
              className="pr-10"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredProducts.length} {t("products.itemsFound")}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsCardView(!isCardView)}>
              {isCardView ? "Cards" : "List"}
            </Button>
          </div>
        </CardContent>
      </Card>


      {/* Products */}
      {isCardView ? (
        // Card View
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
                  <CardTitle className="text-lg text-gray-600">ref : {product.ref}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t("products.price")}:</span>
                  <span className="font-bold text-blue-600">{product.price} {t("common.currency")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t("products.stock")}:</span>
                  <Badge variant={product.stock > 10 ? "default" : "destructive"}>
                    {product.stock}
                  </Badge>
                </div>
                {product.barcode && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t("products.barcode")}:</span>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{product.barcode}</span>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(product)} className="flex-1">
                    <Edit className="w-3 h-3 mr-1" /> {t("common.edit")}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(product._id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // List View
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full bg-white/80 backdrop-blur-sm border-blue-100">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-2 text-left">{t("products.productName")}</th>
                <th className="px-4 py-2 text-left">Ref</th>
                <th className="px-4 py-2 text-left">{t("products.price")}</th>
                <th className="px-4 py-2 text-left">{t("products.stock")}</th>
                <th className="px-4 py-2 text-left">{t("products.barcode")}</th>
                <th className="px-4 py-2 text-left">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6">Loading...</td>
                </tr>
              ) : filteredProducts.map((product) => (
                <tr key={product._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">{product.ref}</td>
                  <td className="px-4 py-2 font-bold text-blue-600">{product.price} {t("common.currency")}</td>
                  <td className="px-4 py-2">
                    <Badge variant={product.stock > 10 ? "default" : "destructive"}>
                      {product.stock}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">{product.barcode || "-"}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                      <Edit className="w-3 h-3 mr-1" /> {t("common.edit")}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(product._id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredProducts.length === 0 && (
        <Card className="bg-white/60 backdrop-blur-sm border-blue-100">
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t("products.noProducts")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductManagement;
