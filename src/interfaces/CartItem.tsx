import { VariantType } from "./VariantType";

export interface CartItem {
    id: string;
    nombre: string;
    precio: number;
    cantidad: number;
    imagen: string;
    variant?: VariantType;
  }