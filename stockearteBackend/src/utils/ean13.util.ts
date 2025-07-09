import { PrismaService } from '../prisma/prisma.service';

// Genera un array de 12 dígitos aleatorios
export function generateRandomEAN13Base(): number[] {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));
}

// Calcula el dígito de control EAN13
export function calculateEAN13Checksum(digits: number[]): number {
  const sum = digits.reduce((acc, digit, index) => {
    return acc + digit * (index % 2 === 0 ? 1 : 3);
  }, 0);
  const mod = sum % 10;
  return mod === 0 ? 0 : 10 - mod;
}

// Genera un EAN13 completo
export function generateRandomEAN13(): string {
  const base = generateRandomEAN13Base();
  const checksum = calculateEAN13Checksum(base);
  return [...base, checksum].join('');
}

// Verifica si un EAN13 está disponible en productos y variantes de una empresa
export async function isEAN13AvailableInEmpresa(
  prisma: PrismaService,
  ean13: string,
  empresaId: number,
): Promise<boolean> {
  // Buscar en productos
  const producto = await prisma.producto.findFirst({
    where: {
      codigoBarras: ean13,
      empresaId,
    },
  });
  if (producto) return false;

  // Buscar en variantes (requiere join con producto para empresaId)
  const variante = await prisma.varianteProducto.findFirst({
    where: {
      codigoBarras: ean13,
      producto: { empresaId },
    },
  });
  return !variante;
}

// Genera un EAN13 único para la empresa (en productos y variantes)
export async function generateUniqueEAN13(
  prisma: PrismaService,
  empresaId: number,
): Promise<string> {
  let ean;
  let isAvailable = false;
  while (!isAvailable) {
    ean = generateRandomEAN13();
    isAvailable = await isEAN13AvailableInEmpresa(prisma, ean, empresaId);
  }
  return ean;
} 