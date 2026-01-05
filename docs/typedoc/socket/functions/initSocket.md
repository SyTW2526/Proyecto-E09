[**proyecto-e09 v1.0.0**](../../README.md)

***

[proyecto-e09](../../modules.md) / [socket](../README.md) / initSocket

# Function: initSocket()

> **initSocket**(): `any`

Defined in: [src/client/socket.ts:41](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/client/socket.ts#L41)

**`Function`**

Inicializa la conexión Socket.io con autenticación JWT
Se conecta a http://localhost:3000 usando WebSocket

## Returns

`any`

Instancia del socket o null si no hay token

## Throws

Si hay problemas en la conexión

## Example

```ts
const socket = initSocket();
if (socket) {
  socket.on('connect', () => console.log('Conectado'));
}
```
