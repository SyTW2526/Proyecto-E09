[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/utils/tradeHelpers](../README.md) / getTradeByRoomCode

# Function: getTradeByRoomCode()

> **getTradeByRoomCode**(`roomCode`): `Promise`\<`Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps`, \{ \}, \{ `timestamps`: `true`; \}\> & `object` & `DefaultTimestampProps` & `object` & `object` \| `null`\>

Defined in: [src/server/utils/tradeHelpers.ts:33](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/utils/tradeHelpers.ts#L33)

Obtiene un trade por código de sala con populate completo

## Parameters

### roomCode

`string`

Código de la sala privada

## Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps`, \{ \}, \{ `timestamps`: `true`; \}\> & `object` & `DefaultTimestampProps` & `object` & `object` \| `null`\>

Trade poblado o null
