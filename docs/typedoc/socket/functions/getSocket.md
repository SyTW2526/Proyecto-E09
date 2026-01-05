[**proyecto-e09 v1.0.0**](../../README.md)

***

[proyecto-e09](../../modules.md) / [socket](../README.md) / getSocket

# Function: getSocket()

> **getSocket**(): `any`

Defined in: [src/client/socket.ts:134](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/client/socket.ts#L134)

**`Function`**

Obtiene la instancia global del socket
Debe usarse después de initSocket()

## Returns

`any`

Instancia del socket o null si no está inicializado

## Example

```ts
const socket = getSocket();
if (socket) {
  socket.emit('event', data);
}
```
