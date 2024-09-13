import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../../firebaseConfig';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import MainLayout from '../layouts/MainLayout';
import { ProductoType } from '@/interfaces/ProductoType';
import { VariantType } from '@/interfaces/VariantType';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Link from 'next/link';
import Head from 'next/head';

export default function Admin() {
  const [productos, setProductos] = useState<ProductoType[]>([]);
  const [nuevoProducto, setNuevoProducto] = useState<Partial<ProductoType>>({
    nombre: '',
    descripcion: '',
    precio: 0,
    imagen: '',
    category: '',
    stock: 0,
    variants: []
  });
  const [nuevaVariante, setNuevaVariante] = useState<Partial<VariantType>>({
    size: '',
    color: '',
    stock: 0
  });
  const [editandoProducto, setEditandoProducto] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [imagenProducto, setImagenProducto] = useState<File | null>(null);
  const router = useRouter();
  const [productoAEliminar, setProductoAEliminar] = useState<string | null>(null);
  const [filtro, setFiltro] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 10;

  const CATEGORIES = ['accesorios_auto', 'accesorios_camaras', 'celulares', 'computacion', 'mascotas_accesorios'];

  const formatCategoryName = (category: string) => {
    return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      if (user) {
        setIsLoggedIn(true);
        cargarProductos();
      } else {
        setIsLoggedIn(false);
      }
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error('Error al iniciar sesión. Por favor, verifica tus credenciales.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error al cerrar sesión. Por favor, intenta nuevamente.');
    }
  };

  const cargarProductos = async () => {
    const productosCollection = collection(db, 'products');
    const productosSnapshot = await getDocs(productosCollection);

    const productosList = productosSnapshot.docs.map(doc => ({
      id: doc.id,
      nombre: doc.data().name,
      descripcion: doc.data().description,
      precio: parseFloat(doc.data().price),
      imagen: doc.data().image,
      category: doc.data().category,
      stock: doc.data().stock,
      variants: doc.data().variants && doc.data().variants.length > 0 ? doc.data().variants.map((variant: VariantType) => ({
        id: variant.id,
        size: variant.size,
        color: variant.color,
        stock: variant.stock
      })) : [] 
    }));

    setProductos(productosList);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevoProducto(prev => ({ ...prev, [name]: value }));
  };

  const handleVariantInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevaVariante((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImagenProducto(e.target.files[0]);
    }
  };

  const agregarVariante = () => {
    setNuevoProducto(prev => ({
      ...prev,
      variants: [...(prev.variants || []), { ...nuevaVariante, id: Date.now().toString() } as VariantType]
    }));
    setNuevaVariante({ size: '', color: '', stock: 0 });
  };

  const eliminarVariante = (variantId: string) => {
    setNuevoProducto(prev => ({
      ...prev,
      variants: prev.variants?.filter(v => v.id !== variantId)
    }));
  };

  const handleVariantChange = (index: number, field: keyof VariantType, value: string | number) => {
    setNuevoProducto(prev => ({
      ...prev,
      variants: prev.variants?.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      ) || []
    }));
  };

  const agregarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imagenUrl = '';
      if (imagenProducto) {
        const storageRef = ref(storage, `productos/${imagenProducto.name}`);
        await uploadBytes(storageRef, imagenProducto);
        imagenUrl = await getDownloadURL(storageRef);
      }

      const productoData = {
        category: nuevoProducto.category,
        description: nuevoProducto.descripcion,
        image: imagenUrl || nuevoProducto.imagen, // Use existing image if no new image is uploaded
        name: nuevoProducto.nombre,
        price: nuevoProducto.precio ? nuevoProducto.precio.toString() : '0',
        stock: Number(nuevoProducto.stock),
        variants: nuevoProducto.variants && nuevoProducto.variants.length > 0 ? nuevoProducto.variants.map((variant: VariantType) => ({
          id: variant.id,
          size: variant.size,
          color: variant.color,
          stock: variant.stock
        })) : []
      };

      if (editandoProducto) {
        await updateDoc(doc(db, 'products', editandoProducto), productoData);
        toast.success('Producto actualizado exitosamente');
      } else {
        await addDoc(collection(db, 'products'), productoData);
        toast.success('Producto agregado exitosamente');
      }

      setNuevoProducto({
        nombre: '',
        descripcion: '',
        precio: 0,
        imagen: '',
        category: '',
        stock: 0,
        variants: []
      });
      setImagenProducto(null);
      setEditandoProducto(null);
      cargarProductos();
    } catch (error) {
      console.error("Error al agregar/editar producto: ", error);
      toast.error('Error al agregar/editar producto');
    }
  };

  const editarProducto = (id: string) => {
    const productoAEditar = productos.find(p => p.id === id);
    if (productoAEditar) {
      setNuevoProducto(productoAEditar);
      setEditandoProducto(id);
    }
  };

  const eliminarProducto = async () => {
    if (productoAEliminar) {
      try {
        await deleteDoc(doc(db, 'products', productoAEliminar));
        toast.success('Producto eliminado exitosamente');
        cargarProductos();
      } catch (error) {
        console.error("Error al eliminar producto: ", error);
        toast.error('Error al eliminar producto');
      }
      setProductoAEliminar(null);
    }
  };

  const productosFiltrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    producto.category.toLowerCase().includes(filtro.toLowerCase())
  );

  const indexOfLastProducto = paginaActual * productosPorPagina;
  const indexOfFirstProducto = indexOfLastProducto - productosPorPagina;
  const productosActuales = productosFiltrados.slice(indexOfFirstProducto, indexOfLastProducto);

  const paginar = (numeroPagina: number) => setPaginaActual(numeroPagina);

  return (
    <>
      <Head>
        <title>Panel de Administración | Nuestra Tienda</title>
        <meta name="description" content="Gestiona productos, pedidos y configuraciones de la tienda." />
      </Head>
      <MainLayout>
        <div className="max-w-6xl mx-auto p-4 relative">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <div className="flex-grow"></div>
            {isLoggedIn && (
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm ml-4"
              >
                Cerrar sesión
              </button>
            )}
          </div>
          
          {isLoggedIn ? (
            <div className="space-y-8">
              <form onSubmit={agregarProducto} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nombre">
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={nuevoProducto.nombre}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="descripcion">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={nuevoProducto.descripcion}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows={3}
                    required
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="precio">
                    Precio
                  </label>
                  <input
                    type="number"
                    id="precio"
                    name="precio"
                    value={nuevoProducto.precio}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                    Categoría
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={nuevoProducto.category}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {formatCategoryName(category)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="stock">
                    Stock
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={nuevoProducto.stock}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    min="0"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imagen">
                    Imagen del Producto
                  </label>
                  <input
                    type="file"
                    id="imagen"
                    name="imagen"
                    onChange={handleImageUpload}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    accept="image/*"
                  />
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2">Variantes</h3>
                  {nuevoProducto.variants && nuevoProducto.variants.map((variant, index) => (
                    <div key={variant.id} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={variant.size}
                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                        placeholder="Talla"
                        className="mr-2 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                      <input
                        type="text"
                        value={variant.color}
                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                        placeholder="Color"
                        className="mr-2 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value))}
                        placeholder="Stock"
                        className="mr-2 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        min="0"
                      />
                      <button
                        type="button"
                        onClick={() => eliminarVariante(variant.id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={nuevaVariante.size}
                      onChange={(e) => handleVariantInputChange(e)}
                      name="size"
                      placeholder="Talla"
                      className="mr-2 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                                        <input
                      type="text"
                      value={nuevaVariante.color}
                      onChange={(e) => handleVariantInputChange(e)}
                      name="color"
                      placeholder="Color"
                      className="mr-2 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    <input
                      type="number"
                      value={nuevaVariante.stock}
                      onChange={(e) => handleVariantInputChange(e)}
                      name="stock"
                      placeholder="Stock"
                      className="mr-2 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      min="0"
                    />
                    <button
                      type="button"
                      onClick={agregarVariante}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Agregar Variante
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {editandoProducto ? 'Actualizar Producto' : 'Agregar Producto'}
                </button>
              </form>

              <div>
                <h2 className="text-2xl font-bold mb-4">Productos existentes</h2>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="p-2 mb-4 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 border-b border-gray-300 bg-gray-100 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-3 border-b border-gray-300 bg-gray-100 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                        <th className="px-6 py-3 border-b border-gray-300 bg-gray-100 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                        <th className="px-6 py-3 border-b border-gray-300 bg-gray-100 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 border-b border-gray-300 bg-gray-100 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosActuales.length > 0 ? (
                        productosActuales.map((producto) => (
                          <tr key={producto.id}>
                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-300">{producto.nombre}</td>
                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-300">${producto.precio.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-300">{producto.category}</td>
                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-300">{producto.stock}</td>
                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-300">
                              <button
                                onClick={() => editarProducto(producto.id)}
                                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2 text-sm"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => setProductoAEliminar(producto.id)}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 border-b border-gray-300 text-center">
                            No se encontraron productos
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {productosFiltrados.length > productosPorPagina && (
                  <div className="mt-4 flex justify-center">
                    {Array.from({ length: Math.ceil(productosFiltrados.length / productosPorPagina) }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => paginar(i + 1)}
                        className={`mx-1 px-3 py-1 border rounded ${
                          paginaActual === i + 1 ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 hover:bg-blue-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal de confirmación */}
              {productoAEliminar && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
                  <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                    <div className="mt-3 text-center">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Confirmar eliminación</h3>
                      <div className="mt-2 px-7 py-3">
                        <p className="text-sm text-gray-500">
                          ¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.
                        </p>
                      </div>
                      <div className="items-center px-4 py-3">
                        <button
                          id="ok-btn"
                          className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                          onClick={eliminarProducto}
                        >
                          Eliminar
                        </button>
                        <button
                          id="cancel-btn"
                          className="mt-3 px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                          onClick={() => setProductoAEliminar(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <h2 className="text-2xl font-bold mb-4">Inicio de sesión</h2>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <button 
                onClick={handleLogin}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              >
                Iniciar sesión
              </button>
            </div>
          )}
        </div>
      </MainLayout>
    </>
  );
}