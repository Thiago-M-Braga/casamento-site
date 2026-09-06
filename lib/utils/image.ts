import { MAX_PHOTO_BYTES, PHOTO_MAX_DIMENSION } from "@/lib/validations/guest-photo";

/**
 * Preparação de fotos NO NAVEGADOR, antes do envio.
 *
 * Por que isto existe: a foto que sai de um celular tem 3 a 8 MB e 4000 px de
 * largura. No dia do casamento, dezenas de convidados vão enviar fotos pela
 * mesma rede — mandar o arquivo original seria lento, cairia no limite de
 * tamanho de requisição da Vercel e não melhoraria nada na tela.
 *
 * Redimensionar aqui também resolve duas coisas de brinde:
 *  - a orientação do EXIF é aplicada de verdade (foto de celular não sai
 *    "deitada");
 *  - todos os metadados originais são descartados, inclusive a LOCALIZAÇÃO
 *    GPS. O convidado não publica sem querer o endereço de onde estava.
 *
 * Este módulo só roda no cliente (usa canvas). Não importe no servidor.
 */

export type PreparedPhoto = {
  /** Arquivo JPEG já reduzido, pronto para o upload. */
  file: File;
  width: number;
  height: number;
  /** URL temporária para a miniatura. Libere com `URL.revokeObjectURL`. */
  previewUrl: string;
  /** Tamanho do arquivo original, para mostrar o quanto economizamos. */
  originalBytes: number;
};

/** Tentativas de compressão, da melhor qualidade para a mais econômica. */
const ATTEMPTS = [
  { maxSize: PHOTO_MAX_DIMENSION, quality: 0.82 },
  { maxSize: PHOTO_MAX_DIMENSION, quality: 0.7 },
  { maxSize: 1600, quality: 0.65 },
  { maxSize: 1280, quality: 0.6 },
] as const;

/**
 * Decodifica o arquivo. Retorna `null` quando o navegador não sabe abrir o
 * formato — o caso real aqui é HEIC do iPhone escolhido pelo app Arquivos.
 */
async function decode(file: File): Promise<ImageBitmap | HTMLImageElement | null> {
  if (typeof createImageBitmap === "function") {
    try {
      // `from-image` aplica a rotação registrada no EXIF.
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      try {
        return await createImageBitmap(file);
      } catch {
        // Segue para o caminho do <img>.
      }
    }
  }

  // Reserva: elemento <img>, que os navegadores já desenham na orientação certa.
  const url = URL.createObjectURL(file);

  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("decode falhou"));
      image.src = url;
    });
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function dimensionsOf(source: ImageBitmap | HTMLImageElement): { width: number; height: number } {
  if ("naturalWidth" in source) {
    return { width: source.naturalWidth, height: source.naturalHeight };
  }
  return { width: source.width, height: source.height };
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

/** Troca a extensão do nome original por .jpg, preservando algo reconhecível. */
function jpegName(original: string): string {
  const base = original.replace(/\.[^.]+$/, "").slice(0, 60).trim();
  return `${base || "foto"}.jpg`;
}

/**
 * Reduz e recomprime uma foto para JPEG.
 *
 * Retorna `null` quando o navegador não conseguiu abrir a imagem; quem chama
 * deve avisar o convidado em vez de enviar um arquivo que a galeria não
 * conseguiria exibir depois.
 */
export async function preparePhoto(file: File): Promise<PreparedPhoto | null> {
  const source = await decode(file);
  if (!source) return null;

  const natural = dimensionsOf(source);
  if (natural.width === 0 || natural.height === 0) return null;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return null;

  let best: { blob: Blob; width: number; height: number } | null = null;

  for (const attempt of ATTEMPTS) {
    const scale = Math.min(1, attempt.maxSize / Math.max(natural.width, natural.height));
    const width = Math.max(1, Math.round(natural.width * scale));
    const height = Math.max(1, Math.round(natural.height * scale));

    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    // Fundo branco: PNG com transparência viraria preto ao salvar em JPEG.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(source as CanvasImageSource, 0, 0, width, height);

    const blob = await toBlob(canvas, attempt.quality);
    if (!blob) continue;

    best = { blob, width, height };
    if (blob.size <= MAX_PHOTO_BYTES) break;
  }

  if ("close" in source) source.close();

  // Nem a tentativa mais econômica caberia: melhor avisar do que falhar no POST.
  if (!best || best.blob.size > MAX_PHOTO_BYTES) return null;

  const prepared = new File([best.blob], jpegName(file.name), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });

  return {
    file: prepared,
    width: best.width,
    height: best.height,
    previewUrl: URL.createObjectURL(prepared),
    originalBytes: file.size,
  };
}

/** "1,4 MB" · "312 KB" — para mostrar o tamanho na lista de fotos. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}
