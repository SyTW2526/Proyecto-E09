[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/utils/userHelpers](../README.md) / findFriendByIdentifier

# Function: findFriendByIdentifier()

> **findFriendByIdentifier**(`identifier`): `Promise`\<`Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps`, \{ \}, \{ `timestamps`: `true`; \}\> & `object` & `DefaultTimestampProps` & `object` & `object` \| `null`\>

Defined in: [src/server/utils/userHelpers.ts:168](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/utils/userHelpers.ts#L168)

Busca un amigo por ID o username (alias para findUserByIdentifier)
Se usa en endpoints de amigos para mayor claridad semántica

## Parameters

### identifier

`string`

ID de MongoDB o username

## Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps`, \{ \}, \{ `timestamps`: `true`; \}\> & `object` & `DefaultTimestampProps` & `object` & `object` \| `null`\>

Usuario encontrado o null
