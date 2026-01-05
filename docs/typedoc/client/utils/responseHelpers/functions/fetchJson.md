[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [client/utils/responseHelpers](../README.md) / fetchJson

# Function: fetchJson()

> **fetchJson**\<`T`\>(`response`, `errorMessage`): `Promise`\<`T`\>

Defined in: [src/client/utils/responseHelpers.ts:62](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/client/utils/responseHelpers.ts#L62)

Fetches and parses JSON, handling errors gracefully

## Type Parameters

### T

`T` = `any`

## Parameters

### response

`Response`

The Response object

### errorMessage

`string` = `'Request failed'`

Default error message

## Returns

`Promise`\<`T`\>

Parsed JSON data

## Throws

Error if response is not OK

## Example

```typescript
const response = await fetch('/api/data');
const data = await fetchJson(response, 'Failed to load data');
```
