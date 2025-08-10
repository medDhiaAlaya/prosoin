import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { customerService } from "@/services";
import {
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { ArrowDown, Printer } from "lucide-react";

const SalesCheckout = ({
  open,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const [customers, setCustomers] = useState([]);
  const [mode, setMode] = useState("walkin");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState(0);

  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (open) {
      fetchCustomers();
    }
  }, [open]);

  const fetchCustomers = async () => {
    try {
      const res = await customerService.getBySeller();
      setCustomers(res.customers);
    } catch (error) {
      toast({
        title: t("errors.general"),
        description: t("errors.tryAgain"),
        variant: "destructive",
      });
    }
  };

  const handleSubmit = () => {
    let customerData = null;

    if (mode === "existing") {
      if (!selectedCustomer) {
        toast({
          title: t("errors.missingInfo"),
          description: t("sales.selectCustomer"),
          variant: "destructive",
        });
        return;
      }
      customerData = { customerId: selectedCustomer };
    } else if (mode === "new") {
      const { name, email, phone } = newCustomer;
      if (!name.trim()) {
        toast({
          title: t("errors.missingInfo"),
          description: t("sales.nameRequired"),
          variant: "destructive",
        });
        return;
      }
      customerData = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };
    }

    onConfirm({
      ...customerData,
      paymentMethod,
      discount,
    }, false);
  };


  const handleModeChange = (value) => {
    setMode(value);
    setSelectedCustomer("");
    setNewCustomer({ name: "", email: "", phone: "" });
  }

  const getSelectedCustomer = () => {
    if (mode === "walkin") return null;
    if (mode === "existing" && selectedCustomer) {
      return customers.find((c) => c._id === selectedCustomer);
    }
    if (mode === "new") {
      return {
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
      };
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("sales.checkout")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Label>{t("sales.customerType")}</Label>
          <div className="border border-gray-200 rounded-md p-2 mb-4 flex items-center gap-2">
            <Select value={mode} onValueChange={handleModeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("sales.customerType")} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                <SelectItem value="existing">
                  {t("sales.existingCustomer")}
                </SelectItem>
                <SelectItem value="new">{t("sales.newCustomer")}</SelectItem>
                <SelectItem value="walkin">
                  {t("sales.walkInCustomer")}
                </SelectItem>
              </SelectContent>
            </Select>
            <ArrowDown className="w-4 h-4 text-gray-500" />
          </div>
          {mode === "existing" && (
            <div>
              <Label>{t("sales.selectCustomer")}</Label>
              <div className="border border-gray-200 rounded-md p-2 flex items-center gap-2">
                <Select
                  value={selectedCustomer}
                  onValueChange={setSelectedCustomer}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("sales.selectCustomer")} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200">
                    {customers.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name} - {c.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ArrowDown className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          )}

          {mode === "new" && (
            <div className="grid gap-2">
              <div>
                <Label>{t("sales.customerName")}</Label>
                <Input
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>{t("sales.customerEmail")}</Label>
                <Input
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>{t("sales.customerPhone")}</Label>
                <Input
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <div>
            <Label>{t("sales.paymentMethod")}</Label>
            <div className="border border-gray-200 rounded-md p-2 mb-4 flex items-center gap-2">
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("sales.paymentMethod")} />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200">
                  <SelectItem value="cash">{t("sales.cash")}</SelectItem>
                  <SelectItem value="card">{t("sales.card")}</SelectItem>
                </SelectContent>
              </Select>
              <ArrowDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>

          <div>
            <Label>{t("sales.discount")}</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value || "0"))}
            />
          </div>
        </div>

        {/* if exising client : show sales number */}
        {selectedCustomer && (
          <div className="mt-4">
            <Label>{t("sales.customerSales")}</Label>
            <p className="text-sm text-gray-600">
              -{t("sales.customerSalesNumber")}
              {": "}
              {customers.find((c) => c._id === selectedCustomer)?.sales
                ?.length || 0}
            </p>
          </div>
        )}

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="outline"
            className="border-blue-200 hover:bg-blue-50"
            onClick={() => onConfirm(getSelectedCustomer(), true)}
            disabled={isLoading}
          >
            <Printer className="w-4 h-4 mr-2" />
            {t("sales.printReceipt")}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {t("sales.confirmCheckout")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SalesCheckout;
