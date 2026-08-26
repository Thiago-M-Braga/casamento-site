import { Reveal } from "@/components/ui/Reveal";
import { usefulInfo } from "@/config/wedding";
import { InfoAccordionItem } from "./InfoAccordionItem";

/**
 * Informações úteis (trajes, estacionamento, horários, comes e bebes, evento).
 * Conteúdo em `config/wedding.ts` → `usefulInfo`.
 */
export function UsefulInfo() {
  if (usefulInfo.items.length === 0) return null;

  return (
    <div className="mx-auto grid max-w-4xl gap-4">
      {usefulInfo.items.map((item, index) => (
        <Reveal key={item.title} delay={index * 60}>
          <InfoAccordionItem item={item} />
        </Reveal>
      ))}
    </div>
  );
}
