[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/utils/tradeHelpers](../README.md) / getPaginatedTrades

# Function: getPaginatedTrades()

> **getPaginatedTrades**(`filter`, `page`, `limit`): `Promise`\<\{ `page`: `number`; `resultsPerPage`: `number`; `totalPages`: `number`; `totalResults`: `number`; `trades`: `Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps`, \{ \}, \{ `timestamps`: `true`; \}\> & `object` & `DefaultTimestampProps` & `object` & `object`[]; \}\>

Defined in: [src/server/utils/tradeHelpers.ts:48](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/utils/tradeHelpers.ts#L48)

Obtiene trades con paginación y filtros

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

`Promise`\<\{ `page`: `number`; `resultsPerPage`: `number`; `totalPages`: `number`; `totalResults`: `number`; `trades`: `Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps`, \{ \}, \{ `timestamps`: `true`; \}\> & `object` & `DefaultTimestampProps` & `object` & `object`[]; \}\>

Objeto con trades y metadatos de paginación
