[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/utils/validationHelpers](../README.md) / validateUsernameOwnership

# Function: validateUsernameOwnership()

> **validateUsernameOwnership**(`reqUsername`, `paramUsername`): `boolean`

Defined in: [src/server/utils/validationHelpers.ts:63](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/utils/validationHelpers.ts#L63)

Valida que el usuario actual sea propietario del recurso

## Parameters

### reqUsername

`string`

Username del usuario autenticado (de req.username)

### paramUsername

`string`

Username del parámetro de ruta

## Returns

`boolean`

true si es propietario, false si no
