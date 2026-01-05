[**proyecto-e09 v1.0.0**](../../../README.md)

***

[proyecto-e09](../../../modules.md) / [services/tcgdx](../README.md) / sanitizeBriefCard

# Function: sanitizeBriefCard()

> **sanitizeBriefCard**\<`T`\>(`input`): `T`

Defined in: [src/server/services/tcgdx.ts:25](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/services/tcgdx.ts#L25)

Sanitiza objetos de tarjeta removiendo referencias circulares
Convierte el objeto a JSON y de vuelta a un objeto limpio

## Type Parameters

### T

`T` *extends* `Record`\<`string`, `any`\>

## Parameters

### input

`T`

Objeto de carta a sanitizar

## Returns

`T`

Objeto sanitizado sin referencias circulares

## Example

```ts
const sanitized = sanitizeBriefCard(rawCardData);
```
