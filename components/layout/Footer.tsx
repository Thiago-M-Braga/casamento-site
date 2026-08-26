import Link from "next/link";
import { getNavItems } from "@/config/navigation";
import { weddingConfig } from "@/config/wedding";
import { Ornament } from "@/components/ui/Ornament";
import { ShareButtons } from "./ShareButtons";
import { formatWeddingDateLong } from "@/lib/utils/date";
import { formatWhatsapp, whatsappLink } from "@/lib/utils/format";
import { getShareMessage, getSiteUrl, getWhatsappShareUrl } from "@/lib/utils/site";

export function Footer() {
  const { couple, contact, social } = weddingConfig;
  const navItems = getNavItems();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-green-100 bg-beige-50">
      <div className="container-page py-14 md:py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <Ornament />
          <p className="font-script text-3xl text-green-700 md:text-4xl">
            {couple.displayName}
          </p>
          <p className="text-xs uppercase tracking-widest text-ink-muted">
            {formatWeddingDateLong()}
          </p>
          {social.hashtag ? (
            <p className="text-sm text-bordo-500">#{social.hashtag}</p>
          ) : null}
        </div>

        <div className="mt-12 grid gap-60 border-t border-green-100 pt-10 sm:grid-cols-2 lg:grid-cols-3">
          <nav aria-label="Navegação do rodapé">
            <h2 className="mb-4 text-xs uppercase tracking-widest text-ink-muted">
              Navegue
            </h2>
            <ul className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="link-underline text-sm text-ink-soft transition-colors hover:text-green-800"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="mb-4 text-xs uppercase tracking-widest text-ink-muted">
              Fale com a gente
            </h2>
            <ul className="flex flex-col gap-2.5 text-sm text-ink-soft">
              {contact.whatsapp ? (
                <li>
                  <a
                    href={whatsappLink(contact.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline transition-colors hover:text-green-800"
                  >
                    WhatsApp {formatWhatsapp(contact.whatsapp)}
                  </a>
                </li>
              ) : null}

              {contact.email ? (
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="link-underline transition-colors hover:text-green-800"
                  >
                    {contact.email}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-green-100 pt-6 text-center text-xs text-ink-muted">
          © {year} {couple.displayName}. Feito com carinho (e um pouco de café).
        </p>
      </div>
    </footer>
  );
}
