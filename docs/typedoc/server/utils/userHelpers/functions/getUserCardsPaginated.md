[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/utils/userHelpers](../README.md) / getUserCardsPaginated

# Function: getUserCardsPaginated()

> **getUserCardsPaginated**(`username`, `additionalFilter`, `options`): `Promise`\<\{ `cards?`: `undefined`; `error`: `string`; `limitNum?`: `undefined`; `pageNum?`: `undefined`; `statusCode`: `number`; `total?`: `undefined`; `totalPages?`: `undefined`; \} \| \{ `cards`: `Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps`, \{ \}, \{ `timestamps`: `true`; \}\> & `object` & `DefaultTimestampProps` & `object` & `object`[]; `error?`: `undefined`; `limitNum`: `number`; `pageNum`: `number`; `statusCode?`: `undefined`; `total`: `number`; `totalPages`: `number`; \}\>

Defined in: [src/server/utils/userHelpers.ts:104](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/utils/userHelpers.ts#L104)

NUEVA FUNCIÓN: Obtiene las cartas paginadas de un usuario con filtros
Consolida la lógica repetida de los 3 endpoints GET de usercard.ts

## Parameters

### username

`string`

Username del usuario

### additionalFilter

`Record`\<`string`, `any`\> = `{}`

### options

{ page, limit, forTrade? }

#### forTrade?

`any`

#### limit?

`any`

#### page?

`any`

## Returns

`Promise`\<\{ `cards?`: `undefined`; `error`: `string`; `limitNum?`: `undefined`; `pageNum?`: `undefined`; `statusCode`: `number`; `total?`: `undefined`; `totalPages?`: `undefined`; \} \| \{ `cards`: `Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps`, \{ \}, \{ `timestamps`: `true`; \}\> & `object` & `DefaultTimestampProps` & `object` & `object`[]; `error?`: `undefined`; `limitNum`: `number`; `pageNum`: `number`; `statusCode?`: `undefined`; `total`: `number`; `totalPages`: `number`; \}\>
