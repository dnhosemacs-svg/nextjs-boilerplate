import Image from "next/image";
import Link from "next/link";
import { listTasksFromCookieStore } from "@/lib/tasks-cookie-store";

const galleryItems = [
  {
    title: "Mesa de roble a medida",
    place: "Proyecto residencial",
    src: "https://images.pexels.com/photos/4985341/pexels-photo-4985341.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Mesa de madera sólida en interior moderno",
  },
  {
    title: "Mobiliario artesanal",
    place: "Espacio comercial",
    src: "https://images.pexels.com/photos/5825540/pexels-photo-5825540.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Cómoda de madera con acabados premium",
  },
  {
    title: "Pieza de autor",
    place: "Colección limitada",
    src: "https://images.pexels.com/photos/963486/pexels-photo-963486.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Silla de madera minimalista sobre fondo neutro",
  },
];

export default async function Home() {
  const tasks = await listTasksFromCookieStore();

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
          <div className="absolute inset-x-0 bottom-0 z-20 p-6 sm:p-8 md:p-12">
            <p className="eyebrow mb-3 text-[var(--surface)]">Taller artesanal</p>
            <h1 className="display-heading max-w-3xl text-4xl text-[var(--surface)] sm:text-5xl md:text-6xl">
              Diseñamos y fabricamos piezas de madera con alma contemporánea.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[rgb(251_247_241/0.88)] sm:text-base">
              Muebles a medida, acabados premium y procesos transparentes para hogares y
              negocios que valoran el detalle.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/tasks/new" className="ui-pill ui-pill-primary">
                Solicitar pedido
              </Link>
              <Link
                href="/stats"
                className="ui-pill border border-white/45 bg-white/10 text-white hover:bg-white/20"
              >
                Ver procesos
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
          <article className="surface-card flex flex-col gap-4">
            <p className="eyebrow">Servicios y proceso</p>
            <h2 className="section-heading max-w-xl">
              Del boceto inicial al acabado final, todo pasa por manos expertas.
            </h2>
            <p className="text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              Acompañamos cada proyecto con asesoría en materiales, diseño funcional y control
              de calidad para que cada entrega mantenga una estética cálida y duradera.
            </p>
            <ul className="mt-2 grid gap-3 text-sm text-[var(--foreground)] sm:grid-cols-3">
              <li className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                Medición y diseño
              </li>
              <li className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                Fabricación en taller
              </li>
              <li className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                Instalación final
              </li>
            </ul>
          </article>

          <article className="surface-card overflow-hidden p-0">
            <Image
              src="https://images.pexels.com/photos/4346894/pexels-photo-4346894.jpeg?auto=compress&cs=tinysrgb&w=1400"
              alt="Herramientas de carpintería organizadas sobre una mesa de trabajo"
              width={1400}
              height={933}
              sizes="(max-width: 768px) 100vw, 45vw"
              className="h-full min-h-[280px] w-full object-cover"
            />
          </article>
        </section>

        <section className="surface-card">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Galería de proyectos</p>
              <h2 className="section-heading">Trabajos recientes</h2>
            </div>
            <Link href="/tasks/new" className="ui-link-underline">
              Iniciar un proyecto
            </Link>
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

        <section className="surface-card">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Gestión activa</p>
              <h2 className="section-heading text-3xl">Pedidos</h2>
            </div>
          </div>
          <p className="mb-6 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            Gestiona tus pedidos desde una experiencia visual más clara, manteniendo la lógica
            actual de la aplicación.
          </p>

          {tasks.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              No hay pedidos todavia.
            </p>
          ) : (
            <ul className="flex flex-col gap-6 md:gap-8">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 md:gap-4"
                >
                  <p className="eyebrow">
                    {task.status}
                  </p>
                  <h3 className="text-base font-medium leading-snug">{task.title}</h3>
                  {task.description ? (
                    <p className="text-sm leading-relaxed text-[var(--muted)]">
                      {task.description}
                    </p>
                  ) : null}
                  <Link
                    href={`/tasks/${task.id}`}
                    className="ui-link-underline inline-flex pt-1"
                  >
                    Ver detalle
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface-card warm-gradient relative overflow-hidden">
          <div className="soft-grid pointer-events-none absolute inset-0 opacity-50" />
          <div className="relative z-10 grid gap-6 md:grid-cols-[1.15fr_1fr] md:items-center">
            <div>
              <p className="eyebrow">Reserva tu asesoría</p>
              <h2 className="section-heading mt-2 max-w-xl">
                Llevemos tu próximo mueble de idea a pieza terminada.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                Cuéntanos dimensiones, uso y estilo. Te proponemos materiales, presupuesto y
                calendario de entrega.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/tasks/new" className="ui-pill ui-pill-primary">
                  Agendar proyecto
                </Link>
                <Link href="/info" className="ui-pill ui-pill-secondary">
                  Ver más información
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
