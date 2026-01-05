[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/utils/socketHelpers](../README.md) / emitMultipleToUser

# Function: emitMultipleToUser()

> **emitMultipleToUser**(`io`, `userId`, `events`): `void`

Defined in: [src/server/utils/socketHelpers.ts:44](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/utils/socketHelpers.ts#L44)

Emite múltiples eventos a la sala privada de un usuario

## Parameters

### io

`any`

Instancia de Socket.io

### userId

ID del usuario (ObjectId o string)

`string` | `ObjectId`

### events

`object`[]

Array de objetos { eventName, data }

## Returns

`void`

## Example

```ts
emitMultipleToUser(req.io, friend._id, [
  { eventName: 'notification', data: notification },
  { eventName: 'friendRequestReceived', data: requestData }
]);
```
