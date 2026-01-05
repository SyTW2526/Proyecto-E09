[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/utils/mongoHelpers](../README.md) / validateObjectId

# Function: validateObjectId()

> **validateObjectId**(`id`, `res`, `fieldName`): `boolean`

Defined in: [src/server/utils/mongoHelpers.ts:13](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/utils/mongoHelpers.ts#L13)

Valida si un ID es un ObjectId válido de MongoDB

## Parameters

### id

`string`

El ID a validar

### res

`Response`

Objeto Response de Express para enviar error si es inválido

### fieldName

`string` = `'ID'`

Nombre del campo para el mensaje de error (por defecto 'ID')

## Returns

`boolean`

true si es válido, false si no lo es (y envía respuesta de error)
