import fetch from 'node-fetch';

const [,, method, fullResource, ...args] = process.argv;
const BASE_URL = 'https://fakestoreapi.com';

async function main() {
  if (!method || !fullResource) {
    console.log('⚠️ Debes ingresar: <METHOD> <RESOURCE> [args]');
    return;
  }

  const [resource, id] = fullResource.split('/');
  const url = `${BASE_URL}/${resource}${id ? '/' + id : ''}`;

  try {
    let response;

    switch (method.toUpperCase()) {
      case 'GET':
        response = await fetch(url);
        break;

      case 'POST':
        if (resource !== 'products') {
          console.log('🔒 POST solo disponible para "products"');
          return;
        }

        const [title, price, category] = args;
        if (!title || !price || !category) {
          console.log('⚠️ Debes ingresar: <title> <price> <category>');
          return;
        }

        const newProduct = {
          title,
          price: parseFloat(price),
          category
        };

        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProduct)
        });
        break;

      case 'DELETE':
        if (!id) {
          console.log('⚠️ DELETE requiere: products/<productId>');
          return;
        }

        response = await fetch(url, { method: 'DELETE' });
        break;

      default:
        console.log(`❌ Método "${method}" no soportado.`);
        return;
    }

    //  Manejo de respuesta
    const text = await response.text();
    console.log('📥 Respuesta cruda:', text);  // útil para depuración

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    printResponse(data);

  } catch (error) {
    console.error('❌ Error al procesar la solicitud:', error.message);
  }
}

function printResponse(data) {
  if (!data) {
    console.log('✅ Acción completada, pero no hay datos para mostrar.');
    return;
  }

  if (Array.isArray(data)) {
    console.log('📦 Lista de productos:');
    data.forEach(({ id, title, price }) => {
      console.log(`• [${id}] ${title} - $${price}`);
    });
  } else if (data.title) {
    const { id, title, price, category, description } = data;
    console.log(`🛍️ Producto #${id}`);
    console.log(`Título: ${title}`);
    console.log(`Precio: $${price}`);
    console.log(`Categoría: ${category}`);
    if (description) console.log(`Descripción: ${description.substring(0, 100)}...`);
  } else if (data.id) {
    console.log(`🗑️ Producto con ID ${data.id} eliminado (simulado).`);
  } else {
    console.log('📄 Respuesta:', data);
  }
}

main();
