import React, { useState, useEffect } from "react"
import { MapPin, Truck, Wrench, Phone, Star, Heart, Shield, Clock, Menu, X } from "lucide-react"
import logo from "@/assets/logo.jpeg"
// For demo purposes, using placeholder images since the actual product images may not load
import heroImage from "@/assets/back2.jpg"
// Using placeholder images for products to ensure they display
const product1 = "https://img.medicalexpo.fr/images_me/photo-g/84783-13351253.webp"
const product2 = "https://m.media-amazon.com/images/I/61ajuUCMhPL._UF1000,1000_QL80_.jpg"
const product3 = "https://www.univers-medical.com/resize/1140x660/media/news/img/normal/les-differents-types-de-rollaotr-2.jpg"

export default function ProSoinEnhanced() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      setScrolled(offset > 50)

      // Update active section based on scroll position
      const sections = ['home', 'services', 'produits', 'localisation', 'contact']
      const current = sections.find(section => {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          return rect.top <= 100 && rect.bottom >= 100
        }
        return false
      })
      if (current) setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: "#home", label: "Accueil" },
    { href: "#services", label: "Services" },
    { href: "#produits", label: "Produits" },
    { href: "#localisation", label: "Localisation" },
    { href: "#contact", label: "Contact" },
  ]

  const services = [
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Livraison Express",
      desc: "Livraison rapide et sécurisée directement à votre domicile ou établissement médical.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: "Installation Expert",
      desc: "Nos techniciens certifiés assurent l'installation et la configuration complète.",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Maintenance Premium",
      desc: "Service après-vente réactif avec garantie étendue pour votre tranquillité.",
      gradient: "from-purple-500 to-pink-500"
    },
  ]

  const products = [
    {
      image: product1,
      title: "Fauteuil Roulant Premium",
      desc: "Conception ergonomique et matériaux de haute qualité pour un confort optimal au quotidien.",
      features: ["Réglable", "Léger", "Pliable"],
      rating: 4.9
    },
    {
      image: product2,
      title: "Lit Médicalisé Électrique",
      desc: "Technologie avancée avec télécommande pour un positionnement précis et sécurisé.",
      features: ["Électrique", "Télécommande", "Sécurisé"],
      rating: 4.8
    },
    {
      image: product3,
      title: "Déambulateur Intelligent",
      desc: "Design moderne avec système de freinage avancé pour une mobilité en toute sécurité.",
      features: ["Anti-chute", "Ergonomique", "Stable"],
      rating: 4.7
    },
  ]

  const testimonials = [
    {
      name: "Dr. Amira Ben Salem",
      role: "Médecin",
      text: "Service exceptionnel et matériel de qualité supérieure. Je recommande vivement ProSoin.",
      rating: 5
    },
    {
      name: "Mohamed Trabelsi",
      role: "Patient",
      text: "Installation rapide et professionnelle. L'équipe est très compétente et à l'écoute.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Enhanced Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-slate-200/50' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img
                src={logo}
                alt="Logo ProSoin"
                className="w-10 h-10 rounded-xl object-cover shadow-lg"
              />
              <div className="hidden sm:block">
                <h1 className={`text-xl font-bold ${scrolled ? 'text-slate-900' : 'text-white'} transition-colors`}>
                  ProSoin
                </h1>
                <p className={`text-xs ${scrolled ? 'text-slate-500' : 'text-white/80'} transition-colors`}>
                  Matériel médical premium
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 ${
                    activeSection === link.href.slice(1)
                      ? (scrolled ? 'text-emerald-600' : 'text-emerald-300')
                      : (scrolled ? 'text-slate-700 hover:text-emerald-600' : 'text-white/90 hover:text-emerald-300')
                  }`}
                >
                  {link.label}
                  {activeSection === link.href.slice(1) && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                  )}
                </a>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:flex items-center space-x-4">
              <a
                href="tel:57037377"
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2.5 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Phone className="w-4 h-4" />
                <span>57 037 377</span>
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                scrolled ? 'text-slate-900 hover:bg-slate-100' : 'text-white hover:bg-white/10'
              }`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200/50 shadow-lg">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href="tel:57037377"
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-lg font-medium mt-4 mx-3"
                >
                  <Phone className="w-4 h-4" />
                  <span>Appelez maintenant</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Background médical"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/80 via-teal-600/80 to-cyan-700/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          {/* Floating elements */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-32 right-16 w-48 h-48 bg-emerald-300/10 rounded-full blur-2xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-teal-300/10 rounded-full blur-xl animate-pulse delay-2000" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
              <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm font-medium">Disponible 24h/7j pour vos urgences</span>
            </div>

            {/* Logo in Hero */}
            <div className="flex items-center space-x-4 mb-8">
              <img
                src={logo}
                alt="Logo ProSoin"
                className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-2xl animate-pulse"
              />
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white/90 mb-1">ProSoin</h2>
                <p className="text-emerald-200 text-sm md:text-base">Matériel médical & paramédical</p>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Votre santé,
              <span className="block bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                notre priorité
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl">
              Équipements médicaux et paramédicaux de qualité supérieure avec service premium inclus.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
              <a
                href="#produits"
                className="group inline-flex items-center space-x-2 bg-white text-emerald-700 px-8 py-4 rounded-full font-semibold hover:bg-emerald-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <span>Découvrir nos produits</span>
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <div className="w-2 h-2 border-r-2 border-b-2 border-emerald-700 rotate-45 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </a>
              <a
                href="#services"
                className="inline-flex items-center space-x-2 text-white border-2 border-white/30 hover:border-white hover:bg-white/10 px-8 py-4 rounded-full font-semibold transition-all duration-300"
              >
                <span>Nos services</span>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: "500+", label: "Clients satisfaits" },
                { number: "24h", label: "Support disponible" },
                { number: "99%", label: "Satisfaction client" },
                { number: "5★", label: "Note moyenne" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-white/70 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Services Section */}
      <section id="services" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-emerald-50/30" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Services Premium Inclus
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Nous vous accompagnons à chaque étape avec des services de qualité supérieure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-slate-100"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${service.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {service.desc}
                </p>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Products Section */}
      <section id="produits" className="py-24 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Nos Équipements Premium
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Matériel médical certifié et testé pour votre sécurité et confort
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                <div className="h-64 relative overflow-hidden rounded-t-2xl">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-slate-700">{product.rating}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-slate-600 mb-4 leading-relaxed">
                    {product.desc}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {product.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-xl font-medium transition-all duration-300 transform group-hover:scale-105">
                    En savoir plus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-600 to-teal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ce que disent nos clients
            </h2>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
              Témoignages authentiques de professionnels de santé et patients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-white text-lg mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-emerald-200">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Location Section */}
      <section id="localisation" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Notre Localisation
            </h2>
            <p className="text-xl text-slate-600">
              Visitez notre showroom à Ghannouch, Gabès
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 mb-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Adresse</h3>
                    <p className="text-slate-600">Rue Habib Bourguiba, Ghannouch, Gabès, Tunisie</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Horaires</h3>
                    <p className="text-slate-600">Lundi - Samedi: 8h00 - 18h00</p>
                    <p className="text-slate-600">Dimanche: Sur rendez-vous</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3169.749783434764!2d10.085197015022558!3d33.9375298807366!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13f9e0d9e7eb8c5d%3A0x3648f5f4954880d2!2sRue%20Habib%20Bourguiba%2C%20Ghannouch%2C%20Tunisie!5e0!3m2!1sfr!2sfr!4v1691740000000!5m2!1sfr!2sfr"
                className="w-full h-96"
                allowFullScreen
                loading="lazy"
                title="ProSoin Location"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Contact Section */}
      <section id="contact" className="py-24 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Besoin d'aide ? Contactez-nous
            </h2>
            <p className="text-xl text-slate-300 mb-12">
              Notre équipe d'experts est disponible pour répondre à vos questions et vous accompagner
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <a
                href="tel:57037377"
                className="group inline-flex items-center space-x-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <Phone className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span>57 037 377</span>
              </a>
              
              <div className="text-slate-400">ou</div>
              
              <button className="inline-flex items-center space-x-3 text-white border-2 border-white/20 hover:border-white hover:bg-white/10 px-8 py-4 rounded-full font-semibold transition-all duration-300">
                <span>Demander un devis</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img
                src={logo}
                alt="Logo ProSoin"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <div>
                <p className="text-white font-semibold">ProSoin</p>
                <p className="text-slate-400 text-sm">Matériel médical premium</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm">
              © 2025 ProSoin. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}