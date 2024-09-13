import { VariantType } from "./VariantType";

export interface ProductoType {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  category: string;
  stock?: number;
  variants?: VariantType[];
}
