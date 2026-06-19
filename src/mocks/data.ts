import type { Cliente, Vehiculo, Usuario } from '../types';

export const clientesMock: Cliente[] = [
  { id: "1", nombre: "Carlos Ramírez", telefono: "555-123-4567", correo: "carlos@mail.com", tipo: "particular", creado_en: "01/01/2025" },
  { id: "2", nombre: "María López", telefono: "555-234-5678", correo: "maria@mail.com", tipo: "particular", creado_en: "15/02/2025" },
  { id: "3", nombre: "Transportes RSA", telefono: "555-345-6789", correo: "rsa@empresa.com", tipo: "empresa", razon_social: "Transportes RSA S.A. de C.V.", rfc: "TRS123456ABC", creado_en: "10/03/2025" },
  { id: "4", nombre: "Ana Martínez", telefono: "555-456-7890", correo: "ana@mail.com", tipo: "particular", creado_en: "22/04/2025" },
  { id: "5", nombre: "Jorge Hernández", telefono: "555-567-8901", correo: "jorge@mail.com", tipo: "particular", creado_en: "05/05/2025" },
];

export const vehiculosMock: Vehiculo[] = [
  { id: "1", cliente_id: "1", marca: "Toyota", modelo: "Corolla", anio: 2020, color: "Blanco", placas: "ABC-123", kilometraje: 45000, vin: "1HGBH41JXMN109186", motor: "2.0L", cilindraje: "4 cilindros", creado_en: "08/06/2025" },
  { id: "2", cliente_id: "2", marca: "Nissan", modelo: "Sentra", anio: 2018, color: "Gris", placas: "DEF-456", kilometraje: 72000, vin: "3N1AB7AP0JY123456", motor: "1.8L", cilindraje: "4 cilindros", creado_en: "07/06/2025" },
  { id: "3", cliente_id: "3", marca: "Chevrolet", modelo: "Aveo", anio: 2019, color: "Rojo", placas: "GHI-789", kilometraje: 38000, vin: "", motor: "1.6L", cilindraje: "4 cilindros", creado_en: "06/06/2025" },
  { id: "4", cliente_id: "4", marca: "Volkswagen", modelo: "Jetta", anio: 2021, color: "Negro", placas: "JKL-012", kilometraje: 21000, vin: "3VW2B7AJ0MM123789", motor: "1.4T", cilindraje: "4 cilindros", creado_en: "05/06/2025" },
  { id: "5", cliente_id: "5", marca: "Ford", modelo: "Fiesta", anio: 2017, color: "Azul", placas: "MNO-345", kilometraje: 58000, vin: "3FADP4EJ6HM123456", motor: "1.6L", cilindraje: "4 cilindros", creado_en: "04/06/2025" },
];

export const usuariosMock: Usuario[] = [
  { id: "u1", nombre: "Pedro Recepción", email: "pedro@norba.com", rol: "recepcion", activo: true, creado_en: "2025-01-01" },
  { id: "u2", nombre: "Ana Recepcionista", email: "ana@norba.com", rol: "recepcion", activo: true, creado_en: "2025-01-01" },
  { id: "u3", nombre: "Carlos Admin", email: "carlos@norba.com", rol: "admin", activo: true, creado_en: "2025-01-01" },
  { id: "u4", nombre: "Juan Pérez", email: "juan@norba.com", rol: "mecanico", activo: true, creado_en: "2025-01-01" },
  { id: "u5", nombre: "Luis Torres", email: "luis@norba.com", rol: "mecanico", activo: true, creado_en: "2025-01-01" },
  { id: "u6", nombre: "Pedro Gómez", email: "pedro@norba.com", rol: "mecanico", activo: false, creado_en: "2025-01-01" },
];