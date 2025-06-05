import fetch from 'node-fetch';

// Capturo lo que escribo en la terminal: método, recurso y argumentos
const [,, method, fullResource, ...args] = process.argv;

// Dirección base de la API con la que estuve trabajando
const BASE_URL = 'https://fakestoreapi.com';

async function main() {
  // Verifico que se hayan pasado al menos el método y el recurso
  if (!method || !fullResource) {
    console.log('Por favor, escribí: <METHOD> <RESOURCE> [args]');
    return;
  }

  // Separo el recurso y el ID si hay uno
  const [resource, id] = fullResource.split('/');
  const url = `${BASE_URL}/${resource}${id ? '/' + id : ''}`;

  try {
    let response;

    switch (method.toUpperCase()) {
      case 'GET':
        // Si escribí GET, hago una consulta
        response = await fetch(url);
        break;

      case 'POST':
        // Solo permito crear productos
        if (resource !== 'products') {
          console.log('POST solo está disponible para "products"');
          return;
        }

        const [title, price, category] = args;
        if (!title || !price || !category) {
          console.log('Para crear un producto necesito: <title> <price> <category>');
          return;
        }

        // Armo el producto nuevo con los datos que pasé
        const newProduct = {
          title,
          price: parseFloat(price),
          category
        };

        // Envío la solicitud POST con el producto
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProduct)
        });
        break;

      case 'DELETE':
        // Para borrar, necesito que se indique el ID
        if (!id) {
          console.log('Para borrar un producto, usá: DELETE products/<productId>');
          return;
        }

        response = await fetch(url, { method: 'DELETE' });
        break;

      default:
        console.log(`El método "${method}" no está soportado.`);
        return;
    }

    // Intento mostrar la respuesta de forma clara
    const text = await response.text();
    console.log('Respuesta de la API (sin procesar):', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    printResponse(data);

  } catch (error) {
    console.error('Ocurrió un error al hacer la solicitud:', error.message);
  }
}

function printResponse(data) {
  if (!data) {
    console.log('La acción se completó, pero no hay datos para mostrar.');
    return;
  }

  if (Array.isArray(data)) {
    console.log('Lista de productos recibidos:');
    data.forEach(({ id, title, price }) => {
      console.log(`[${id}] ${title} - $${price}`);
    });
  } else if (data.title) {
    const { id, title, price, category, description } = data;
    console.log(`Producto #${id}`);
    console.log(`Título: ${title}`);
    console.log(`Precio: $${price}`);
    console.log(`Categoría: ${category}`);
    if (description) console.log(`Descripción: ${description.substring(0, 100)}...`);
  } else if (data.id) {
    console.log(`Producto con ID ${data.id} eliminado (simulado por la API).`);
  } else {
    console.log('Respuesta procesada:', data);
  }
}

// Ejecuto todo
main();
