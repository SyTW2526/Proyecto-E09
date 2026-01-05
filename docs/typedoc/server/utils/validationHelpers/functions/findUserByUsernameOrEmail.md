[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/utils/validationHelpers](../README.md) / findUserByUsernameOrEmail

# Function: findUserByUsernameOrEmail()

> **findUserByUsernameOrEmail**(`identifier`): `Promise`\<`Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps`, \{ \}, \{ `timestamps`: `true`; \}\> & `object` & `DefaultTimestampProps` & `object` & `object` \| `null`\>

Defined in: [src/server/utils/validationHelpers.ts:18](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/utils/validationHelpers.ts#L18)

Busca un usuario por username o email

## Parameters

### identifier

`string`

Username o email del usuario

## Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps`, \{ \}, \{ `timestamps`: `true`; \}\> & `object` & `DefaultTimestampProps` & `object` & `object` \| `null`\>

Usuario encontrado o null
