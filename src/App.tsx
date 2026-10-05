/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BOTIQUÍN AL DÍA
 * Aplicación de gestión y control de vencimientos del botiquín del hogar.
 * 
 * Funciones Principales:
 * 1. Registrar producto con cantidad y fecha de vencimiento.
 * 2. Alerta de lo que vence en 30 días (y lo ya vencido).
 * 3. Lista de reposición para compras de farmacia.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ProductList } from './components/ProductList';
import { AlertSection } from './components/AlertSection';
import { RestockList } from './components/RestockList';
import { ProductFormModal } from './components/ProductFormModal';
import { BackupModal } from './components/BackupModal';
import { Toast, ToastMessage } from './components/Toast';
import { Product, RestockItem } from './types';
import { getDaysRemaining } from './utils/dateUtils';
import {
  getSavedProducts,
  saveProducts,
  getSavedRestockItems,
  saveRestockItems,
  clearAllStoredData,
} from './utils/storage';
import { ShieldCheck, Info } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [restockItems, setRestockItems] = useState<RestockItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modo Oscuro persistente
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('botiquin_dark_mode');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Efecto para sincronizar clase 'dark' en el elemento raíz HTML
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('botiquin_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('botiquin_dark_mode', 'false');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Navegación de pestañas: 'inventory' | 'alerts' | 'restock'
  const [activeTab, setActiveTab] = useState<'inventory' | 'alerts' | 'restock'>('inventory');

  // Estado del modal de producto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Estado del modal de respaldo
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Notificación tipo Toast
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({
      id: String(Date.now()),
      type,
      message,
    });
  };

  const handleRestoreBackup = (newProducts: Product[], newRestockItems: RestockItem[]) => {
    setProducts(newProducts);
    setRestockItems(newRestockItems);
    saveProducts(newProducts);
    saveRestockItems(newRestockItems);
  };

  const handleClearAllData = () => {
    clearAllStoredData();
    setProducts([]);
    setRestockItems([]);
    showToast('Se vaciaron todos los datos del botiquín 🗑️', 'info');
  };

  // Carga inicial desde localStorage
  useEffect(() => {
    const loadedProducts = getSavedProducts();
    const loadedRestock = getSavedRestockItems();
    setProducts(loadedProducts);
    setRestockItems(loadedRestock);
    setIsLoaded(true);
  }, []);

  // ⚠️ ATENCIÓN: Sincronización en localStorage
  // ERROR FRECUENTE: Guardar en localStorage antes de que termine la carga inicial
  // sobreescribiría los datos guardados con un array vacío.
  // Por eso usamos la bandera `isLoaded`.
  useEffect(() => {
    if (isLoaded) {
      saveProducts(products);
    }
  }, [products, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      saveRestockItems(restockItems);
    }
  }, [restockItems, isLoaded]);

  // Contadores para alertas y reposición
  const { expiredCount, expiringSoonCount } = useMemo(() => {
    let expired = 0;
    let expiringSoon = 0;

    products.forEach((p) => {
      const days = getDaysRemaining(p.expirationDate);
      if (days <= 0) {
        expired++;
      } else if (days <= 30) {
        expiringSoon++;
      }
    });

    return { expiredCount: expired, expiringSoonCount: expiringSoon };
  }, [products]);

  const pendingRestockCount = useMemo(() => {
    return restockItems.filter((item) => !item.isPurchased).length;
  }, [restockItems]);

  /**
   * 1. REGISTRAR O EDITAR PRODUCTO (Función 1 requerida)
   */
  const handleSaveProduct = (
    productData: Omit<Product, 'id' | 'createdAt'> & { id?: string }
  ) => {
    if (productData.id) {
      // Modo edición
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productData.id
            ? {
                ...p,
                name: productData.name,
                quantity: productData.quantity,
                unit: productData.unit,
                expirationDate: productData.expirationDate,
                category: productData.category,
                notes: productData.notes,
              }
            : p
        )
      );
      showToast(`Actualizado: ${productData.name}`);
    } else {
      // Modo creación: Generar ID único seguro
      const newProduct: Product = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `prod_${Date.now()}`,
        name: productData.name,
        quantity: productData.quantity,
        unit: productData.unit,
        expirationDate: productData.expirationDate,
        category: productData.category,
        notes: productData.notes,
        createdAt: new Date().toISOString(),
      };

      setProducts((prev) => [newProduct, ...prev]);

      // Verificar si vence en <= 30 días para avisar inmediatamente al usuario
      const daysRemaining = getDaysRemaining(productData.expirationDate);
      if (daysRemaining <= 0) {
        showToast(`⚠️ Alerta: "${productData.name}" ya está vencido. Considerá reponerlo.`, 'warning');
      } else if (daysRemaining <= 30) {
        showToast(`⚠️ Alerta: "${productData.name}" vence pronto (${daysRemaining} días).`, 'warning');
      } else {
        showToast(`Guardado en el botiquín: ${productData.name}`, 'success');
      }
    }
  };

  /**
   * Eliminar producto del botiquín
   */
  const handleDeleteProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (prod && confirm(`¿Deseas retirar "${prod.name}" del botiquín?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast(`Eliminado: ${prod.name}`, 'info');
    }
  };

  /**
   * 2. AGREGAR A LISTA DE REPOSICIÓN DESDE EL BOTIQUÍN (Conexión entre Función 2 y 3)
   */
  const handleAddToRestock = (
    product: Product,
    reason: 'vencido' | 'por_vencer' | 'agotado'
  ) => {
    // Evitar duplicar exactamente el mismo producto pendiente
    const existing = restockItems.find(
      (item) => !item.isPurchased && item.name.toLowerCase() === product.name.toLowerCase()
    );

    if (existing) {
      showToast(`"${product.name}" ya está en la lista de reposición.`, 'info');
      return;
    }

    const newItem: RestockItem = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `restock_${Date.now()}`,
      name: product.name,
      quantityNeeded: `1 ${product.unit.includes('caja') ? 'caja' : 'unidad / caja'}`,
      reason,
      isPurchased: false,
      originalProductId: product.id,
      addedAt: new Date().toISOString(),
    };

    setRestockItems((prev) => [newItem, ...prev]);
    showToast(`Sumado a la lista de farmacia: ${product.name}`, 'success');
  };

  /**
   * 3. AGREGAR ITEM MANUAL A LA LISTA DE REPOSICIÓN
   */
  const handleAddManualRestock = (
    name: string,
    quantityNeeded: string,
    reason: 'manual'
  ) => {
    const newItem: RestockItem = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `restock_${Date.now()}`,
      name,
      quantityNeeded,
      reason,
      isPurchased: false,
      addedAt: new Date().toISOString(),
    };
    setRestockItems((prev) => [newItem, ...prev]);
    showToast(`Agregado a la lista: ${name}`, 'success');
  };

  const handleTogglePurchased = (id: string) => {
    setRestockItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isPurchased: !item.isPurchased } : item
      )
    );
  };

  const handleDeleteRestockItem = (id: string) => {
    setRestockItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearPurchased = () => {
    setRestockItems((prev) => prev.filter((item) => !item.isPurchased));
    showToast('Lista de compras limpiada', 'info');
  };

  /**
   * Reingresar un ítem comprado al botiquín: abre el modal con el nombre cargado
   */
  const handleReenterToInventory = (item: RestockItem) => {
    setEditingProduct({
      id: '',
      name: item.name,
      quantity: 1,
      unit: 'caja',
      expirationDate: '',
      category: 'Analgésicos y antifebriles',
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans pb-12 transition-colors duration-200">
      {/* Cabecera Principal con Pestañas y Contadores */}
      <Header
        expiredCount={expiredCount}
        expiringSoonCount={expiringSoonCount}
        restockCount={pendingRestockCount}
        onOpenNewProduct={() => {
          setEditingProduct(null);
          setIsModalOpen(true);
        }}
        onOpenBackup={() => setIsBackupOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Contenido Principal */}
      <main className="max-w-4xl w-full mx-auto px-4 py-4 sm:py-6 flex-1">
        {activeTab === 'inventory' && (
          <ProductList
            products={products}
            onOpenNewProduct={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            onEditProduct={(p) => {
              setEditingProduct(p);
              setIsModalOpen(true);
            }}
            onDeleteProduct={handleDeleteProduct}
            onAddToRestock={handleAddToRestock}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertSection
            products={products}
            onAddToRestock={handleAddToRestock}
            onDeleteProduct={handleDeleteProduct}
            onEditProduct={(p) => {
              setEditingProduct(p);
              setIsModalOpen(true);
            }}
            onGoToRestock={() => setActiveTab('restock')}
          />
        )}

        {activeTab === 'restock' && (
          <RestockList
            items={restockItems}
            onTogglePurchased={handleTogglePurchased}
            onAddItem={handleAddManualRestock}
            onDeleteItem={handleDeleteRestockItem}
            onClearPurchased={handleClearPurchased}
            onReenterToInventory={handleReenterToInventory}
          />
        )}

        {/* Banner de buenas prácticas para el responsable del hogar */}
        <div className="mt-8 bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/60 rounded-2xl p-4 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-teal-950 dark:text-teal-100 flex items-center gap-1.5">
              <span>💊</span> Consejo de seguridad del botiquín familiar
            </p>
            <p className="text-teal-800/90 dark:text-teal-300/90 mt-0.5 leading-relaxed">
              Los medicamentos vencidos pierden eficacia y pueden volverse tóxicos.
              Nunca los deseches por el inodoro o desagüe. Acércalos a un punto limpio o farmacia para su disposición segura.
            </p>
          </div>
        </div>
      </main>

      {/* Modal para Registrar / Editar Producto */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
      />

      {/* Modal de Copias de Seguridad y Datos */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        products={products}
        restockItems={restockItems}
        onRestore={handleRestoreBackup}
        onClearAll={handleClearAllData}
        onShowToast={showToast}
      />

      {/* Notificaciones flotantes */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
