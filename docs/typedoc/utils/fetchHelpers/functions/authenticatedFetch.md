[**proyecto-e09 v1.0.0**](../../../README.md)

***

[proyecto-e09](../../../modules.md) / [utils/fetchHelpers](../README.md) / authenticatedFetch

# Function: authenticatedFetch()

> **authenticatedFetch**(`url`, `options?`): `Promise`\<`Response`\>

Defined in: [src/client/utils/fetchHelpers.ts:69](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/client/utils/fetchHelpers.ts#L69)

Realiza una petición fetch con autenticación automática

## Parameters

### url

`string`

URL completa o path relativo (se concatenará con API_BASE_URL)

### options?

[`AuthFetchOptions`](../interfaces/AuthFetchOptions.md) = `{}`

Opciones de fetch

## Returns

`Promise`\<`Response`\>

Respuesta HTTP

## Async

## Throws

Si la petición falla o el servidor retorna error

## Examples

```ts
// Con URL completa
const res = await authenticatedFetch('http://localhost:3000/users/me');
```

```ts
// Con path relativo
const res = await authenticatedFetch('/users/me');
```

```ts
// POST con body
const res = await authenticatedFetch('/trades', {
  method: 'POST',
  body: JSON.stringify({ cardId: '123' })
});
```
