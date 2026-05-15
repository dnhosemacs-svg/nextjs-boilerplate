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
    <main className="page-shell">
      <div className="flex w-full flex-col gap-8 md:gap-12">
        <section className="surface-card relative overflow-hidden p-0">
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
          <Image
            src="https://images.pexels.com/photos/5974335/pexels-photo-5974335.jpeg?auto=compress&cs=tinysrgb&w=2000"
            alt="Carpintero trabajando una pieza de madera en su taller"
            width={2000}
            height={1200}
            priority
            sizes="(max-width: 768px) 100vw, 1100px"
            className="h-[66svh] min-h-[460px] w-full object-cover object-center"
          />
          <div className="absolute inset-x-3 bottom-3 z-20 p-6 sm:inset-x-5 sm:bottom-5 sm:p-8 md:inset-x-6 md:bottom-6 md:p-12">
            <p className="eyebrow mb-3 !text-white/90 drop-shadow-sm">
              Carpinteria a medida
            </p>
            <h1 className="display-heading max-w-3xl text-4xl text-[var(--surface)] sm:text-5xl md:text-6xl">
              Diseno y fabricacion en madera para proyectos residenciales y comerciales.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[rgb(251_247_241/0.88)] sm:text-base">
              Creamos mobiliario y soluciones en madera adaptadas a cada espacio, con enfoque en
              calidad de materiales, detalle artesanal y cumplimiento de plazos.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <HomeAuthCta />
              <Link
                href="/about"
                className="ui-pill border border-white/70 bg-black/20 !text-white/95 shadow-sm backdrop-blur-md hover:border-white/85 hover:bg-black/30"
              >
                Sobre el proyecto
              </Link>
            </div>
          </div>
        </section>

        <section>
          <article className="surface-card presentation-card">
            <p className="eyebrow">Flujo en el taller</p>
            <h2 className="section-heading max-w-xl">
              Cómo encaja esta app en el día a día del equipo.
            </h2>
            <p className="text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              Cada pedido lo crea alguien del taller cuando entra un trabajo nuevo. Así todos
              ven el mismo estado, las notas y el detalle sin depender de papel suelto o grupos
              de mensajes.
            </p>
            <ul className="mt-1 grid gap-3 text-sm text-[var(--foreground)] sm:grid-cols-3">
              <li className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                Registrar pedido y prioridad
              </li>
              <li className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                Seguimiento en fabricación
              </li>
              <li className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                Cierre y revisión en lista
              </li>
            </ul>
          </article>
        </section>

        <section className="surface-card">
          <div className="mb-6">
            <div>
              <p className="eyebrow">Referencia visual</p>
              <h2 className="section-heading">Inspiración y acabados</h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
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
                <div className="p-4">
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">{item.place}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="surface-card warm-gradient relative overflow-hidden">
          <div className="soft-grid pointer-events-none absolute inset-0 opacity-50" />
          <div className="relative z-10 grid gap-6 md:grid-cols-[1.15fr_1fr] md:items-center">
            <div>
              <p className="eyebrow">¿Listo para avanzar?</p>
              <h2 className="section-heading mt-2 max-w-xl">
                Si ya trabajas con nosotros, entra a tu panel. Si no, contactanos.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                Centralizamos pedidos y seguimiento para mantener cada proyecto claro y ordenado.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
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
