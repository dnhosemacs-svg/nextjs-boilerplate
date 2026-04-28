export default function Loading() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm dark:border-white/15 dark:bg-black">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando...</p>
      </div>
    </main>
  );
}
