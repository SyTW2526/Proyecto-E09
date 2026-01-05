[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [client/utils/responseHelpers](../README.md) / safeJsonParse

# Function: safeJsonParse()

> **safeJsonParse**\<`T`\>(`response`): `Promise`\<`T`\>

Defined in: [src/client/utils/responseHelpers.ts:18](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/client/utils/responseHelpers.ts#L18)

Safely parses JSON from a Response, returning an empty object on failure

## Type Parameters

### T

`T` = `any`

## Parameters

### response

`Response`

The Response object to parse

## Returns

`Promise`\<`T`\>

Parsed JSON data or empty object

## Example

```typescript
const data = await safeJsonParse(response);
if (!response.ok) {
  throw new Error(data.error || 'Request failed');
}
```
