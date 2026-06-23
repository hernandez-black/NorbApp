// src/utils/generarPDF.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { RowInput } from 'jspdf-autotable';
import type { Orden } from '../types';

/**
 * Genera un PDF con el resumen de la orden de servicio
 */
export const generarPDFOrden = (orden: Orden) => {
  const doc = new jsPDF('p', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  // 🔥 FECHA ACTUAL (cuando se genera el PDF)
  const fechaActual = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Título
  doc.setFontSize(20);
  doc.text(`Orden de Servicio: ${orden.numero}`, pageWidth / 2, 50, { align: 'center' });
  
  // 🔥 Fecha de generación del PDF (no la de la orden)
  doc.setFontSize(10);
  doc.text(`Fecha: ${fechaActual}`, pageWidth - margin, 50, { align: 'right' });

  let y = 90;

  doc.setFontSize(10);
doc.text(`Tipo: ${orden.tipo || 'No especificado'}`, pageWidth / 2, 70, { align: 'center' });

  // ─── Datos del cliente ───
  doc.setFontSize(14);
  doc.text('Datos del Cliente', margin, y);
  y += 20;
  doc.setFontSize(10);
  doc.text(`Nombre: ${orden.cliente?.nombre || '—'}`, margin, y);
  y += 16;
  doc.text(`Teléfono: ${orden.cliente?.telefono || '—'}`, margin, y);
  y += 16;
  doc.text(`Correo: ${orden.cliente?.correo || '—'}`, margin, y);
  y += 16;
  doc.text(`Tipo: ${orden.cliente?.tipo || '—'}`, margin, y);
  y += 20;

  // ─── Datos del vehículo ───
  doc.setFontSize(14);
  doc.text('Datos del Vehículo', margin, y);
  y += 20;
  doc.setFontSize(10);
  doc.text(`Marca/Modelo: ${orden.vehiculo?.marca} ${orden.vehiculo?.modelo}`, margin, y);
  y += 16;
  doc.text(`Año/Color: ${orden.vehiculo?.anio} / ${orden.vehiculo?.color}`, margin, y);
  y += 16;
  doc.text(`Placas: ${orden.vehiculo?.placas}`, margin, y);
  y += 16;
  doc.text(`Kilometraje: ${orden.vehiculo?.kilometraje?.toLocaleString()} km`, margin, y);
  y += 16;
  doc.text(`VIN: ${orden.vehiculo?.vin || '—'}`, margin, y);
  y += 20;

  // ─── Motivo de ingreso ───
  doc.setFontSize(14);
  doc.text('Motivo de Ingreso', margin, y);
  y += 20;
  doc.setFontSize(10);
  const motivoLines = doc.splitTextToSize(orden.motivo_ingreso || '—', pageWidth - margin * 2);
  doc.text(motivoLines, margin, y);
  y += motivoLines.length * 16 + 20;

  // ─── Cotización ───
  doc.setFontSize(14);
  doc.text('Cotización', margin, y);
  y += 16;

  const items = orden.cotizacion?.items || [];
  
  // 🔥 TIPO CORREGIDO: usamos RowInput[] (el tipo que espera autoTable)
  const tableBody: RowInput[] = items.map(item => [
    item.descripcion,
    item.cantidad,
    `$${item.costo_unitario}`,
    `$${item.total}`
  ]);

  // 🔥 MEJORA: concepto de mano de obra sin emoji, con texto limpio
  if (orden.cotizacion?.concepto_mano_obra) {
    const concepto = orden.cotizacion.concepto_mano_obra.trim();
    tableBody.push([
      concepto || 'Mano de obra',
      '',
      '',
      `$${orden.cotizacion.costo_mano_obra}`
    ]);
  }

  // Total (con colSpan)
  tableBody.push([
    { content: 'TOTAL', colSpan: 3, styles: { fontStyle: 'bold' } },
    `$${orden.cotizacion?.total || 0}`
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Concepto', 'Cant.', 'Costo Unit.', 'Total']],
    body: tableBody,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
    margin: { left: margin, right: margin },
  });

  doc.save(`Orden_${orden.numero}.pdf`);
};

/**
 * Genera un PDF con la carta compromiso
 */
export const generarPDFCartaCompromiso = (orden: Orden, nombreCliente: string) => {
  const doc = new jsPDF('p', 'pt', 'a4');
  const margin = 50;
  const pageWidth = doc.internal.pageSize.getWidth();

  // 🔥 FECHA ACTUAL para la carta
  const fechaActual = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  doc.setFontSize(22);
  doc.text('CARTA COMPROMISO', pageWidth / 2, 60, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Fecha: ${fechaActual}`, margin, 100);

  const y = 130;

  const texto = [
    `Por medio de la presente, el cliente ${nombreCliente} (en adelante "El Cliente") manifiesta su conformidad y aceptación para que el taller NorbApp realice los trabajos de reparación y/o mantenimiento en el vehículo con placas ${orden.vehiculo?.placas || '—'}, modelo ${orden.vehiculo?.marca} ${orden.vehiculo?.modelo} ${orden.vehiculo?.anio || ''}.`,
    '',
    'El Cliente declara que ha sido informado de las fallas detectadas, el diagnóstico realizado y el costo estimado de la reparación, el cual asciende a:',
    '',
    `      $${orden.cotizacion?.total || 0} (${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(orden.cotizacion?.total || 0)})`,
    '',
    'Asimismo, se compromete a pagar el saldo pendiente al momento de la entrega del vehículo. El taller se compromete a realizar los trabajos con la calidad y profesionalismo que lo caracterizan.',
    '',
    'El Cliente autoriza al taller a realizar las reparaciones descritas en la cotización y declara estar de acuerdo con los términos aquí establecidos.',
    '',
    `Atentamente,`,
    '',
    `Firma del cliente: _______________________`,
    `Nombre: ${nombreCliente}`,
    `Fecha: ${fechaActual}`,
  ];

  doc.setFontSize(11);
  const lines = doc.splitTextToSize(texto.join('\n'), pageWidth - margin * 2);
  doc.text(lines, margin, y);

  doc.save(`Carta_Compromiso_${orden.numero}.pdf`);
};