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
  tipo?: string
  estado?: string
  created_at?: string
  updated_at?: string
}

// 🔹 Configuración de Supabase

export default function PanelLogistica() {
  const [tab, setTab] = useState<'envios' | 'reclamos' | 'cambios' | 'reenvios'>('envios')
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [nuevoPedido, setNuevoPedido] = useState<Pedido>({
    cliente: '',
    producto: '',
    calle: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    celular: '',
    email: '',
    numeroOrden: '',
    cambio: '',
    direccionNueva: '',
    cambioDireccion: false,
    motivo: '',
    tipo: 'envios',
  })

  // ✅ función para obtener pedidos según la pestaña
  const obtenerPedidos = useCallback(async () => {
    const { data, error } = await supabase
      .from('envios')
      .select('*')
      .eq('tipo', tab)
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error al obtener pedidos:', error)
    } else {
      setPedidos(data)
    }
  }, [tab])

  useEffect(() => {
    obtenerPedidos()
  }, [obtenerPedidos])

  // ✅ función corregida con nombres exactos según tu tabla
  const agregarPedido = async () => {
    const pedido = {
      cliente: nuevoPedido.cliente,
      producto: nuevoPedido.producto,
      calle: nuevoPedido.calle,
      ciudad: nuevoPedido.ciudad,
      provincia: nuevoPedido.provincia,
      codigopostal: nuevoPedido.codigoPostal, // 🔹 corregido
      celular: nuevoPedido.celular,
      email: nuevoPedido.email,
      numeroorden: nuevoPedido.numeroOrden, // 🔹 corregido
      cambio: nuevoPedido.cambio,
      direccionnueva: nuevoPedido.direccionNueva, // 🔹 corregido
      cambiodireccion: nuevoPedido.cambioDireccion, // 🔹 corregido
      motivo: nuevoPedido.motivo,
      tipo: tab,
      estado: 'pendiente',
      created_at: new Date(),
    }

    console.log('📦 Enviando a Supabase:', pedido)

    const { error } = await supabase.from('envios').insert(pedido)

    if (error) {
      console.error('❌ Error de Supabase:', error)
      alert('Error al agregar el pedido: ' + error.message)
    } else {
      console.log('✅ Pedido agregado correctamente')

      setNuevoPedido({
        cliente: '',
        producto: '',
        calle: '',
        ciudad: '',
        provincia: '',
        codigoPostal: '',
        celular: '',
        email: '',
        numeroOrden: '',
        cambio: '',
        direccionNueva: '',
        cambioDireccion: false,
        motivo: '',
        tipo: tab,
      })

      obtenerPedidos()
    }
  }

  const marcarEnviado = async (id: string) => {
    const { error } = await supabase
      .from('envios')
      .update({ estado: 'enviado', updated_at: new Date() })
      .eq('id', id)

    if (error) console.error('❌ Error al marcar como enviado:', error)
    else obtenerPedidos()
  }

  // ✅ UI básica con formularios
  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Panel Logístico</h1>

      {/* Tabs simples */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['envios', 'reclamos', 'cambios', 'reenvios'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as 'envios' | 'reclamos' | 'cambios' | 'reenvios')}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              background: tab === t ? '#0070f3' : '#ccc',
              color: tab === t ? 'white' : 'black',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {t === 'envios' && 'Envíos fuera Tiendanube'}
            {t === 'reclamos' && 'Reclamos'}
            {t === 'cambios' && 'Cambios'}
            {t === 'reenvios' && 'Reenvíos'}
          </button>
        ))}
      </div>

      {/* Formulario */}
      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 20 }}>
        {tab === 'envios' && (
          <>
            <input placeholder="Nombre Cliente" value={nuevoPedido.cliente} onChange={(e) => setNuevoPedido({ ...nuevoPedido, cliente: e.target.value })} />
            <input placeholder="Producto" value={nuevoPedido.producto} onChange={(e) => setNuevoPedido({ ...nuevoPedido, producto: e.target.value })} />
            <input placeholder="Calle y número piso/depto" value={nuevoPedido.calle} onChange={(e) => setNuevoPedido({ ...nuevoPedido, calle: e.target.value })} />
            <input placeholder="Ciudad" value={nuevoPedido.ciudad} onChange={(e) => setNuevoPedido({ ...nuevoPedido, ciudad: e.target.value })} />
            <input placeholder="Provincia" value={nuevoPedido.provincia} onChange={(e) => setNuevoPedido({ ...nuevoPedido, provincia: e.target.value })} />
            <input placeholder="Código postal" value={nuevoPedido.codigoPostal} onChange={(e) => setNuevoPedido({ ...nuevoPedido, codigoPostal: e.target.value })} />
            <input placeholder="Celular" value={nuevoPedido.celular} onChange={(e) => setNuevoPedido({ ...nuevoPedido, celular: e.target.value })} />
            <input placeholder="Email" value={nuevoPedido.email} onChange={(e) => setNuevoPedido({ ...nuevoPedido, email: e.target.value })} />
          </>
        )}

        {tab === 'reclamos' && (
          <>
            <input placeholder="Número de Orden" value={nuevoPedido.numeroOrden} onChange={(e) => setNuevoPedido({ ...nuevoPedido, numeroOrden: e.target.value })} />
            <input placeholder="Motivo" value={nuevoPedido.motivo} onChange={(e) => setNuevoPedido({ ...nuevoPedido, motivo: e.target.value })} />
          </>
        )}

        {tab === 'cambios' && (
          <>
            <input placeholder="Número de Orden" value={nuevoPedido.numeroOrden} onChange={(e) => setNuevoPedido({ ...nuevoPedido, numeroOrden: e.target.value })} />
            <input placeholder="Cambio" value={nuevoPedido.cambio} onChange={(e) => setNuevoPedido({ ...nuevoPedido, cambio: e.target.value })} />
          </>
        )}

        {tab === 'reenvios' && (
          <>
            <input placeholder="Número de Orden" value={nuevoPedido.numeroOrden} onChange={(e) => setNuevoPedido({ ...nuevoPedido, numeroOrden: e.target.value })} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={nuevoPedido.cambioDireccion}
                onChange={(e) => setNuevoPedido({ ...nuevoPedido, cambioDireccion: e.target.checked })}
              />
              ¿Cambio de dirección?
            </label>
            {nuevoPedido.cambioDireccion && (
              <input placeholder="Dirección nueva" value={nuevoPedido.direccionNueva} onChange={(e) => setNuevoPedido({ ...nuevoPedido, direccionNueva: e.target.value })} />
            )}
          </>
        )}

        <button
          onClick={agregarPedido}
          style={{ width: '100%', marginTop: 10, padding: 10, borderRadius: 6, border: 'none', background: '#0070f3', color: 'white' }}
        >
          Agregar
        </button>
      </div>

   {/* Lista de pendientes */}
<h2 style={{ fontWeight: 600, marginBottom: 10 }}>Pendientes</h2>
{pedidos.length === 0 && <p>No hay registros pendientes.</p>}
{pedidos.map((p: any) => (
  <div
    key={p.id}
    style={{
      border: '1px solid #ddd',
      padding: 10,
      borderRadius: 8,
      marginBottom: 10,
      background: '#fafafa',
    }}
  >
    {/* 🔹 Encabezado dinámico según la pestaña */}
    <strong style={{ fontSize: 16 }}>
      {tab === 'envios'
        ? p.cliente || 'Cliente sin nombre'
        : p.numeroorden || 'Sin número de orden'}
    </strong>

    <div style={{ fontSize: 14, marginTop: 6 }}>
      {/* Envíos fuera Tiendanube */}
      {tab === 'envios' && (
        <>
          {p.producto && <p><b>Producto:</b> {p.producto}</p>}
          {p.calle && <p><b>Dirección:</b> {p.calle}</p>}
          {p.ciudad && <p><b>Ciudad:</b> {p.ciudad}</p>}
          {p.provincia && <p><b>Provincia:</b> {p.provincia}</p>}
          {p.codigopostal && <p><b>Código Postal:</b> {p.codigopostal}</p>}
          {p.celular && <p><b>Celular:</b> {p.celular}</p>}
          {p.email && <p><b>Email:</b> {p.email}</p>}
        </>
      )}

      {/* Reclamos */}
      {tab === 'reclamos' && (
        <>
          {p.numeroorden && <p><b>Número de orden:</b> {p.numeroorden}</p>}
          {p.motivo && <p><b>Motivo:</b> {p.motivo}</p>}
        </>
      )}

      {/* Cambios */}
      {tab === 'cambios' && (
        <>
          {p.numeroorden && <p><b>Número de orden:</b> {p.numeroorden}</p>}
          {p.cambio && <p><b>Cambio:</b> {p.cambio}</p>}
        </>
      )}

      {/* Reenvíos */}
      {tab === 'reenvios' && (
        <>
          {p.numeroorden && <p><b>Número de orden:</b> {p.numeroorden}</p>}
          {p.cambiodireccion !== undefined && (
            <p><b>Cambio de dirección:</b> {p.cambiodireccion ? 'Sí' : 'No'}</p>
          )}
          {p.direccionnueva && <p><b>Dirección nueva:</b> {p.direccionnueva}</p>}
        </>
      )}

      {/* Fecha */}
      {p.created_at && (
        <p style={{ color: '#777', fontSize: 12 }}>
          <b>Fecha:</b> {new Date(p.created_at).toLocaleString()}
        </p>
      )}
    </div>

    <button
      onClick={() => marcarEnviado(p.id!)}
      style={{
        marginTop: 8,
        padding: 8,
        borderRadius: 4,
        border: 'none',
        background: '#28a745',
        color: 'white',
        fontWeight: 500,
        width: '100%',
      }}
    >
      Marcar como Enviado
    </button>
  </div>
))}




    </div>
  )
}
