[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/services/cards](../README.md) / upsertCardFromRaw

# Function: upsertCardFromRaw()

> **upsertCardFromRaw**(`raw`): `Promise`\<`Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps`, \{ \}, \{ `collection`: `string`; `discriminatorKey`: `string`; `timestamps`: `true`; \}\> & `object` & `DefaultTimestampProps` & `object` & `object` \| `Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps` & `object`, \{ \}, \{ \}\> & `object` & `DefaultTimestampProps` & `object` & `object` & `object` \| `Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps` & `object`, \{ \}, \{ \}\> & `object` & `DefaultTimestampProps` & `object` & `object` & `object` \| `Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps` & `object`, \{ \}, \{ \}\> & `object` & `DefaultTimestampProps` & `object` & `object` & `object` \| `null`\>

Defined in: [src/server/services/cards.ts:91](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/services/cards.ts#L91)

Inserta/actualiza una carta a partir del objeto crudo devuelto por la API externa.
Devuelve el documento guardado en la colección especializada (PokemonCard/TrainerCard/EnergyCard)
o en `Card` como fallback.

## Parameters

### raw

`any`

Objeto raw de la API TCGdex

## Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps`, \{ \}, \{ `collection`: `string`; `discriminatorKey`: `string`; `timestamps`: `true`; \}\> & `object` & `DefaultTimestampProps` & `object` & `object` \| `Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps` & `object`, \{ \}, \{ \}\> & `object` & `DefaultTimestampProps` & `object` & `object` & `object` \| `Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps` & `object`, \{ \}, \{ \}\> & `object` & `DefaultTimestampProps` & `object` & `object` & `object` \| `Document`\<`unknown`, \{ \}, `object` & `DefaultTimestampProps` & `object`, \{ \}, \{ \}\> & `object` & `DefaultTimestampProps` & `object` & `object` & `object` \| `null`\>

Documento guardado en MongoDB o null si falla
