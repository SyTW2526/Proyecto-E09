[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [client/utils/responseHelpers](../README.md) / checkResponse

# Function: checkResponse()

> **checkResponse**(`response`, `errorMessage`): `Promise`\<`void`\>

Defined in: [src/client/utils/responseHelpers.ts:39](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/client/utils/responseHelpers.ts#L39)

Checks if a response is OK and throws an error if not

## Parameters

### response

`Response`

The Response object to check

### errorMessage

`string` = `'Request failed'`

Default error message if response has no error property

## Returns

`Promise`\<`void`\>

## Throws

Error with message from response data or default message

## Example

```typescript
const response = await fetch('/api/data');
await checkResponse(response, 'Failed to load data');
const data = await response.json();
```
