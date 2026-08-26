import { Reveal } from "@/components/ui/Reveal";
import { usefulInfo } from "@/config/wedding";

/**
 * Informações úteis (hospedagem, trajes, estacionamento, beleza, transporte).
 * Usa <details>/<summary> nativos: acessível por teclado e funciona sem JS.
 * Conteúdo em `config/wedding.ts` → `usefulInfo`.
 */
export function UsefulInfo() {
  if (usefulInfo.items.length === 0) return null;

  return (
    <div className="mx-auto grid max-w-4xl gap-4">
      {usefulInfo.items.map((item, index) => (
        <Reveal key={item.title} delay={index * 60}>
          <details className="surface group overflow-hidden [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-4 p-5 transition-colors hover:bg-green-100 md:p-6 duration-500">
              <span aria-hidden="true" className="text-2xl">
                {item.icon}
              </span>

              <span className="flex-1">
                <span className="block font-display text-xl text-green-800">{item.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-ink-soft">
                  {item.description}
                </span>
              </span>

              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-bordo-500 transition-transform duration-300 ease-soft group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>

            {item.details.length > 0 ? (
              <ul className="space-y-2 border-t border-green-100 px-5 py-5 text-sm leading-relaxed text-ink-soft md:px-6">
                {item.details.map((detail) => (
                  <li key={detail} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-bordo-400" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </details>
        </Reveal>
      ))}
    </div>
  );
}
