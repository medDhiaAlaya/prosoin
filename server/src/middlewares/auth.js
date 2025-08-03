import jwt from "jsonwebtoken";
import createToken from "../helpers/create_token.js";

const Auth = {
  verifyToken: (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    const token = authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "expired token" });
        } else {
          return res.status(401).json({ message: "invalid token" });
        }
      }
      req.user = {
        userId: decoded.userId || "",
        role: decoded.role || "",
        token: token || "",
      };
      next();
    });
  },

  checkToken: (req, res, next) => {
    const authorization = req.headers.authorization;
    if (authorization) {
      const token = authorization.split(" ")[1];
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (!err) {
          req.user = {
            userId: decoded.userId || "",
            role: decoded.role || "",
            token: token || "",
          };
        }
      });
    }
    next();
  },

  refreshToken: (req, res, next) => {
    try {
      const authorization = req.headers.authorization;
      if (!authorization) {
        return res.status(401).json({ message: "Unauthorized!" });
      }
      const refresh_token = authorization.split(" ")[1];
      jwt.verify(refresh_token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            const token = createToken(decoded.userId, decoded.role);
            return res.status(200).json({ message: "Success!", token });
          } else {
            return res
              .status(401)
              .json({ message: "Invalid token! Please login again!" });
          }
        }
        return res.status(200).json({ message: "Success!", refresh_token });
      });
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Unauthorized! Please login again!" });
    }
  },

  verifyAdmin: async (req, res, next) => {
    const { role } = req.user;
    if (role !== "ADMIN") {
      return res
        .status(401)
        .json({ message: "Please check your login information!" });
    }
    next();
  },

  verifyClient: async (req, res, next) => {
    const { role } = req.user;
    if (role !== "CLIENT" && role !== "ADMIN") {
      return res
        .status(401)
        .json({ message: "Please check your login information!" });
    }
    next();
  },
  verifyTechnicien: async (req, res, next) => {
    const { role } = req.user;
    if (role !== "TECHNICIEN" && role !== "ADMIN") {
      return res
        .status(401)
        .json({ message: "Please check your login information!" });
    }
    next();
  },

  localVariables: (req, res, next) => {
    req.app.locals = {
      OTP: null,
      sessionId: null,
    };
    next();
  },
};

export default Auth;
