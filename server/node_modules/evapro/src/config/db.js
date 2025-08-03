import mongoose from "mongoose";
import UserModel from "../models/User.model.js";
import bcrypt from 'bcrypt'

const connection = () => {
  mongoose.connect(process.env.DB_URL);

  const connection = mongoose.connection;

  connection.once("connected", () => {
    console.log("Database connected successfully.");
  });

  connection.on("error", (err) => {
    console.error("Error while connecting to database.", err);
  });

  addAdmin()
};

async function addAdmin() {
  try {
    const user = await UserModel.findOne({ role: "ADMIN" });

    if (user) {
      console.log("L'administrateur existe déjà");
    } else {
      const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=admin`;

      const newUser = new UserModel({
        first_name: "admin",
        last_name: "admin",
        email: "admin@gmail.com",
        password:"12345678",
        phone: "123456",
        gender: "male",
        zip: 1234,
        address: '123 ttt',
        city: 'gabes',
        role: "ADMIN",
        photo: boyProfilePic
      });

      const admin = await newUser.save();
      if (!admin) {
        console.log("Erreur lors de l'enregistrement de l'administrateur");
      } else {
        console.log("L'administrateur a été enregistré avec succès !");
      }
    }
  } catch (err) {
    console.log(`Impossible d'ajouter l'administrateur à la base de données ! Erreur : ${err}`);
  }
}

export default connection;
