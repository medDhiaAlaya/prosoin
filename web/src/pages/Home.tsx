import type React from "react"
import type { FC } from "react"
import { MapPin, Phone, Mail, Check } from "lucide-react"
import { Link } from "react-router-dom"


const Home: FC = () => {
  const year = new Date().getFullYear()

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white text-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/home" className="flex items-center gap-3" aria-label="Aller à l’accueil">
            {/* logo via Source URL */}
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-q5nkpP6rPIH4Md5SJh9XnoBpwwvQA6.jpeg"
              alt="Logo ProSoin"
              width={40}
              height={40}
              className="rounded-sm"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-base font-extrabold tracking-tight">PROSOIN</span>
              <span className="text-xs text-neutral-500">Matériel Médical & Paramédical</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <a href="#services" className="text-sm font-medium hover:underline underline-offset-4">
              Services
            </a>
            <a href="#galerie" className="text-sm font-medium hover:underline underline-offset-4">
              Galerie
            </a>
            <a href="#localisation" className="text-sm font-medium hover:underline underline-offset-4">
              Localisation
            </a>
            <a href="#contact" className="text-sm font-medium hover:underline underline-offset-4">
              Contact
            </a>
            <a
              href="#catalogue"
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Voir le catalogue
            </a>
          </nav>
        </div>
        <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500/70 via-teal-500/70 to-emerald-500/70" />
      </header>

      <main id="home" className="flex-1">
        {/* HERO with full-bleed background */}
        <section className="relative w-full overflow-hidden">
          {/* Background image */}
          <div
            className="absolute inset-0 -z-20 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5f0f7de08e45e.jpg-bFj208WhnrEWKUTh279LYxAAwsPTey.jpeg')",
            }}
            aria-hidden="true"
          />
          {/* Layered gradients */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-900/70 via-emerald-900/40 to-white/0" />
          <div className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-emerald-400/40 blur-3xl" />
          <div className="absolute -left-24 bottom-0 -z-10 h-80 w-80 rounded-full bg-teal-300/40 blur-3xl" />

          <div className="container mx-auto grid items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
            <div className="space-y-6 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs ring-1 ring-white/25">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Depuis votre domicile
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
                ProSoin – Matériel Médical & Paramédical
              </h1>
              <p className="max-w-xl text-lg text-white/90">
                Vente et location d&apos;équipements médicaux et paramédicaux essentiels. Prendre soin de vous, notre
                priorité&nbsp;!
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-300" />
                  Lits médicalisés, fauteuils roulants, déambulateurs, oxygénothérapie...
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-300" />
                  Livraison, installation et démonstration à domicile.
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-300" />
                  Location flexible et service après-vente réactif.
                </li>
              </ul>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-emerald-900 shadow-sm transition hover:bg-emerald-50"
                >
                  Nous contacter
                </a>
                <a
                  href="#services"
                  className="inline-flex items-center justify-center rounded-md border border-white/70 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Découvrir nos services
                </a>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <FeaturePill title="Installation à domicile" />
                <FeaturePill title="Location flexible" />
                <FeaturePill title="SAV réactif" />
              </div>
            </div>

            {/* Supporting foreground image */}
            <div className="relative">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/materiel-maintien-a-domicile-01.jpg-92bIGDYEYGiYzGELlrRzbedzeTxoia.jpeg"
                alt="Aménagement de maintien à domicile"
                width={610}
                height={610}
                className="rounded-xl border border-white/30 shadow-2xl"
              />
              <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/20" />
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="relative w-full border-t bg-neutral-50">
          <div className="absolute inset-x-0 -top-24 -z-10 h-24 bg-gradient-to-b from-emerald-100/50 to-transparent" />
          <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="mx-auto max-w-3xl space-y-3 text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">Nos services</h2>
              <p className="text-neutral-600">
                Solutions complètes pour le maintien à domicile et l’autonomie au quotidien.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <PrettyCard
                title="Lits médicalisés"
                img="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bi-wave-carer-small-2tjuhQluV08eqYMDgIsI6iByPhdvGU.png"
                alt="Lit médicalisé"
              >
                Confort, sécurité et réglages électriques.
              </PrettyCard>

              <PrettyCard
                title="Mobilité et aide à la marche"
                img="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/medical-material.jpg-UjhIG8OYadWkZBcf1g4MtSjzJBnKfV.jpeg"
                alt="Fauteuil roulant, déambulateur et béquilles"
              >
                Fauteuils roulants, déambulateurs et béquilles adaptés à vos besoins.
              </PrettyCard>

              <PrettyCard
                title="Oxygénothérapie"
                img="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/concentrateur-oxygene-tunisie.jpg-aXAjqsdRw62FY9di39lbJjDBq9i6hu.jpeg"
                alt="Concentrateur d'oxygène"
              >
                Appareils fiables pour une assistance respiratoire à domicile.
              </PrettyCard>

              <PrettyCard
                title="Aménagement à domicile"
                img="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/materiel-maintien-a-domicile-01.jpg-92bIGDYEYGiYzGELlrRzbedzeTxoia.jpeg"
                alt="Aménagement domicile"
              >
                Installation des équipements et conseils personnalisés.
              </PrettyCard>
            </div>
          </div>
        </section>

        {/* Galerie mosaic */}
        <section id="galerie" className="w-full">
          <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="mx-auto max-w-3xl space-y-3 text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">Galerie</h2>
              <p className="text-neutral-600">Quelques aménagements et produits qui illustrent notre accompagnement.</p>
            </div>

            <div className="mt-10 grid grid-cols-2 grid-rows-2 gap-4 md:grid-cols-3 md:grid-rows-2">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5f0f7de08e45e.jpg-bFj208WhnrEWKUTh279LYxAAwsPTey.jpeg"
                alt="Chambre médicalisée complète"
                className="col-span-2 h-56 w-full rounded-lg border object-cover md:col-span-2 md:h-64"
              />
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/medical-material.jpg-UjhIG8OYadWkZBcf1g4MtSjzJBnKfV.jpeg"
                alt="Matériel de mobilité"
                className="h-56 w-full rounded-lg border object-cover md:h-64"
              />
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/materiel-maintien-a-domicile-01.jpg-92bIGDYEYGiYzGELlrRzbedzeTxoia.jpeg"
                alt="Lit médicalisé à domicile"
                className="h-56 w-full rounded-lg border object-cover md:h-64"
              />
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/concentrateur-oxygene-tunisie.jpg-aXAjqsdRw62FY9di39lbJjDBq9i6hu.jpeg"
                alt="Oxygénothérapie"
                className="h-56 w-full rounded-lg border object-cover md:h-64"
              />
            </div>
          </div>
        </section>

        {/* Localisation */}
        <section id="localisation" className="relative w-full border-t bg-neutral-50">
          <div className="absolute inset-x-0 -top-24 -z-10 h-24 bg-gradient-to-b from-teal-100/50 to-transparent" />
          <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                Localisation
              </div>
              <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">Où nous trouver</h3>
              <p className="text-neutral-600">
                Nous intervenons localement et à domicile. Prenez rendez-vous pour une démonstration ou une livraison
                rapide selon disponibilité.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=ProSoin%20Tunisie"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  Ouvrir dans Google Maps
                </a>
                <a
                  href="#contact"
                  className="rounded-md border px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
                >
                  Demander une visite
                </a>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border">
              <iframe
                title="Localisation ProSoin"
                aria-label="Carte de localisation"
                src="https://www.google.com/maps?q=ProSoin%20Tunisie&output=embed"
                className="h-[380px] w-full"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Contact CTA with background image */}
        <section id="contact" className="relative w-full">
          {/* Background image */}
          <div
            className="absolute inset-0 -z-10 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/materiel-maintien-a-domicile-01.jpg-92bIGDYEYGiYzGELlrRzbedzeTxoia.jpeg')",
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white via-white/95 to-white/80" />

          <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs">
                <Mail className="h-3.5 w-3.5 text-emerald-600" />
                Contact
              </div>
              <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Besoin d’un conseil ou d’un devis&nbsp;?
              </h3>
              <p className="text-neutral-600">
                Dites-nous votre besoin (achat ou location) et le produit souhaité. Nous vous recontactons rapidement.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  <span>Mettez votre numéro de téléphone ici</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-emerald-600" />
                  <span>Mettez votre email ici</span>
                </li>
              </ul>
              <div className="flex gap-3">
                <a
                  href="#catalogue"
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  Voir le catalogue
                </a>
                <a
                  href="#services"
                  className="rounded-md border px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
                >
                  Tous les services
                </a>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5f0f7de08e45e.jpg-bFj208WhnrEWKUTh279LYxAAwsPTey.jpeg"
                alt="Installation de matériel à domicile"
                className="h-full w-full rounded-xl border object-cover"
              />
              <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/10" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 text-center md:flex-row">
          <div className="flex items-center gap-2">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-q5nkpP6rPIH4Md5SJh9XnoBpwwvQA6.jpeg"
              alt="ProSoin"
              width={24}
              height={24}
              className="rounded-sm"
            />
            <span className="text-sm text-neutral-500">© {year} ProSoin. Tous droits réservés.</span>
          </div>
          <nav className="flex gap-4 text-sm">
            <a href="#services" className="hover:underline underline-offset-4">
              Services
            </a>
            <a href="#localisation" className="hover:underline underline-offset-4">
              Localisation
            </a>
            <a href="#contact" className="hover:underline underline-offset-4">
              Contact
            </a>
          </nav>
        </div>
      </footer>
    </div>
  )
}

export default Home

/* Helper components inside the same file */

function PrettyCard(props: { title: string; img: string; alt: string; children: React.ReactNode }) {
  const { title, img, alt, children } = props
  return (
    <div className="group relative overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-b from-emerald-50 to-white p-4 shadow-sm ring-1 ring-emerald-100 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-100/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <h3 className="mb-3 text-base font-semibold">{title}</h3>
      <img
        src={img || "/placeholder.svg"}
        alt={alt}
        className="mx-auto max-h-44 w-full rounded-md border bg-white object-contain p-2 ring-1 ring-emerald-100"
      />
      <p className="mt-3 text-sm text-neutral-600">{children}</p>
    </div>
  )
}

function FeaturePill({ title }: { title: string }) {
  return (
    <span className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs text-white">
      {title}
    </span>
  )
}
