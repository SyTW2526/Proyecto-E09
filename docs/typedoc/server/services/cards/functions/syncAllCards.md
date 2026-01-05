[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/services/cards](../README.md) / syncAllCards

# Function: syncAllCards()

> **syncAllCards**(): `Promise`\<`number`\>

Defined in: [src/server/services/cards.ts:42](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/services/cards.ts#L42)

Sincroniza todas las cartas desde la API externa hacia la base de datos local
Itera por todos los sets disponibles en TCGdex y guarda cada carta en su modelo específico

## Returns

`Promise`\<`number`\>

El número total de cartas procesadas

## Async

## Throws

Si hay problemas en la sincronización

## Example

```ts
const count = await syncAllCards();
console.log(`${count} cartas sincronizadas`);
```
