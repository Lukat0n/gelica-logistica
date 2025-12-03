'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ReclamoCliente() {
  const [formulario, setFormulario] = useState({
    numeroCompra: '',
    motivo: '',
    fotoProducto: null as File | null,
    fotoEtiqueta: null as File | null,
  })
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, tipo: 'producto' | 'etiqueta') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida')
        return
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no puede superar 5MB')
        return
      }

      if (tipo === 'producto') {
        setFormulario({ ...formulario, fotoProducto: file })
      } else {
        setFormulario({ ...formulario, fotoEtiqueta: file })
      }
    }
  }

  const subirImagen = async (file: File, nombreArchivo: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('reclamos')
        .upload(`${Date.now()}_${nombreArchivo}`, file)

      if (error) throw error

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('reclamos')
        .getPublicUrl(data.path)

      return urlData.publicUrl
    } catch (error) {
      console.error('Error al subir imagen:', error)
      return null
    }
  }

  const enviarReclamo = async () => {
    // Validaciones
    if (!formulario.numeroCompra.trim()) {
      alert('Por favor ingresa el número de compra')
      return
    }

    if (!formulario.motivo.trim()) {
      alert('Por favor describe el motivo del reclamo')
      return
    }

    if (!formulario.fotoProducto) {
      alert('Por favor adjunta una foto del producto')
      return
    }

    if (!formulario.fotoEtiqueta) {
      alert('Por favor adjunta una foto de la etiqueta del envío')
      return
    }

    setEnviando(true)
    setMensaje('')

    try {
      // Subir imágenes
      const urlProducto = await subirImagen(formulario.fotoProducto, 'producto.jpg')
      const urlEtiqueta = await subirImagen(formulario.fotoEtiqueta, 'etiqueta.jpg')

      if (!urlProducto || !urlEtiqueta) {
        throw new Error('Error al subir las imágenes')
      }

      // Guardar reclamo en la base de datos
      const { error } = await supabase.from('envios').insert({
        numeroorden: formulario.numeroCompra,
        motivo: formulario.motivo,
        foto_producto: urlProducto,
        foto_etiqueta: urlEtiqueta,
        tipo: 'reclamos',
        estado: 'pendiente',
        created_at: new Date(),
      })

      if (error) throw error

      // Limpiar formulario
      setFormulario({
        numeroCompra: '',
        motivo: '',
        fotoProducto: null,
        fotoEtiqueta: null,
      })

      // Limpiar inputs de archivo
      const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>
      fileInputs.forEach(input => input.value = '')

      setMensaje('✅ Reclamo enviado correctamente. Te contactaremos pronto.')
    } catch (error: any) {
      console.error('Error:', error)
      setMensaje('❌ Error al enviar el reclamo: ' + error.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ 
        maxWidth: 600, 
        margin: '0 auto', 
        background: 'white', 
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{ 
          fontSize: 32, 
          fontWeight: 'bold', 
          marginBottom: 12,
          color: '#333',
          textAlign: 'center'
        }}>
          Formulario de Reclamo
        </h1>
        <p style={{ 
          textAlign: 'center', 
          color: '#666', 
          marginBottom: 32,
          fontSize: 16
        }}>
          Completa todos los campos para procesar tu reclamo
        </p>

        {/* Número de Compra */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ 
            display: 'block', 
            fontWeight: 600, 
            marginBottom: 8,
            color: '#333',
            fontSize: 15
          }}>
            Número de compra <span style={{ color: '#F44336' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Ejemplo: #6700"
            value={formulario.numeroCompra}
            onChange={(e) => setFormulario({ ...formulario, numeroCompra: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e0e0e0',
              borderRadius: 8,
              fontSize: 16,
              transition: 'border-color 0.3s',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>

        {/* Motivo del Reclamo */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ 
            display: 'block', 
            fontWeight: 600, 
            marginBottom: 8,
            color: '#333',
            fontSize: 15
          }}>
            Motivo del reclamo <span style={{ color: '#F44336' }}>*</span>
          </label>
          <textarea
            placeholder="Describe detalladamente el motivo de tu reclamo..."
            value={formulario.motivo}
            onChange={(e) => setFormulario({ ...formulario, motivo: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e0e0e0',
              borderRadius: 8,
              fontSize: 16,
              minHeight: 120,
              resize: 'vertical',
              fontFamily: 'inherit',
              transition: 'border-color 0.3s',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>

        {/* Foto del Producto */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ 
            display: 'block', 
            fontWeight: 600, 
            marginBottom: 8,
            color: '#333',
            fontSize: 15
          }}>
            Foto del producto <span style={{ color: '#F44336' }}>*</span>
          </label>
          <div style={{ 
            border: '2px dashed #e0e0e0', 
            borderRadius: 8, 
            padding: 20,
            textAlign: 'center',
            background: '#fafafa'
          }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'producto')}
              style={{ display: 'none' }}
              id="fotoProducto"
            />
            <label 
              htmlFor="fotoProducto" 
              style={{ 
                cursor: 'pointer',
                display: 'block'
              }}
            >
              {formulario.fotoProducto ? (
                <div>
                  <span style={{ fontSize: 40 }}>✅</span>
                  <p style={{ margin: '8px 0 0 0', color: '#28a745', fontWeight: 500 }}>
                    {formulario.fotoProducto.name}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#999' }}>
                    Haz clic para cambiar
                  </p>
                </div>
              ) : (
                <div>
                  <span style={{ fontSize: 40 }}>📸</span>
                  <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                    Haz clic para seleccionar una imagen
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#999' }}>
                    PNG, JPG (máx. 5MB)
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Foto de la Etiqueta */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ 
            display: 'block', 
            fontWeight: 600, 
            marginBottom: 8,
            color: '#333',
            fontSize: 15
          }}>
            Foto de la etiqueta del envío <span style={{ color: '#F44336' }}>*</span>
          </label>
          <div style={{ 
            border: '2px dashed #e0e0e0', 
            borderRadius: 8, 
            padding: 20,
            textAlign: 'center',
            background: '#fafafa'
          }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'etiqueta')}
              style={{ display: 'none' }}
              id="fotoEtiqueta"
            />
            <label 
              htmlFor="fotoEtiqueta" 
              style={{ 
                cursor: 'pointer',
                display: 'block'
              }}
            >
              {formulario.fotoEtiqueta ? (
                <div>
                  <span style={{ fontSize: 40 }}>✅</span>
                  <p style={{ margin: '8px 0 0 0', color: '#28a745', fontWeight: 500 }}>
                    {formulario.fotoEtiqueta.name}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#999' }}>
                    Haz clic para cambiar
                  </p>
                </div>
              ) : (
                <div>
                  <span style={{ fontSize: 40 }}>📦</span>
                  <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                    Haz clic para seleccionar una imagen
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#999' }}>
                    PNG, JPG (máx. 5MB)
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Botón Enviar */}
        <button
          onClick={enviarReclamo}
          disabled={enviando}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 8,
            border: 'none',
            background: enviando ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: 18,
            fontWeight: 600,
            cursor: enviando ? 'not-allowed' : 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => !enviando && (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {enviando ? 'Enviando...' : 'Enviar Reclamo'}
        </button>

        {/* Mensaje de confirmación/error */}
        {mensaje && (
          <div style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 8,
            background: mensaje.includes('✅') ? '#d4edda' : '#f8d7da',
            color: mensaje.includes('✅') ? '#155724' : '#721c24',
            textAlign: 'center',
            fontWeight: 500
          }}>
            {mensaje}
          </div>
        )}
      </div>
    </div>
  )
}
