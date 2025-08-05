import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import connection from "./src/config/db.js";
import handleErrors from "./src/helpers/error_handler.js";
import userRoutes from "./src/routes/user.routes.js";
import productRoutes from "./src/routes/product.routes.js";
import categoryRoutes from "./src/routes/category.routes.js";
import saleRoutes from "./src/routes/sale.routes.js";
import purchaseRoutes from "./src/routes/purchase.routes.js";


dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Middlewares
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      frameAncestors: ["*"],
    },
  })
);
app.use(morgan("common"));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/sales", saleRoutes);
app.use("/api/v1/purchases", purchaseRoutes);
app.use("/uploads", express.static("uploads"));

app.use(handleErrors);
app.use((_, res) => res.status(404).json({ message: "Url not found!" }));

connection();

const server = app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});

