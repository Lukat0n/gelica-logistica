'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'

// 🔹 Tipo de datos para tus pedidos
type Pedido = {
  id?: string
  cliente?: string
  producto?: string
  calle?: string
  ciudad?: string
  provincia?: string
  codigoPostal?: string
  celular?: string
  email?: string
  numeroOrden?: string
  cambio?: string
  direccionNueva?: string
  cambioDireccion?: boolean
  motivo?: string
  solucion?: string
  foto_producto?: string
  foto_etiqueta?: string
  tipo?: string
  estado?: string
  created_at?: string
  updated_at?: string
}

// 🎨 Colores por tipo de pedido
const coloresPorTipo = {
  envios: { bg: '#E3F2FD', border: '#2196F3', text: '#1565C0' },      // Azul
  reclamos: { bg: '#FFEBEE', border: '#F44336', text: '#C62828' },    // Rojo
  cambios: { bg: '#FFF3E0', border: '#FF9800', text: '#E65100' },     // Naranja
  reenvios: { bg: '#F3E5F5', border: '#9C27B0', text: '#6A1B9A' }     // Morado
}

export default function PanelLogistica() {
  // Estados principales
  const [vistaActual, setVistaActual] = useState<'lista' | 'historial' | 'formularios'>('lista')
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [pedidosCompletados, setPedidosCompletados] = useState<Pedido[]>([])
  
  // Estados para formularios
  const [formEnvios, setFormEnvios] = useState({
    cliente: '', producto: '', calle: '', ciudad: '', provincia: '', 
    codigoPostal: '', celular: '', email: ''
  })
  const [formReclamos, setFormReclamos] = useState({ numeroOrden: '', motivo: '', solucion: '' })
  const [formCambios, setFormCambios] = useState({ numeroOrden: '', cambio: '', solucion: '' })
  const [formReenvios, setFormReenvios] = useState({ 
    numeroOrden: '', cambioDireccion: false, direccionNueva: '', solucion: '' 
  })

  // Obtener todos los pedidos pendientes
  const obtenerPedidos = useCallback(async () => {
    const { data, error } = await supabase
      .from('envios')
      .select('*')
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error al obtener pedidos:', error)
    } else {
      setPedidos(data || [])
    }
  }, [])

  // Obtener pedidos completados
  const obtenerCompletados = useCallback(async () => {
    const { data, error } = await supabase
      .from('envios')
      .select('*')
      .eq('estado', 'enviado')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('❌ Error al obtener completados:', error)
    } else {
      setPedidosCompletados(data || [])
    }
  }, [])

  useEffect(() => {
    obtenerPedidos()
    obtenerCompletados()
  }, [obtenerPedidos, obtenerCompletados])

  // Agregar pedido de envíos
  const agregarEnvio = async () => {
    const pedido = {
      cliente: formEnvios.cliente,
      producto: formEnvios.producto,
      calle: formEnvios.calle,
      ciudad: formEnvios.ciudad,
      provincia: formEnvios.provincia,
      codigopostal: formEnvios.codigoPostal,
      celular: formEnvios.celular,
      email: formEnvios.email,
      tipo: 'envios',
      estado: 'pendiente',
      created_at: new Date(),
    }

    const { error } = await supabase.from('envios').insert(pedido)

    if (error) {
      alert('Error al agregar el pedido: ' + error.message)
    } else {
      setFormEnvios({ cliente: '', producto: '', calle: '', ciudad: '', provincia: '', 
        codigoPostal: '', celular: '', email: '' })
      obtenerPedidos()
      alert('✅ Envío agregado correctamente')
    }
  }

  // Agregar reclamo
  const agregarReclamo = async () => {
    const pedido = {
      numeroorden: formReclamos.numeroOrden,
      motivo: formReclamos.motivo,
      solucion: formReclamos.solucion,
      tipo: 'reclamos',
      estado: 'pendiente',
      created_at: new Date(),
    }

    const { error } = await supabase.from('envios').insert(pedido)

    if (error) {
      alert('Error al agregar el reclamo: ' + error.message)
    } else {
      setFormReclamos({ numeroOrden: '', motivo: '', solucion: '' })
      obtenerPedidos()
      alert('✅ Reclamo agregado correctamente')
    }
  }

  // Agregar cambio
  const agregarCambio = async () => {
    const pedido = {
      numeroorden: formCambios.numeroOrden,
      cambio: formCambios.cambio,
      solucion: formCambios.solucion,
      tipo: 'cambios',
      estado: 'pendiente',
      created_at: new Date(),
    }

    const { error } = await supabase.from('envios').insert(pedido)

    if (error) {
      alert('Error al agregar el cambio: ' + error.message)
    } else {
      setFormCambios({ numeroOrden: '', cambio: '', solucion: '' })
      obtenerPedidos()
      alert('✅ Cambio agregado correctamente')
    }
  }

  // Agregar reenvío
  const agregarReenvio = async () => {
    const pedido = {
      numeroorden: formReenvios.numeroOrden,
      cambiodireccion: formReenvios.cambioDireccion,
      direccionnueva: formReenvios.direccionNueva,
      solucion: formReenvios.solucion,
      tipo: 'reenvios',
      estado: 'pendiente',
      created_at: new Date(),
    }

    const { error } = await supabase.from('envios').insert(pedido)

    if (error) {
      alert('Error al agregar el reenvío: ' + error.message)
    } else {
      setFormReenvios({ numeroOrden: '', cambioDireccion: false, direccionNueva: '', solucion: '' })
      obtenerPedidos()
      alert('✅ Reenvío agregado correctamente')
    }
  }

  // Marcar como completado
  const marcarEnviado = async (id: string) => {
    const { error } = await supabase
      .from('envios')
      .update({ estado: 'enviado', updated_at: new Date() })
      .eq('id', id)

    if (error) {
      console.error('❌ Error al marcar como enviado:', error)
    } else {
      obtenerPedidos()
      obtenerCompletados()
    }
  }

  // Deshacer completado
  const deshacerCompletado = async (id: string) => {
    const { error } = await supabase
      .from('envios')
      .update({ estado: 'pendiente', updated_at: new Date() })
      .eq('id', id)

    if (error) {
      console.error('❌ Error al deshacer completado:', error)
    } else {
      obtenerPedidos()
      obtenerCompletados()
    }
  }

  // Renderizar tarjeta de pedido
  const renderPedido = (p: any, esCompletado = false) => {
    const colores = coloresPorTipo[p.tipo as keyof typeof coloresPorTipo] || coloresPorTipo.envios
    
    return (
      <div
        key={p.id}
        style={{
          border: `2px solid ${colores.border}`,
          padding: 14,
          borderRadius: 8,
          marginBottom: 12,
          background: colores.bg,
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 8 
        }}>
          <strong style={{ fontSize: 16, color: colores.text }}>
            {p.tipo === 'envios' ? p.cliente || 'Cliente sin nombre' : p.numeroorden || 'Sin número de orden'}
          </strong>
          <span style={{ 
            fontSize: 12, 
            fontWeight: 600, 
            color: colores.text,
            textTransform: 'uppercase' 
          }}>
            {p.tipo === 'envios' && '📦 Envío'}
            {p.tipo === 'reclamos' && '⚠️ Reclamo'}
            {p.tipo === 'cambios' && '🔄 Cambio'}
            {p.tipo === 'reenvios' && '↩️ Reenvío'}
          </span>
        </div>

        <div style={{ fontSize: 14, marginTop: 6 }}>
          {p.tipo === 'envios' && (
            <>
              {p.producto && <p style={{ margin: '4px 0' }}><b>Producto:</b> {p.producto}</p>}
              {p.calle && <p style={{ margin: '4px 0' }}><b>Dirección:</b> {p.calle}</p>}
              {p.ciudad && <p style={{ margin: '4px 0' }}><b>Ciudad:</b> {p.ciudad}</p>}
              {p.provincia && <p style={{ margin: '4px 0' }}><b>Provincia:</b> {p.provincia}</p>}
              {p.codigopostal && <p style={{ margin: '4px 0' }}><b>CP:</b> {p.codigopostal}</p>}
              {p.celular && <p style={{ margin: '4px 0' }}><b>Celular:</b> {p.celular}</p>}
              {p.email && <p style={{ margin: '4px 0' }}><b>Email:</b> {p.email}</p>}
            </>
          )}

          {p.tipo === 'reclamos' && (
            <>
              {p.numeroorden && <p style={{ margin: '4px 0' }}><b>Orden:</b> {p.numeroorden}</p>}
              {p.motivo && (
                <div style={{ margin: '8px 0', padding: '8px', background: 'rgba(0,0,0,0.03)', borderRadius: '4px' }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#C62828' }}>Motivo:</p>
                  <p style={{ margin: 0 }}>{p.motivo}</p>
                </div>
              )}
              {p.solucion && (
                <div style={{ margin: '8px 0', padding: '8px', background: 'rgba(76,175,80,0.1)', borderRadius: '4px' }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#2E7D32' }}>Solución:</p>
                  <p style={{ margin: 0 }}>{p.solucion}</p>
                </div>
              )}
              {(p.foto_producto || p.foto_etiqueta) && (
                <div style={{ margin: '12px 0' }}>
                  <p style={{ fontWeight: 600, marginBottom: 8 }}>📷 Fotos adjuntas:</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {p.foto_producto && (
                      <a href={p.foto_producto} target="_blank" rel="noopener noreferrer" style={{ 
                        display: 'block',
                        border: '2px solid #ddd',
                        borderRadius: 8,
                        overflow: 'hidden',
                        width: 120,
                        height: 120,
                        textDecoration: 'none'
                      }}>
                        <img 
                          src={p.foto_producto} 
                          alt="Producto" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </a>
                    )}
                    {p.foto_etiqueta && (
                      <a href={p.foto_etiqueta} target="_blank" rel="noopener noreferrer" style={{ 
                        display: 'block',
                        border: '2px solid #ddd',
                        borderRadius: 8,
                        overflow: 'hidden',
                        width: 120,
                        height: 120,
                        textDecoration: 'none'
                      }}>
                        <img 
                          src={p.foto_etiqueta} 
                          alt="Etiqueta" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {p.tipo === 'cambios' && (
            <>
              {p.numeroorden && <p style={{ margin: '4px 0' }}><b>Orden:</b> {p.numeroorden}</p>}
              {p.cambio && (
                <div style={{ margin: '8px 0', padding: '8px', background: 'rgba(0,0,0,0.03)', borderRadius: '4px' }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#E65100' }}>Cambio:</p>
                  <p style={{ margin: 0 }}>{p.cambio}</p>
                </div>
              )}
              {p.solucion && (
                <div style={{ margin: '8px 0', padding: '8px', background: 'rgba(76,175,80,0.1)', borderRadius: '4px' }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#2E7D32' }}>Solución:</p>
                  <p style={{ margin: 0 }}>{p.solucion}</p>
                </div>
              )}
            </>
          )}

          {p.tipo === 'reenvios' && (
            <>
              {p.numeroorden && <p style={{ margin: '4px 0' }}><b>Orden:</b> {p.numeroorden}</p>}
              {p.cambiodireccion !== undefined && (
                <p style={{ margin: '4px 0' }}><b>Cambio dirección:</b> {p.cambiodireccion ? 'Sí' : 'No'}</p>
              )}
              {p.direccionnueva && <p style={{ margin: '4px 0' }}><b>Nueva dirección:</b> {p.direccionnueva}</p>}
              {p.solucion && (
                <div style={{ margin: '8px 0', padding: '8px', background: 'rgba(76,175,80,0.1)', borderRadius: '4px' }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#2E7D32' }}>Solución:</p>
                  <p style={{ margin: 0 }}>{p.solucion}</p>
                </div>
              )}
            </>
          )}

          {p.created_at && (
            <p style={{ color: '#666', fontSize: 12, marginTop: 8 }}>
              <b>Fecha:</b> {new Date(p.created_at).toLocaleString('es-ES')}
            </p>
          )}
        </div>

        <button
          onClick={() => esCompletado ? deshacerCompletado(p.id) : marcarEnviado(p.id)}
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 6,
            border: 'none',
            background: esCompletado ? '#FF9800' : '#28a745',
            color: 'white',
            fontWeight: 600,
            width: '100%',
            cursor: 'pointer',
          }}
        >
          {esCompletado ? '↩️ Deshacer completado' : '✅ Marcar como completado'}
        </button>
      </div>
    )
  }

  // Estilos de input
  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header con navegación */}
      <div style={{ 
        background: 'white', 
        padding: '16px 24px', 
        borderBottom: '2px solid #e0e0e0',
        marginBottom: 20 
      }}>
        <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 16, color: '#333' }}>
          Panel Logístico Gelica
        </h1>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setVistaActual('lista')}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              background: vistaActual === 'lista' ? '#2196F3' : '#e0e0e0',
              color: vistaActual === 'lista' ? 'white' : '#333',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            📋 Lista de Pedidos
          </button>
          <button
            onClick={() => setVistaActual('historial')}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              background: vistaActual === 'historial' ? '#2196F3' : '#e0e0e0',
              color: vistaActual === 'historial' ? 'white' : '#333',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            📜 Historial
          </button>
          <button
            onClick={() => setVistaActual('formularios')}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              background: vistaActual === 'formularios' ? '#2196F3' : '#e0e0e0',
              color: vistaActual === 'formularios' ? 'white' : '#333',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            ➕ Agregar Pedidos
          </button>
        </div>
      </div>

      <div style={{ padding: '0 24px', maxWidth: 1200, margin: '0 auto' }}>
        {/* VISTA: Lista de Pedidos */}
        {vistaActual === 'lista' && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#333' }}>
              Pedidos Pendientes ({pedidos.length})
            </h2>
            
            <div style={{ 
              maxHeight: 'calc(100vh - 200px)', 
              overflowY: 'auto',
              paddingRight: 8 
            }}>
              {pedidos.length === 0 && (
                <p style={{ textAlign: 'center', color: '#999', padding: 40 }}>
                  No hay pedidos pendientes
                </p>
              )}
              {pedidos.map((p) => renderPedido(p))}
            </div>
          </div>
        )}

        {/* VISTA: Historial */}
        {vistaActual === 'historial' && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#333' }}>
              Historial de Completados ({pedidosCompletados.length})
            </h2>
            
            <div style={{ 
              maxHeight: 'calc(100vh - 200px)', 
              overflowY: 'auto',
              paddingRight: 8 
            }}>
              {pedidosCompletados.length === 0 && (
                <p style={{ textAlign: 'center', color: '#999', padding: 40 }}>
                  No hay pedidos completados
                </p>
              )}
              {pedidosCompletados.map((p) => renderPedido(p, true))}
            </div>
          </div>
        )}

        {/* VISTA: Formularios */}
        {vistaActual === 'formularios' && (
          <div style={{ 
            maxHeight: 'calc(100vh - 200px)', 
            overflowY: 'auto',
            paddingRight: 8 
          }}>
            {/* Formulario Envíos */}
            <div style={{ 
              background: coloresPorTipo.envios.bg, 
              border: `2px solid ${coloresPorTipo.envios.border}`,
              borderRadius: 12, 
              padding: 20, 
              marginBottom: 24 
            }}>
              <h3 style={{ 
                fontSize: 20, 
                fontWeight: 600, 
                marginBottom: 16,
                color: coloresPorTipo.envios.text 
              }}>
                📦 Envíos fuera Tiendanube
              </h3>
              <input 
                style={inputStyle} 
                placeholder="Nombre Cliente" 
                value={formEnvios.cliente} 
                onChange={(e) => setFormEnvios({ ...formEnvios, cliente: e.target.value })} 
              />
              <input 
                style={inputStyle} 
                placeholder="Producto" 
                value={formEnvios.producto} 
                onChange={(e) => setFormEnvios({ ...formEnvios, producto: e.target.value })} 
              />
              <input 
                style={inputStyle} 
                placeholder="Calle y número piso/depto" 
                value={formEnvios.calle} 
                onChange={(e) => setFormEnvios({ ...formEnvios, calle: e.target.value })} 
              />
              <input 
                style={inputStyle} 
                placeholder="Ciudad" 
                value={formEnvios.ciudad} 
                onChange={(e) => setFormEnvios({ ...formEnvios, ciudad: e.target.value })} 
              />
              <input 
                style={inputStyle} 
                placeholder="Provincia" 
                value={formEnvios.provincia} 
                onChange={(e) => setFormEnvios({ ...formEnvios, provincia: e.target.value })} 
              />
              <input 
                style={inputStyle} 
                placeholder="Código postal" 
                value={formEnvios.codigoPostal} 
                onChange={(e) => setFormEnvios({ ...formEnvios, codigoPostal: e.target.value })} 
              />
              <input 
                style={inputStyle} 
                placeholder="Celular" 
                value={formEnvios.celular} 
                onChange={(e) => setFormEnvios({ ...formEnvios, celular: e.target.value })} 
              />
              <input 
                style={inputStyle} 
                placeholder="Email" 
                value={formEnvios.email} 
                onChange={(e) => setFormEnvios({ ...formEnvios, email: e.target.value })} 
              />
              <button
                onClick={agregarEnvio}
                style={{ 
                  width: '100%', 
                  padding: 12, 
                  borderRadius: 8, 
                  border: 'none', 
                  background: coloresPorTipo.envios.border, 
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: 'pointer'
                }}
              >
                Agregar Envío
              </button>
            </div>

            {/* Formulario Reclamos */}
            <div style={{ 
              background: coloresPorTipo.reclamos.bg, 
              border: `2px solid ${coloresPorTipo.reclamos.border}`,
              borderRadius: 12, 
              padding: 20, 
              marginBottom: 24 
            }}>
              <h3 style={{ 
                fontSize: 20, 
                fontWeight: 600, 
                marginBottom: 16,
                color: coloresPorTipo.reclamos.text 
              }}>
                ⚠️ Reclamos
              </h3>
              <input 
                style={inputStyle} 
                placeholder="Número de Orden" 
                value={formReclamos.numeroOrden} 
                onChange={(e) => setFormReclamos({ ...formReclamos, numeroOrden: e.target.value })} 
              />
              <textarea
                style={{...inputStyle, minHeight: '80px', resize: 'vertical'}} 
                placeholder="Motivo del reclamo" 
                value={formReclamos.motivo} 
                onChange={(e) => setFormReclamos({ ...formReclamos, motivo: e.target.value })} 
              />
              <textarea
                style={{...inputStyle, minHeight: '80px', resize: 'vertical', background: 'rgba(76,175,80,0.05)'}} 
                placeholder="Solución (opcional)" 
                value={formReclamos.solucion} 
                onChange={(e) => setFormReclamos({ ...formReclamos, solucion: e.target.value })} 
              />
              <button
                onClick={agregarReclamo}
                style={{ 
                  width: '100%', 
                  padding: 12, 
                  borderRadius: 8, 
                  border: 'none', 
                  background: coloresPorTipo.reclamos.border, 
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: 'pointer'
                }}
              >
                Agregar Reclamo
              </button>
            </div>

            {/* Formulario Cambios */}
            <div style={{ 
              background: coloresPorTipo.cambios.bg, 
              border: `2px solid ${coloresPorTipo.cambios.border}`,
              borderRadius: 12, 
              padding: 20, 
              marginBottom: 24 
            }}>
              <h3 style={{ 
                fontSize: 20, 
                fontWeight: 600, 
                marginBottom: 16,
                color: coloresPorTipo.cambios.text 
              }}>
                🔄 Cambios
              </h3>
              <input 
                style={inputStyle} 
                placeholder="Número de Orden" 
                value={formCambios.numeroOrden} 
                onChange={(e) => setFormCambios({ ...formCambios, numeroOrden: e.target.value })} 
              />
              <textarea
                style={{...inputStyle, minHeight: '80px', resize: 'vertical'}} 
                placeholder="Detalle del cambio" 
                value={formCambios.cambio} 
                onChange={(e) => setFormCambios({ ...formCambios, cambio: e.target.value })} 
              />
              <textarea
                style={{...inputStyle, minHeight: '80px', resize: 'vertical', background: 'rgba(76,175,80,0.05)'}} 
                placeholder="Solución (opcional)" 
                value={formCambios.solucion} 
                onChange={(e) => setFormCambios({ ...formCambios, solucion: e.target.value })} 
              />
              <button
                onClick={agregarCambio}
                style={{ 
                  width: '100%', 
                  padding: 12, 
                  borderRadius: 8, 
                  border: 'none', 
                  background: coloresPorTipo.cambios.border, 
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: 'pointer'
                }}
              >
                Agregar Cambio
              </button>
            </div>

            {/* Formulario Reenvíos */}
            <div style={{ 
              background: coloresPorTipo.reenvios.bg, 
              border: `2px solid ${coloresPorTipo.reenvios.border}`,
              borderRadius: 12, 
              padding: 20, 
              marginBottom: 24 
            }}>
              <h3 style={{ 
                fontSize: 20, 
                fontWeight: 600, 
                marginBottom: 16,
                color: coloresPorTipo.reenvios.text 
              }}>
                ↩️ Reenvíos
              </h3>
              <input 
                style={inputStyle} 
                placeholder="Número de Orden" 
                value={formReenvios.numeroOrden} 
                onChange={(e) => setFormReenvios({ ...formReenvios, numeroOrden: e.target.value })} 
              />
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                marginBottom: 10,
                fontSize: 14,
                fontWeight: 500 
              }}>
                <input
                  type="checkbox"
                  checked={formReenvios.cambioDireccion}
                  onChange={(e) => setFormReenvios({ ...formReenvios, cambioDireccion: e.target.checked })}
                  style={{ width: 18, height: 18 }}
                />
                ¿Cambio de dirección?
              </label>
              {formReenvios.cambioDireccion && (
                <input 
                  style={inputStyle} 
                  placeholder="Dirección nueva" 
                  value={formReenvios.direccionNueva} 
                  onChange={(e) => setFormReenvios({ ...formReenvios, direccionNueva: e.target.value })} 
                />
              )}
              <textarea
                style={{...inputStyle, minHeight: '80px', resize: 'vertical', background: 'rgba(76,175,80,0.05)'}} 
                placeholder="Solución (opcional)" 
                value={formReenvios.solucion} 
                onChange={(e) => setFormReenvios({ ...formReenvios, solucion: e.target.value })} 
              />
              <button
                onClick={agregarReenvio}
                style={{ 
                  width: '100%', 
                  padding: 12, 
                  borderRadius: 8, 
                  border: 'none', 
                  background: coloresPorTipo.reenvios.border, 
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: 'pointer'
                }}
              >
                Agregar Reenvío
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
