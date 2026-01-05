[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/utils/userHelpers](../README.md) / getCurrentUserOrFail

# Function: getCurrentUserOrFail()

> **getCurrentUserOrFail**(`userId`, `res?`): `Promise`\<`Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps`, \{ \}, \{ `timestamps`: `true`; \}\> & `object` & `DefaultTimestampProps` & `object` & `object` \| `null`\>

Defined in: [src/server/utils/userHelpers.ts:178](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/utils/userHelpers.ts#L178)

Obtiene el usuario autenticado actual o envía error 404

## Parameters

### userId

`any`

ID del usuario autenticado

### res?

`Response`\<`any`, `Record`\<`string`, `any`\>\>

Response object

## Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps`, \{ \}, \{ `timestamps`: `true`; \}\> & `object` & `DefaultTimestampProps` & `object` & `object` \| `null`\>

Usuario encontrado o null (respuesta enviada en caso de error)
