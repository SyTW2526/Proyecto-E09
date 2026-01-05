[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/utils/mongoHelpers](../README.md) / findUserFlexible

# Function: findUserFlexible()

> **findUserFlexible**(`identifier`): `Promise`\<`Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps`, \{ \}, \{ `timestamps`: `true`; \}\> & `object` & `DefaultTimestampProps` & `object` & `object` \| `null`\>

Defined in: [src/server/utils/mongoHelpers.ts:31](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/utils/mongoHelpers.ts#L31)

Busca un usuario de forma flexible (por username, email o ID)
Wrapper sobre findUserByUsernameOrEmail para uso consistente en routers

## Parameters

### identifier

`string`

Username, email o ID del usuario

## Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps`, \{ \}, \{ `timestamps`: `true`; \}\> & `object` & `DefaultTimestampProps` & `object` & `object` \| `null`\>

Usuario encontrado o null si no existe
