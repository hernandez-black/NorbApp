import { useState } from 'react';
import { useToast } from '../../context/useToast';
import type { Orden } from '../../types';

interface CartaCompromisoProps {
  orden: Orden;
  onFirmar: (nombre: string) => void;
  firmado?: boolean;
  nombreFirmado?: string;
}

export default function CartaCompromiso({
  onFirmar,
  firmado = false,
  nombreFirmado,
}: CartaCompromisoProps) {
  const { showToast } = useToast();
  const [nombre, setNombre] = useState('');
  const [acepto, setAcepto] = useState(false);

  const handleFirmar = () => {
    if (!nombre.trim()) {
      showToast('Por favor, ingresa tu nombre completo', 'error');
      return;
    }
    if (!acepto) {
      showToast('Debes aceptar los términos', 'error');
      return;
    }
    onFirmar(nombre.trim());
    showToast('Carta compromiso firmada correctamente', 'success');
  };

  return (
    <div className="panel-card">
      <h3 className="panel-card-title">Carta Compromiso</h3>
      {firmado ? (
        <div className="text-green-500">
          ✅ Firmado por: {nombreFirmado} el {new Date().toLocaleDateString('es-MX')}
        </div>
      ) : (
        <>
          <div className="bg-gray-800/20 p-4 rounded-lg text-sm text-gray-300 max-h-40 overflow-y-auto">
            <p className="text-justify">
              Los precios y tiempos pueden variar tras el desmontaje e inspección. Si se detectan daños adicionales o necesidad de reemplazar piezas, se notificará al cliente para su autorización. No nos hacemos responsables por objetos personales dentro del vehículo. Se recomienda retirarlos antes de dejar la unidad y revisar su estado al ingreso. Es responsabilidad del cliente comprobar el estado de su unidad, antes, durante y después del servicio brindado. En caso de que el cliente desee que se coloquen piezas externas a las que el taller designe, la garantía por parte del taller se perderá por completo. Una vez salida, entregada, liberada o simplemente que el cliente se lleve su unidad (andando, en grúa o en cualquier otra forma que el designe), incluyendo si el titular designó a un tercero, daremos por enterado que el cliente acepta las condiciones y el estado de su unidad, liberando de toda responsabilidad en ese momento a Grupo Norba y RSA asi como al titular o titulares, siendo responsable a partir de este momento al dueño de la unidad. La solicitud de factura debe hacerse al momento. Al aceptar la cotización el cliente entiende y acepta los términos y condiciones. Agradecemos su comprensión y confianza.
            </p>
          </div>
          <div className="form-group">
            <label className="form-label">Nombre del cliente *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="form-input"
              placeholder="Escribe tu nombre completo"
            />
          </div>
          <div className="form-group">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={acepto}
                onChange={(e) => setAcepto(e.target.checked)}
              />
              Acepto los términos y condiciones
            </label>
          </div>
          <button className="btn-primary" onClick={handleFirmar}>
            Firmar carta compromiso
          </button>
        </>
      )}
    </div>
  );
}