[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/utils/socketHelpers](../README.md) / emitToUser

# Function: emitToUser()

> **emitToUser**(`io`, `userId`, `eventName`, `data`): `void`

Defined in: [src/server/utils/socketHelpers.ts:21](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/utils/socketHelpers.ts#L21)

Emite un evento a la sala privada de un usuario específico

## Parameters

### io

`any`

Instancia de Socket.io

### userId

ID del usuario (ObjectId o string)

`string` | `ObjectId`

### eventName

`string`

Nombre del evento a emitir

### data

`any`

Datos a enviar con el evento

## Returns

`void`

## Example

```ts
emitToUser(req.io, friend._id, 'notification', { message: 'Nueva solicitud' });
```
