[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/utils/tradeHelpers](../README.md) / getPopulatedTradeRequest

# Function: getPopulatedTradeRequest()

> **getPopulatedTradeRequest**(`requestId`): `Promise`\<`Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps`, \{ \}, \{ `timestamps`: `true`; \}\> & `object` & `DefaultTimestampProps` & `object` & `object` \| `null`\>

Defined in: [src/server/utils/tradeHelpers.ts:81](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/utils/tradeHelpers.ts#L81)

Obtiene una solicitud de intercambio con populate completo

## Parameters

### requestId

`string`

ID de la solicitud

## Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps`, \{ \}, \{ `timestamps`: `true`; \}\> & `object` & `DefaultTimestampProps` & `object` & `object` \| `null`\>

TradeRequest poblado o null
