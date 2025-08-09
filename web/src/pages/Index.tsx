import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Package,
  FileText,
  BarChart3,
  Plus,
  Search,
  Calculator,
  Receipt,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import SalesInterface from "@/components/SalesInterface";
import ProductManagement from "@/components/ProductManagement";
import PurchaseInvoices from "@/components/PurchaseInvoices";
import ReportsSection from "@/components/ReportsSection";
import SalesInvoices from "@/components/SalesInvoices";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth-service";
import i18n from "@/i18n";

const Index = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [userProfile, setUserProfile] = useState<any>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const data = await authService.getUserProfile();
        setUserProfile(data.user);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        navigate("/login");
      }
    };
    getCurrentUser();
    
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                <img
                  src="../../public/logo.jpeg"
                  className="w-20 h-16 text-white"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t("header.title")}
                </h1>
                <p className="text-sm text-gray-600">{t("header.subtitle")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 border-green-200"
              >
                {t("common.connected")}
              </Badge> */}
              {/* <Badge
                variant="outline"
                className="text-blue-600 border-blue-200"
              >
                {t("common.mainStore")}
              </Badge> */}
              {
                userProfile ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 border border-gray-300 rounded-md px-2 py-1">
                      {userProfile.first_name + " " + userProfile.last_name}
                    </span>
                  </div> 
                ) : (
                  <span className="text-sm text-gray-700">
                    {t("common.loading")}
                  </span>
                )
              }
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
              >
                {t("common.logout")}
              </Button>
              {/* Language drop down from fr en ar */}
              {/* <div className="relative">
                <select
                  className="bg-white border border-gray-300 rounded-md p-2 text-sm cursor-pointer"
                  value={i18n.language}
                  onChange={(e) => {
                    i18n.changeLanguage(e.target.value);
                  }}
                >
                  <option value="fr" className="cursor-pointer">Français</option>
                  <option value="en" className="cursor-pointer">English</option>
                  <option value="ar" className="cursor-pointer">العربية</option>
                </select>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm border border-blue-100 h-16">
            {/* <TabsTrigger 
              value="reports"
              className="flex-col gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs">{t('navigation.reports')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="invoices"
              className="flex-col gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs">{t('navigation.purchaseInvoices')}</span>
            </TabsTrigger>
            */}
            <TabsTrigger
              value="products"
              className="flex-col gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <Package className="w-5 h-5" />
              <span className="text-xs">{t("navigation.products")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="sales"
              className="flex-col gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-xs">{t("navigation.pos")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="sales-invoices"
              className="flex-col gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <Receipt className="w-5 h-5" />
              <span className="text-xs">{t("navigation.salesInvoices")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="sales" className="m-0">
            <SalesInterface setActiveTab={setActiveTab} />
          </TabsContent>

          <TabsContent value="products" className="m-0">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="sales-invoices" className="m-0">
            <SalesInvoices />
          </TabsContent>

          <TabsContent value="invoices" className="m-0">
            <PurchaseInvoices />
          </TabsContent>

          <TabsContent value="reports" className="m-0">
            <ReportsSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
