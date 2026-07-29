import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const pesoFormatter = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

const pesoWithCentavosFormatter = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

/** Formats an amount as pesos, e.g. 84200 → "₱84,200". */
export function formatCurrency(amount: number, withCentavos = false) {
    return withCentavos
        ? pesoWithCentavosFormatter.format(amount)
        : pesoFormatter.format(amount);
}
