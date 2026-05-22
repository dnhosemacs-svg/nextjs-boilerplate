import Image from "next/image";
import Link from "next/link";
import HomeAuthCta from "@/components/home-auth-cta";

const galleryItems = [
  {
    title: "Mesa roble — referencia de acabado",
    place: "Catálogo interno / muestra",
    src: "https://images.pexels.com/photos/4985341/pexels-photo-4985341.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Mesa de madera sólida, referencia visual para pedidos del taller",
  },
  {
    title: "Mobiliario en almacén",
    place: "Piezas terminadas o en espera",
    src: "https://images.pexels.com/photos/5825540/pexels-photo-5825540.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Cómoda de madera en espacio de taller o almacén",
  },
  {
    title: "Prototipo / pieza tipo",
    place: "Banco de ideas del equipo",
    src: "https://images.pexels.com/photos/963486/pexels-photo-963486.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Silla de madera minimalista como referencia de diseño",
  },
];

export default function Home() {

  return (
    <main className="page-shell page-shell--home">
      <div className="flex w-full min-w-0 flex-col gap-8 md:gap-12">
        <section className="surface-card home-hero">
          <div className="home-hero-media">
            <Image
              src="https://images.pexels.com/photos/5974335/pexels-photo-5974335.jpeg?auto=compress&cs=tinysrgb&w=2000"
              alt="Carpintero trabajando una pieza de madera en su taller"
              fill
              priority
              sizes="(max-width: 72rem) 100vw, 72rem"
              className="object-cover object-center"
            />
            <div className="home-hero-overlay" aria-hidden />
            <div className="home-hero-content">
              <p className="eyebrow mb-3 !text-white/90 drop-shadow-sm">
                Carpintería a medida
              </p>
              <h1 className="display-heading home-hero-title text-[var(--surface)]">
                Diseño y fabricación en madera para proyectos residenciales y comerciales.
              </h1>
              <p className="home-hero-lead text-[rgb(251_247_241/0.9)]">
                Diseñamos y fabricamos mobiliario y soluciones en madera adaptadas a tu espacio,
                tu estilo y el uso real de cada estancia. Te acompañamos desde la primera medida
                hasta la entrega, cuidando materiales, proporciones y acabados para que cada pieza
                sea funcional, duradera y coherente con el conjunto del proyecto.
              </p>
            </div>
          </div>
        </section>

        <section>
          <article className="surface-card presentation-card">
            <p className="eyebrow">Tu proyecto, paso a paso</p>
            <h2 className="section-heading max-w-xl">
              Próximamente podrás gestionar tu pedido desde aquí.
            </h2>
            <p className="text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              Estamos preparando un espacio para que puedas crear tu cuenta, iniciar sesión y
              solicitar trabajos a medida con la misma claridad que en el taller: un solo sitio
              para el detalle de tu proyecto, el estado del encargo y la comunicación con
              nosotros.
            </p>
            <ul className="presentation-card-steps">
              <li className="presentation-card-step">
                Regístrate y cuéntanos qué necesitas
              </li>
              <li className="presentation-card-step">
                Sigue el avance de tu pedido en tiempo real
              </li>
              <li className="presentation-card-step">
                Recibe tu pieza y revisa el resultado contigo
              </li>
            </ul>
          </article>
        </section>

        <section className="surface-card home-gallery">
          <header className="home-gallery-header">
            <p className="eyebrow">Referencia visual</p>
            <h2 className="section-heading">Inspiración y acabados</h2>
          </header>

          <div className="home-gallery-grid">
            {galleryItems.map((item) => (
              <article
                key={item.title}
                className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={1200}
                  height={900}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="home-gallery-card-copy">
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="text-sm text-[var(--muted)]">{item.place}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="surface-card warm-gradient home-cta relative overflow-hidden">
          <div className="soft-grid pointer-events-none absolute inset-0 opacity-50" />
          <div className="relative z-10 grid gap-6 md:grid-cols-[1.15fr_1fr] md:items-center">
            <div className="home-cta-copy">
              <p className="eyebrow">¿Listo para avanzar?</p>
              <h2 className="section-heading max-w-xl">
                Si ya trabajas con nosotros, entra a tu panel. Si no, contáctanos.
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                Centralizamos pedidos y seguimiento para mantener cada proyecto claro y ordenado.
              </p>
              <div className="home-cta-actions flex flex-wrap gap-3">
                <HomeAuthCta />
                <Link href="/about" className="ui-pill ui-pill-secondary">
                  Contactar
                </Link>
              </div>
            </div>

            <article className="overflow-hidden rounded-2xl border border-[var(--line)]">
              <Image
                src="https://images.pexels.com/photos/17649488/pexels-photo-17649488.jpeg?auto=compress&cs=tinysrgb&w=1400"
                alt="Operario transportando tablones de madera en taller"
                width={1400}
                height={933}
                sizes="(max-width: 768px) 100vw, 40vw"
                className="h-60 w-full object-cover md:h-[300px]"
              />
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
