[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/utils/responseHelpers](../README.md) / asyncHandler

# Function: asyncHandler()

> **asyncHandler**(`fn`): `RequestHandler`

Defined in: [src/server/utils/responseHelpers.ts:151](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/utils/responseHelpers.ts#L151)

Wrapper para manejar errores en async route handlers
Elimina la necesidad de try-catch en cada endpoint

## Parameters

### fn

(`req`, `res`, `next`) => `Promise`\<`any`\>

## Returns

`RequestHandler`

## Example

```ts
router.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  sendSuccess(res, users);
}));
```
