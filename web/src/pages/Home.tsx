"use client"

import { useState, useEffect } from "react"
import { MapPin, Truck, Wrench, Phone, Star, Shield, Clock, Menu, X, Package, Users } from "lucide-react"
import logo from "@/assets/logo.jpeg"
import heroImage from "@/assets/back2.jpg"

export default function ProSoinEnhanced() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("home")

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      setScrolled(offset > 50)

      const sections = ["home", "services", "produits", "temoignages", "localisation", "contact"]
      const current = sections.find((section) => {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          return rect.top <= 100 && rect.bottom >= 100
        }
        return false
      })
      if (current) setActiveSection(current)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "#home", label: "Accueil" },
    { href: "#services", label: "Services" },
    { href: "#produits", label: "Produits" },
    { href: "#temoignages", label: "Témoignages" },
    { href: "#localisation", label: "Localisation" },
    { href: "#contact", label: "Contact" },
  ]

  const services = [
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Livraison Express",
      desc: "Livraison rapide et sécurisée directement à votre domicile ou établissement médical.",
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: "Installation Expert",
      desc: "Nos techniciens certifiés assurent l'installation et la configuration complète.",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Maintenance Premium",
      desc: "Service après-vente réactif avec garantie étendue pour votre tranquillité.",
    },
  ]

  const products = [
    {
      image: "https://img.medicalexpo.fr/images_me/photo-g/84783-13351253.webp",
      title: "Fauteuil Roulant Premium",
      desc: "Conception ergonomique de haute qualité pour un confort optimal au quotidien.",
      features: ["Réglable", "Léger", "Pliable"],
      rating: 4.9,
    },
    {
      image: "https://m.media-amazon.com/images/I/61ajuUCMhPL._UF1000,1000_QL80_.jpg",
      title: "Lit Médicalisé Électrique",
      desc: "Technologie avancée avec télécommande pour un positionnement précis et sécurisé.",
      features: ["Électrique", "Télécommande", "Sécurisé"],
      rating: 4.8,
    },
    {
      image:
        "https://www.univers-medical.com/resize/1140x660/media/news/img/normal/les-differents-types-de-rollaotr-2.jpg",
      title: "Déambulateur Intelligent",
      desc: "Design moderne avec système de freinage avancé pour une mobilité en toute sécurité.",
      features: ["Anti-chute", "Ergonomique", "Stable"],
      rating: 4.7,
    },
    
    
  ]

  const testimonials = [
    {
      name: "Dr. Amira Ben Salem",
      role: "Médecin Gériatre",
      text: "Service exceptionnel et matériel de qualité supérieure. Je recommande vivement ProSoin pour tous les équipements médicaux.",
      rating: 5,
    },
    {
      name: "Mohamed Trabelsi",
      role: "Patient",
      text: "Installation rapide et professionnelle. L'équipe est très compétente et à l'écoute de nos besoins spécifiques.",
      rating: 5,
    },
    {
      name: "Fatma Khelifi",
      role: "Infirmière",
      text: "Matériel fiable et service après-vente remarquable. ProSoin est notre partenaire de confiance depuis 3 ans.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled ? "bg-white shadow-lg border-b border-blue-200" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 animate-fade-in">
              <img
                src={logo || "/placeholder.svg"}
                alt="Logo ProSoin"
                className="w-10 h-10 rounded-xl object-cover shadow-lg transform hover:scale-110 transition-transform duration-300"
              />
              <div className="hidden sm:block">
                <h1 className={`text-xl font-bold ${scrolled ? "text-blue-900" : "text-white"} transition-colors`}>
                  ProSoin
                </h1>
                <p className={`text-xs ${scrolled ? "text-blue-600" : "text-white/80"} transition-colors`}>
                  Matériel médical premium
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    activeSection === link.href.slice(1)
                      ? scrolled
                        ? "text-green-600"
                        : "text-green-300"
                      : scrolled
                        ? "text-blue-700 hover:text-green-600"
                        : "text-white/90 hover:text-green-300"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {link.label}
                  {activeSection === link.href.slice(1) && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-green-500 rounded-full animate-pulse" />
                  )}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <a
                href="tel:57183366"
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
              >
                <Phone className="w-4 h-4 animate-pulse" />
                <span>57 183 366</span>
              </a>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                scrolled ? "text-blue-900 hover:bg-blue-100" : "text-white hover:bg-white/10"
              }`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {isOpen && (
            <div className="md:hidden bg-white shadow-lg border-t border-blue-200 animate-slide-down">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navLinks.map((link, index) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-blue-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-all duration-300 transform hover:translate-x-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href="tel:57183366"
                  className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg font-medium mt-4 mx-3 transform hover:scale-105 transition-all duration-300"
                >
                  <Phone className="w-4 h-4" />
                  <span>Appelez maintenant</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-blue-800/70" />
        </div>

        <div className="absolute inset-0">
          <div
            className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl animate-bounce"
            style={{ animationDuration: "3s" }}
          />
          <div
            className="absolute bottom-32 right-16 w-48 h-48 bg-green-400/10 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "1s", animationDuration: "4s" }}
          />
          <div
            className="absolute top-1/2 left-1/4 w-24 h-24 bg-green-300/10 rounded-full blur-xl animate-ping"
            style={{ animationDelay: "2s", animationDuration: "5s" }}
          />
          <div
            className="absolute top-1/4 right-1/3 w-16 h-16 bg-white/10 rounded-full blur-lg animate-pulse"
            style={{ animationDelay: "3s" }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 animate-fade-in-up">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm font-medium">Disponible 24h/7j pour vos urgences</span>
            </div>

            

            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up"
              style={{ animationDelay: "400ms" }}
            >
              Votre santé,
              <span className="block text-green-400 animate-pulse">notre priorité</span>
            </h1>

            <p
              className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl animate-fade-in-up"
              style={{ animationDelay: "600ms" }}
            >
              Vente et location d'équipements médicaux et paramédicaux essentiels .
            </p>

            <div
              className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12 animate-fade-in-up"
              style={{ animationDelay: "800ms" }}
            >
              <a
                href="#produits"
                className="group inline-flex items-center space-x-2 bg-white text-blue-700 px-8 py-4 rounded-full font-semibold hover:bg-green-50 hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                <span>Découvrir nos produits</span>
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-all duration-300 group-hover:rotate-90">
                  <div className="w-2 h-2 border-r-2 border-b-2 border-blue-700 rotate-45 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </a>
              <a
                href="#services"
                className="inline-flex items-center space-x-2 text-white border-2 border-white/30 hover:border-white hover:bg-white/10 px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
              >
                <span>Nos services</span>
              </a>
            </div>

            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in-up"
              style={{ animationDelay: "1000ms" }}
            >
              {[
                { number: "500+", label: "Clients satisfaits" },
                { number: "24h", label: "Support disponible" },
                { number: "99%", label: "Satisfaction client" },
                { number: "5★", label: "Note moyenne" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center transform hover:scale-110 transition-transform duration-300"
                  style={{ animationDelay: `${1200 + index * 100}ms` }}
                >
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1 animate-pulse">{stat.number}</div>
                  <div className="text-white/70 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Services Premium Inclus</h2>
            <p className="text-xl text-blue-700 max-w-3xl mx-auto">
              Nous vous accompagnons à chaque étape avec des services de qualité supérieure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 border border-blue-100 transform hover:scale-105 hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="inline-flex p-4 rounded-2xl bg-blue-600 text-white mb-6 group-hover:bg-green-600 transition-all duration-300 transform group-hover:rotate-12 group-hover:scale-110">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-4 group-hover:text-green-600 transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-blue-700 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="produits" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-4 animate-bounce">
              <Package className="w-5 h-5 text-blue-600" />
              <span className="text-blue-600 font-medium">Nos Produits</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Nos Équipements Premium</h2>
            <p className="text-xl text-blue-700 max-w-3xl mx-auto">
              Matériel médical certifié et testé pour votre sécurité et confort
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:scale-105 hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="h-64 relative overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center space-x-1 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    <Star className="w-4 h-4 text-yellow-400 fill-current animate-pulse" />
                    <span className="text-sm font-medium text-blue-700">{product.rating}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-blue-900 mb-3 group-hover:text-green-600 transition-colors duration-300">
                    {product.title}
                  </h3>
                  <p className="text-blue-700 mb-4 leading-relaxed">{product.desc}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium transform hover:scale-105 transition-transform duration-300"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                    En savoir plus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="temoignages" className="py-24 bg-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2 mb-4 animate-pulse">
              <Users className="w-5 h-5 text-green-300" />
              <span className="text-green-300 font-medium">Témoignages</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ce que disent nos clients</h2>
            <p className="text-xl text-green-200 max-w-3xl mx-auto">
              Témoignages authentiques de professionnels de santé et patients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 animate-fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current animate-pulse"
                      style={{ animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>
                <p className="text-white text-lg mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-green-200">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="localisation" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-4 animate-bounce">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="text-blue-600 font-medium">Localisation</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Notre Localisation</h2>
            <p className="text-xl text-blue-700">Visitez notre showroom à Ghannouch, Gabès</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100 mb-8 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-start space-x-4 mb-6 animate-slide-in-left">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Adresse</h3>
                    <p className="text-blue-700">Rue Habib Bourguiba, Ghannouch, Gabès, Tunisie</p>
                  </div>
                </div>

                <div
                  className="flex items-start space-x-4 mb-6 animate-slide-in-left"
                  style={{ animationDelay: "200ms" }}
                >
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Horaires</h3>
                    <p className="text-blue-700">Lundi - Samedi: 8h00 - 18h00</p>
                    <p className="text-blue-700">Dimanche: Sur rendez-vous</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 animate-slide-in-left" style={{ animationDelay: "400ms" }}>
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                    <Phone className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Contact</h3>
                    <p className="text-blue-700">Téléphone: 57 183 366</p>
                    <p className="text-blue-700">Email: contact@prosoin.tn</p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-all duration-500 animate-fade-in-up"
              style={{ animationDelay: "600ms" }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1137.002776554781!2d10.058039722516316!3d33.936921764904945!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12557bc6d827e165%3A0x18283939d51e7621!2sProsoin!5e0!3m2!1sen!2stn!4v1755984441394!5m2!1sen!2stn"
                className="w-full h-96"
                allowFullScreen
                loading="lazy"
                title="ProSoin Location"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 bg-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Besoin d'aide ? Contactez-nous</h2>
            <p className="text-xl text-green-200 mb-12">
              Notre équipe d'experts est disponible pour répondre à vos questions et vous accompagner
            </p>

            <div className="flex justify-center">
              <a
                href="tel:57183366"
                className="group inline-flex items-center space-x-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 animate-pulse"
              >
                <Phone className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                <span>Appelez maintenant - 57 183 366</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-blue-900 border-t border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between animate-fade-in-up">
            <div className="flex items-center space-x-3 mb-4 md:mb-0 transform hover:scale-105 transition-transform duration-300">
              <img
                src={logo || "/placeholder.svg"}
                alt="Logo ProSoin"
                className="w-8 h-8 rounded-lg object-cover animate-pulse"
              />
              <div>
                <p className="text-white font-semibold">ProSoin</p>
                <p className="text-green-200 text-sm">Prendre soin de vous, notre priorité</p>
              </div>
            </div>
            <p className="text-green-200 text-sm">© 2025 ProSoin. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out forwards;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in-up 1s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
