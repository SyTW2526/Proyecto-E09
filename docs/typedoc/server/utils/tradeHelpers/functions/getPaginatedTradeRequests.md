[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/utils/tradeHelpers](../README.md) / getPaginatedTradeRequests

# Function: getPaginatedTradeRequests()

> **getPaginatedTradeRequests**(`filter`, `page`, `limit`): `Promise`\<\{ `page`: `number`; `requests`: `Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps`, \{ \}, \{ `timestamps`: `true`; \}\> & `object` & `DefaultTimestampProps` & `object` & `object`[]; `resultsPerPage`: `number`; `totalPages`: `number`; `totalResults`: `number`; \}\>

Defined in: [src/server/utils/tradeHelpers.ts:94](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/utils/tradeHelpers.ts#L94)

Obtiene solicitudes de intercambio con paginación

## Parameters

### filter

`FilterQuery`\<`Model`\<`object` & `DefaultTimestampProps`, \{ \}, \{ \}, \{ \}, `Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps`, \{ \}, \{ `timestamps`: `true`; \}\> & `object` & `DefaultTimestampProps` & `object` & `object`, `Schema`\<`any`, `Model`\<`any`, `any`, `any`, `any`, `any`, `any`\>, \{ \}, \{ \}, \{ \}, \{ \}, \{ `timestamps`: `true`; \}, `object` & `DefaultTimestampProps`, `Document`\<`unknown`, \{ \}, `FlatRecord`\<`object` & `DefaultTimestampProps`\>, \{ \}, `ResolveSchemaOptions`\<\{ `timestamps`: `true`; \}\>\> & `FlatRecord`\<`object` & `DefaultTimestampProps`\> & `object` & `object`\>\>\>

Filtros de búsqueda

### page

`number` = `1`

Página actual

### limit

`number` = `20`

Resultados por página

## Returns

`Promise`\<\{ `page`: `number`; `requests`: `Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps`, \{ \}, \{ `timestamps`: `true`; \}\> & `object` & `DefaultTimestampProps` & `object` & `object`[]; `resultsPerPage`: `number`; `totalPages`: `number`; `totalResults`: `number`; \}\>

Objeto con solicitudes y metadatos de paginación
