[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/utils/userHelpers](../README.md) / findUserByIdentifier

# Function: findUserByIdentifier()

> **findUserByIdentifier**(`identifier`): `Promise`\<`Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps`, \{ \}, \{ `timestamps`: `true`; \}\> & `object` & `DefaultTimestampProps` & `object` & `object` \| `null`\>

Defined in: [src/server/utils/userHelpers.ts:19](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/utils/userHelpers.ts#L19)

Busca un usuario por ID o username

## Parameters

### identifier

`string`

ID de MongoDB o username del usuario

## Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps`, \{ \}, \{ `timestamps`: `true`; \}\> & `object` & `DefaultTimestampProps` & `object` & `object` \| `null`\>

Usuario encontrado o null
